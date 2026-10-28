/* eslint-disable -- vendored from the Mody plugin's a11y-checker; kept ES5 and close to upstream. */
/*!
 * a11y-self-check.js: in-page accessibility self-check, vendored into
 * rbg-ui from the Mody plugin's a11y-checker skill. Vanilla JS, no
 * dependencies, no network. Companion to references/self-validation-checklist.md.
 *
 * WHAT IT IS
 *   The rendered-page half of the self-validation checklist. The static
 *   scanner (scripts/audit-a11y.py) reads source text. This script runs
 *   inside the page that actually renders, so it sees what the static
 *   scanner can't: computed colors (var(...) resolved), open shadow roots
 *   created at runtime, real tabindex values, the real sequential focus
 *   order, element sizes, and how the component's own JS answers key presses.
 *
 * HOW TO USE IN THIS REPO
 *   - Automated: playwright/tests/a11y.spec.js injects this file into every
 *     screen x state (/?tab=&sub=&state=&mode=, with
 *     window.A11Y_SELF_CHECK_HEADLESS = true, so no floating UI is mounted),
 *     runs it with { root: '#rbg', reflow: false } and fails on HIGH-impact
 *     "fail" results.
 *   - By hand: with `npm run dev` open, paste this file into the DevTools
 *     console (or load it via a temporary <script> in index.html, never
 *     committed). Click the floating "A11y" button, then "Run checks";
 *     "Copy report" copies the text report. "Record keyboard walk" logs
 *     every focus change while a person presses real keys — the evidence
 *     for the "verify live" items.
 *   Console API: await A11ySelfCheck.run({ root, reflow }) returns
 *   { results, report }; each result is { section, sc, check, status
 *   ("pass" | "fail" | "manual"), impact ("HIGH" | "MEDIUM" | "LOW" | ""),
 *   detail, elements }. The Playwright spec passes { reflow: false }: the
 *   panel's reflow is verified by the shrunk project (1024×640 window with the 1600 preset) instead of
 *   the generic 320px probe, which measures a page, not an embedded panel.
 *   A11ySelfCheck.startWalk() / stopWalk() / walkLog() work too.
 *
 * LIMITS (this is a helper, not a certification)
 *   - Script-dispatched KeyboardEvents are "untrusted": they reach the
 *     component's own keydown listeners, but they don't trigger browser
 *     default actions (Tab moving focus, Space checking a native checkbox,
 *     arrows moving between native radios). So the key probe tests the
 *     component's JS, and the Tab order is computed. A real key press
 *     (keyboard walk) is still what confirms "verify live" items.
 *   - Closed shadow roots are invisible to it.
 *   - Accessible-name computation is a simplified subset of accname 1.2.
 *   - It does nothing to replace a screen-reader pass.
 */
(function () {
  'use strict';
  if (window.A11ySelfCheck) return;
  // Don't boot inside the copies this script makes for the reflow checks.
  var IS_PROBE_FRAME = window.name && window.name.indexOf('a11y-probe') === 0;

  // -------------------------------------------------------------------------
  // Tree helpers (open shadow roots included)
  // -------------------------------------------------------------------------
  var PANEL_ID = 'a11y-self-check-panel';

  function isOwnUI(el) {
    for (var n = el; n; n = n.parentNode || n.host) {
      if (n.id === PANEL_ID) return true;
    }
    return false;
  }

  function allElements(root) {
    var out = [];
    (function walk(node) {
      var kids = node.children || [];
      for (var i = 0; i < kids.length; i++) {
        var el = kids[i];
        if (el.id === PANEL_ID) continue;
        if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'TEMPLATE') continue;
        out.push(el);
        if (el.shadowRoot) walk(el.shadowRoot);
        walk(el);
      }
    })(root);
    return out;
  }

  function parentOf(el) {
    if (el.assignedSlot) return el.assignedSlot;
    if (el.parentElement) return el.parentElement;
    var r = el.parentNode;
    return r && r.host ? r.host : null;
  }

  function deepActive() {
    var a = document.activeElement;
    while (a && a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
    return a;
  }

  function isHidden(el) {
    for (var n = el; n && n.nodeType === 1; n = parentOf(n)) {
      if (n.hidden || n.inert) return true;
      if (n.getAttribute('aria-hidden') === 'true') return true;
      var cs = getComputedStyle(n);
      if (cs.display === 'none') return true;
      if (n === el && (cs.visibility === 'hidden' || cs.visibility === 'collapse')) return true;
    }
    var r = el.getBoundingClientRect();
    return r.width === 0 && r.height === 0 && getComputedStyle(el).display !== 'contents';
  }

  function describe(el) {
    if (!el || el.nodeType !== 1) return String(el);
    var s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    var role = el.getAttribute('role');
    if (role) s += '[role="' + role + '"]';
    var cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
    if (cls.length) s += '.' + cls.join('.');
    var root = el.getRootNode();
    if (root && root.host) s = describe(root.host) + ' >>> ' + s;
    var name = accName(el);
    if (name) s += ' "' + name.slice(0, 40) + '"';
    return s;
  }

  // -------------------------------------------------------------------------
  // Accessible name (simplified accname: enough for component checks)
  // -------------------------------------------------------------------------
  function byIdInRoot(el, id) {
    var root = el.getRootNode();
    return root.getElementById ? root.getElementById(id) : document.getElementById(id);
  }

  function textOf(node, depth) {
    if (depth > 6) return '';
    if (node.nodeType === 3) return node.textContent;
    if (node.nodeType !== 1) return '';
    if (node.getAttribute('aria-hidden') === 'true') return '';
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return '';
    if (node.tagName === 'IMG' || node.getAttribute('role') === 'img')
      return node.getAttribute('alt') || node.getAttribute('aria-label') || '';
    if (node.tagName === 'svg' || node.tagName === 'SVG') {
      var t = node.querySelector('title');
      return node.getAttribute('aria-label') || (t ? t.textContent : '');
    }
    if (node.getAttribute('aria-label')) return node.getAttribute('aria-label');
    if (node.tagName === 'SLOT') {
      return node
        .assignedNodes({ flatten: true })
        .map(function (n) {
          return textOf(n, depth + 1);
        })
        .join(' ');
    }
    var src = node.shadowRoot ? node.shadowRoot.childNodes : node.childNodes;
    var s = '';
    for (var i = 0; i < src.length; i++) s += ' ' + textOf(src[i], depth + 1);
    return s;
  }

  function clean(s) {
    return (s || '').replace(/\s+/g, ' ').trim();
  }

  function accName(el) {
    var lb = el.getAttribute('aria-labelledby');
    if (lb) {
      var parts = lb.split(/\s+/).map(function (id) {
        var t = byIdInRoot(el, id);
        return t ? textOf(t, 0) : '';
      });
      var n = clean(parts.join(' '));
      if (n) return n;
    }
    if (clean(el.getAttribute('aria-label'))) return clean(el.getAttribute('aria-label'));
    if (el.labels && el.labels.length) {
      return clean(
        Array.prototype.map
          .call(el.labels, function (l) {
            return textOf(l, 0);
          })
          .join(' '),
      );
    }
    if (el.tagName === 'IMG' || el.tagName === 'AREA') return clean(el.getAttribute('alt'));
    if (el.tagName === 'INPUT' && /^(submit|reset|button)$/.test(el.type)) return clean(el.value);
    var role = el.getAttribute('role');
    var nameFromContent =
      /^(BUTTON|A|SUMMARY|OPTION|TD|TH|LEGEND|CAPTION|H[1-6])$/.test(el.tagName) ||
      /^(button|link|tab|menuitem|menuitemradio|menuitemcheckbox|option|radio|checkbox|switch|treeitem|cell|heading|tooltip)$/.test(
        role || '',
      );
    if (nameFromContent) {
      var c = clean(textOf(el, 0));
      if (c) return c;
    }
    return clean(el.getAttribute('title') || el.getAttribute('placeholder') || '');
  }

  // -------------------------------------------------------------------------
  // Focusability and sequential focus order
  // -------------------------------------------------------------------------
  var NATIVE_INTERACTIVE =
    "a[href],button,input:not([type=hidden]),select,textarea,summary,[contenteditable=''],[contenteditable=true],audio[controls],video[controls],iframe";
  var WIDGET_ROLES =
    /^(button|link|checkbox|radio|switch|tab|menuitem|menuitemradio|menuitemcheckbox|option|combobox|slider|spinbutton|textbox|searchbox|treeitem|gridcell|row)$/;
  var COMPOSITE_ROLES = /^(listbox|menu|menubar|tablist|radiogroup|tree|treegrid|grid|toolbar)$/;
  var ITEM_ROLES = /^(option|menuitem|menuitemradio|menuitemcheckbox|tab|radio|treeitem|gridcell|row|button|checkbox)$/;

  function isDisabled(el) {
    if (el.disabled) return true;
    if (el.getAttribute('aria-disabled') === 'true') return false; // still focusable by design
    var fs = el.closest && el.closest('fieldset[disabled]');
    return !!fs;
  }

  function isInteractive(el) {
    if (el.matches(NATIVE_INTERACTIVE)) return true;
    var role = el.getAttribute('role');
    return !!(role && WIDGET_ROLES.test(role));
  }

  function tabIndexOf(el) {
    return el.tabIndex;
  }

  function isTabbable(el) {
    if (isHidden(el) || isDisabled(el)) return false;
    if (el.shadowRoot && el.shadowRoot.delegatesFocus) return false; // its inner control counts instead
    if (el.hasAttribute('tabindex')) return tabIndexOf(el) >= 0;
    if (el.matches(NATIVE_INTERACTIVE)) {
      if (el.tagName === 'A' && !el.hasAttribute('href')) return false;
      return true;
    }
    return false;
  }

  function focusOrder(root) {
    // HTML sequential focus navigation, simplified: each shadow root is its
    // own scope, inserted where its host sits; positive tabindex goes first
    // inside each scope.
    function scope(node) {
      var items = [];
      (function walk(n) {
        var kids = n.children || [];
        for (var i = 0; i < kids.length; i++) {
          var el = kids[i];
          if (el.id === PANEL_ID || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
          if (el.tagName === 'SLOT') {
            el.assignedElements({ flatten: true }).forEach(function (a) {
              items.push({ el: a, sub: null, ti: 0, pre: isTabbable(a) });
              walk(a);
            });
            continue;
          }
          var entry = { el: el, ti: el.hasAttribute('tabindex') ? tabIndexOf(el) : 0, tabbable: isTabbable(el) };
          if (el.shadowRoot) {
            entry.sub = scope(el.shadowRoot);
            items.push(entry);
            continue; // light children are reached through slots
          }
          items.push(entry);
          walk(el);
        }
      })(node);
      var positive = items
        .filter(function (x) {
          return x.ti > 0 && x.tabbable;
        })
        .sort(function (a, b) {
          return a.ti - b.ti;
        });
      var normal = items.filter(function (x) {
        return !(x.ti > 0 && x.tabbable);
      });
      var out = [];
      positive.concat(normal).forEach(function (x) {
        if (x.tabbable || x.pre) out.push(x.el);
        if (x.sub) out = out.concat(x.sub);
      });
      return out;
    }
    var seen = new Set();
    return scope(root).filter(function (el) {
      if (seen.has(el)) return false;
      seen.add(el);
      return true;
    });
  }

  // -------------------------------------------------------------------------
  // Color math (same constants as scripts/audit-a11y.py)
  // -------------------------------------------------------------------------
  function parseRGBA(str) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?\s*\)/i.exec(str || '');
    if (!m) return null;
    var a = m[4] === undefined ? 1 : m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
    return [+m[1], +m[2], +m[3], a];
  }
  function over(top, bottom) {
    var a = top[3];
    return [top[0] * a + bottom[0] * (1 - a), top[1] * a + bottom[1] * (1 - a), top[2] * a + bottom[2] * (1 - a), 1];
  }
  function wcagL(c) {
    function lin(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  }
  function ratio(a, b) {
    var l1 = wcagL(a),
      l2 = wcagL(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
  var AP = {
    trc: 2.4,
    r: 0.2126729,
    g: 0.7151522,
    b: 0.072175,
    nBG: 0.56,
    nTX: 0.57,
    rTX: 0.62,
    rBG: 0.65,
    bT: 0.022,
    bC: 1.414,
    sc: 1.14,
    off: 0.027,
    dMin: 0.0005,
    lo: 0.1,
  };
  function apcaY(c) {
    return (
      AP.r * Math.pow(c[0] / 255, AP.trc) + AP.g * Math.pow(c[1] / 255, AP.trc) + AP.b * Math.pow(c[2] / 255, AP.trc)
    );
  }
  function apca(txt, bg) {
    var t = apcaY(txt),
      b = apcaY(bg);
    t = t > AP.bT ? t : t + Math.pow(AP.bT - t, AP.bC);
    b = b > AP.bT ? b : b + Math.pow(AP.bT - b, AP.bC);
    if (Math.abs(b - t) < AP.dMin) return 0;
    var s;
    if (b > t) {
      s = (Math.pow(b, AP.nBG) - Math.pow(t, AP.nTX)) * AP.sc;
      return (s < AP.lo ? 0 : s - AP.off) * 100;
    }
    s = (Math.pow(b, AP.rBG) - Math.pow(t, AP.rTX)) * AP.sc;
    return (s > -AP.lo ? 0 : s + AP.off) * 100;
  }

  // Effective background behind an element: composite ancestors' background
  // colors bottom-up. Returns null when an image/gradient is in the way.
  function effectiveBg(el) {
    var layers = [];
    for (var n = el; n && n.nodeType === 1; n = parentOf(n)) {
      var cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      var c = parseRGBA(cs.backgroundColor);
      if (c && c[3] > 0) {
        layers.push(c);
        if (c[3] >= 1) break;
      }
    }
    var base = [255, 255, 255, 1];
    for (var i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  }

  function isLargeText(cs) {
    var px = parseFloat(cs.fontSize);
    var w = parseInt(cs.fontWeight, 10) || (cs.fontWeight === 'bold' ? 700 : 400);
    return px >= 24 || (px >= 18.66 && w >= 700);
  }
  function apcaMin(cs) {
    var px = parseFloat(cs.fontSize);
    var w = parseInt(cs.fontWeight, 10) || 400;
    if (px >= 36 || (px >= 24 && w >= 700)) return 45;
    if (px >= 24 || (px >= 16 && w >= 700)) return 60;
    if (px >= 18) return 75;
    return 90;
  }

  // -------------------------------------------------------------------------
  // CSSOM helpers (focus / hover rules, including shadow-root styles)
  // -------------------------------------------------------------------------
  function sheetsFor(el) {
    var root = el.getRootNode();
    var list = [];
    var src = root.styleSheets ? Array.prototype.slice.call(root.styleSheets) : [];
    if (root.adoptedStyleSheets) src = src.concat(root.adoptedStyleSheets);
    src.forEach(function (s) {
      try {
        if (s.ownerNode && isOwnUI(s.ownerNode)) return;
        list.push(s);
      } catch (e) {
        /* cross-origin */
      }
    });
    return list;
  }
  function eachRule(sheets, fn) {
    (function walk(rules) {
      for (var i = 0; i < rules.length; i++) {
        var r = rules[i];
        if (r.cssRules && !r.selectorText) {
          try {
            walk(r.cssRules);
          } catch (e) {}
          continue;
        }
        if (r.selectorText) fn(r);
      }
    })(
      sheets.reduce(function (acc, s) {
        try {
          return acc.concat(Array.prototype.slice.call(s.cssRules));
        } catch (e) {
          return acc;
        }
      }, []),
    );
  }
  function stripPseudo(sel, pseudo) {
    return (
      sel
        .replace(pseudo, '')
        .replace(/:host\(([^)]*)\)/g, '$1')
        .replace(/:host\b/g, '*')
        .trim() || '*'
    );
  }
  function rulesMatching(el, pseudoRe) {
    var hits = [];
    eachRule(sheetsFor(el), function (r) {
      r.selectorText.split(',').forEach(function (sel) {
        var base;
        if (pseudoRe) {
          if (!pseudoRe.test(sel)) return;
          base = stripPseudo(sel, new RegExp(pseudoRe.source, 'g'));
        } else {
          if (/:(focus|hover|active)/.test(sel)) return;
          base = stripPseudo(sel, /$^/);
        }
        // Match the element itself, or a :host rule applying to its host.
        try {
          if (el.matches(base)) hits.push(r);
        } catch (e) {
          /* unsupported selector */
        }
      });
    });
    return hits;
  }
  function declaresVisibleIndicator(style) {
    var o =
      style.getPropertyValue('outline') +
      ' ' +
      style.getPropertyValue('outline-style') +
      ' ' +
      style.getPropertyValue('outline-width');
    var bs = style.getPropertyValue('box-shadow');
    var bd =
      style.getPropertyValue('border') +
      style.getPropertyValue('border-color') +
      style.getPropertyValue('border-width');
    var bg = style.getPropertyValue('background') + style.getPropertyValue('background-color');
    var td = style.getPropertyValue('text-decoration');
    var outlineOk = o.trim() && !/\bnone\b/.test(o) && !/^0(px)?\b/.test(o.trim());
    return !!(outlineOk || (bs && bs !== 'none') || bd.trim() || td.trim() || bg.trim());
  }
  function removesOutline(style) {
    var o = (style.getPropertyValue('outline') + ' ' + style.getPropertyValue('outline-style')).trim();
    return /\bnone\b|^0(px)?\b/.test(o);
  }

  // -------------------------------------------------------------------------
  // Result collection
  // -------------------------------------------------------------------------
  var SECTIONS = {
    1: 'Page/document structure',
    2: 'Semantic markup (HTML and ARIA)',
    3: 'Content clarity',
    4: 'Keyboard navigation (mandatory)',
    5: 'Color and contrast',
    6: 'Forms and fields',
    7: 'Media',
    8: 'Responsive and zoom',
    9: 'Manual verification',
  };

  function Collector() {
    this.items = [];
  }
  Collector.prototype.add = function (section, sc, check, status, impact, detail, els) {
    this.items.push({
      section: section,
      sc: sc,
      check: check,
      status: status,
      impact: impact || '',
      detail: detail || '',
      elements: (els || []).map(describe),
    });
  };

  // -------------------------------------------------------------------------
  // Checks
  // -------------------------------------------------------------------------
  function checkStructure(C, els) {
    var heads = els
      .filter(function (e) {
        return /^H[1-6]$/.test(e.tagName) || e.getAttribute('role') === 'heading';
      })
      .filter(function (e) {
        return !isHidden(e);
      });
    if (!heads.length) {
      C.add(
        1,
        '2.4.6',
        "Internal headings fit the page's heading sequence",
        'n/a',
        '',
        'The component renders no headings.',
      );
    } else {
      var levels = heads.map(function (h) {
        return +(h.getAttribute('aria-level') || h.tagName.slice(1) || 2);
      });
      var skips = [];
      for (var i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) skips.push(heads[i]);
      var h1s = heads.filter(function (h, i) {
        return levels[i] === 1;
      });
      if (skips.length)
        C.add(
          1,
          '1.3.1 / 2.4.6',
          "Heading levels don't skip",
          'fail',
          'LOW',
          'Heading levels jump by more than one: ' + levels.join(' → '),
          skips,
        );
      else C.add(1, '1.3.1 / 2.4.6', "Heading levels don't skip", 'pass', '', 'Sequence: ' + levels.join(' → '));
      if (h1s.length)
        C.add(
          1,
          '2.4.6',
          "Component doesn't assume it owns the page's h1",
          'manual',
          'LOW',
          "The component renders an h1. Confirm the host page doesn't already have one, or make the level configurable.",
          h1s,
        );
    }
    var regions = els.filter(function (e) {
      return (
        e.tagName === 'DIALOG' ||
        /^(dialog|alertdialog|region|complementary|navigation|search|form)$/.test(e.getAttribute('role') || '')
      );
    });
    var unnamed = regions.filter(function (r) {
      return !accName(r);
    });
    var fakeRegions = els.filter(function (e) {
      if (e.getAttribute('role')) return false;
      var hint = ((e.getAttribute('class') || '') + ' ' + (e.id || '') + ' ' + e.tagName).toLowerCase();
      return /^(DIV|SECTION|ASIDE)$/.test(e.tagName) && /\b(modal|dialog|sheet|drawer|snackbar|toast)\b/.test(hint);
    });
    if (unnamed.length)
      C.add(
        1,
        '1.3.1 / 4.1.2',
        'Own regions (dialog, sheet, snackbar) are real, labeled landmarks',
        'fail',
        'MEDIUM',
        'These regions have no accessible name (add aria-labelledby pointing at the title, or aria-label).',
        unnamed,
      );
    if (fakeRegions.length)
      C.add(
        1,
        '1.3.1',
        'Own regions (dialog, sheet, snackbar) are real, labeled landmarks',
        'fail',
        'MEDIUM',
        'Looks like a dialog/sheet/toast, but it\'s a plain element with no role. Use <dialog>, role="dialog", or role="status"/"alert".',
        fakeRegions,
      );
    if (regions.length && !unnamed.length && !fakeRegions.length)
      C.add(
        1,
        '1.3.1 / 4.1.2',
        'Own regions (dialog, sheet, snackbar) are real, labeled landmarks',
        'pass',
        '',
        regions.length + ' region(s), all named.',
      );
  }

  var IMPLICIT = {
    BUTTON: 'button',
    A: 'link',
    NAV: 'navigation',
    UL: 'list',
    OL: 'list',
    LI: 'listitem',
    MAIN: 'main',
    HEADER: 'banner',
    FOOTER: 'contentinfo',
    DIALOG: 'dialog',
    SELECT: 'combobox',
    TEXTAREA: 'textbox',
    TABLE: 'table',
    FORM: 'form',
  };
  var INPUT_ROLE = {
    checkbox: 'checkbox',
    radio: 'radio',
    range: 'slider',
    button: 'button',
    submit: 'button',
    text: 'textbox',
    search: 'searchbox',
    email: 'textbox',
    number: 'spinbutton',
  };
  var REQUIRED_STATE = {
    checkbox: ['aria-checked'],
    radio: ['aria-checked'],
    switch: ['aria-checked'],
    combobox: ['aria-expanded'],
    tab: ['aria-selected'],
    option: ['aria-selected'],
    slider: ['aria-valuenow'],
    scrollbar: ['aria-valuenow'],
    heading: ['aria-level'],
    spinbutton: [],
  };

  function checkSemantics(C, els) {
    var redundant = els.filter(function (e) {
      var r = e.getAttribute('role');
      if (!r) return false;
      if (e.tagName === 'INPUT') return INPUT_ROLE[e.type] === r;
      if (e.tagName === 'A' && !e.hasAttribute('href')) return false;
      return IMPLICIT[e.tagName] === r;
    });
    if (redundant.length)
      C.add(
        2,
        '4.1.2',
        'No ARIA role stacked on a native element that already has it',
        'fail',
        'LOW',
        'Redundant role. Remove it: the native element already exposes this role.',
        redundant,
      );
    else C.add(2, '4.1.2', 'No ARIA role stacked on a native element that already has it', 'pass');

    var fakeButtons = els.filter(function (e) {
      if (e.matches(NATIVE_INTERACTIVE) || isHidden(e)) return false;
      var r = e.getAttribute('role');
      return (r === 'button' || r === 'link') && !e.hasAttribute('tabindex');
    });
    var missingState = els.filter(function (e) {
      var r = e.getAttribute('role');
      if (!r || !REQUIRED_STATE[r] || e.matches('input,select,textarea,h1,h2,h3,h4,h5,h6')) return false;
      return REQUIRED_STATE[r].some(function (a) {
        return !e.hasAttribute(a);
      });
    });
    var nativeFirst = els.filter(function (e) {
      var r = e.getAttribute('role');
      return (
        (r === 'button' || r === 'link' || r === 'checkbox' || r === 'radio') && /^(DIV|SPAN|LI|TD|P)$/.test(e.tagName)
      );
    });
    if (nativeFirst.length)
      C.add(
        2,
        '4.1.2',
        'Native elements used where one exists',
        'fail',
        'MEDIUM',
        'Generic elements imitate a native control. Prefer <button>, <a href>, <input type=checkbox|radio> (Pattern 2).',
        nativeFirst,
      );
    else C.add(2, '4.1.2', 'Native elements used where one exists', 'pass');
    if (fakeButtons.length)
      C.add(
        2,
        '2.1.1 / 4.1.2',
        'Custom widgets define role, keyboard, name and state',
        'fail',
        'HIGH',
        "role=button/link on a non-native element with no tabindex: keyboard can't reach it.",
        fakeButtons,
      );
    if (missingState.length)
      C.add(
        2,
        '4.1.2',
        'Custom widgets define role, keyboard, name and state',
        'fail',
        'HIGH',
        'Widget role without its required state attribute (' +
          missingState
            .map(function (e) {
              return e.getAttribute('role') + '→' + REQUIRED_STATE[e.getAttribute('role')].join('/');
            })
            .join(', ') +
          ').',
        missingState,
      );
    var unnamedWidgets = els.filter(function (e) {
      return (
        isInteractive(e) &&
        !isHidden(e) &&
        e.tagName !== 'IFRAME' &&
        !accName(e) &&
        !(e.tagName === 'INPUT' && e.type === 'hidden')
      );
    });
    if (unnamedWidgets.length)
      C.add(
        2,
        '4.1.2',
        'Every interactive element has an accessible name',
        'fail',
        'HIGH',
        'No accessible name. Screen readers announce only the role.',
        unnamedWidgets,
      );
    else C.add(2, '4.1.2', 'Every interactive element has an accessible name', 'pass');
    if (!fakeButtons.length && !missingState.length)
      C.add(2, '4.1.2', 'Custom widgets define role, keyboard, name and state', 'pass');
  }

  var VAGUE =
    /^(click here|here|more|read more|learn more|details|link|go|ok|aquí|acá|click acá|clic aquí|haz clic aquí|hacé clic acá|ver más|más|leer más|saber más|detalles|ir|clique aqui|aqui|ver mais|mais|saiba mais|detalhes)$/i;
  var SENSORY =
    /\b(on the (left|right)|above|below|the (red|green|blue|orange|round|square) (one|button|field)|in red|in green|(a|de) la (izquierda|derecha)|(de|en) (rojo|verde|azul|naranja)|el botón (de la derecha|de la izquierda|redondo)|arriba a la|abajo a la|à (esquerda|direita)|em (vermelho|verde|azul|laranja)|o botão (verde|da direita|da esquerda|redondo)|acima|abaixo)\b/i;

  function checkContent(C, els) {
    var vague = els.filter(function (e) {
      return (
        (e.tagName === 'A' || e.tagName === 'BUTTON' || /^(link|button)$/.test(e.getAttribute('role') || '')) &&
        VAGUE.test(accName(e))
      );
    });
    if (vague.length)
      C.add(
        3,
        '2.4.4',
        'Link/button names make sense on their own',
        'fail',
        'MEDIUM',
        'Generic name. Say where it goes or what it does ("See invoice details" instead of "See more").',
        vague,
      );
    else C.add(3, '2.4.4', 'Link/button names make sense on their own', 'pass');
    var sensory = els.filter(function (e) {
      if (e.children.length) return false;
      return SENSORY.test(e.textContent || '');
    });
    if (sensory.length)
      C.add(
        3,
        '1.3.3',
        "Instructions don't rely on shape, position or color",
        'manual',
        'MEDIUM',
        'This copy mentions position/color/shape. Check it still works without seeing the layout.',
        sensory,
      );
    else
      C.add(
        3,
        '1.3.3',
        "Instructions don't rely on shape, position or color",
        'pass',
        '',
        'No sensory-only wording detected (heuristic, English/Spanish/Portuguese).',
      );
    C.add(
      3,
      '3.1.5',
      'Rendered copy is plain language',
      'manual',
      'LOW',
      'Read labels, placeholders, helper and error text as an end user would. Is there any internal jargon?',
    );
  }

  function fire(el, key) {
    var ev = new KeyboardEvent('keydown', {
      key: key,
      code: key === ' ' ? 'Space' : key,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    el.dispatchEvent(ev);
    return ev;
  }

  function composites(els) {
    return els.filter(function (e) {
      return COMPOSITE_ROLES.test(e.getAttribute('role') || '') && !isHidden(e);
    });
  }
  function itemsOf(group) {
    return allElements(group).filter(function (e) {
      var r = e.getAttribute('role');
      return (
        ((r && ITEM_ROLES.test(r)) || e.matches('input[type=radio],input[type=checkbox],button')) &&
        !isHidden(e) &&
        !isDisabled(e)
      );
    });
  }

  function checkKeyboard(C, els, root) {
    var interactive = els.filter(function (e) {
      return isInteractive(e) && !isHidden(e) && !isDisabled(e);
    });
    var order = focusOrder(root).filter(function (e) {
      return els.indexOf(e) !== -1 || root === document;
    });
    var groups = composites(els);

    // The Fogo DS incident: controls pulled out of the Tab sequence with
    // tabindex="-1" and nothing else in their group left reachable.
    var unreachable = interactive.filter(function (e) {
      if (order.indexOf(e) !== -1) return false;
      if (e.shadowRoot && e.shadowRoot.delegatesFocus) return false;
      // Part of a roving-tabindex or activedescendant group that IS reachable?
      var group = null;
      for (var n = parentOf(e); n; n = parentOf(n))
        if (COMPOSITE_ROLES.test((n.getAttribute && n.getAttribute('role')) || '')) {
          group = n;
          break;
        }
      if (group) {
        if (group.hasAttribute('aria-activedescendant') && order.indexOf(group) !== -1) return false;
        if (
          itemsOf(group).some(function (i) {
            return order.indexOf(i) !== -1;
          })
        )
          return false;
      }
      // Native radio group: one radio in the same named group is enough.
      if (e.type === 'radio' && e.name) {
        var r = e.getRootNode();
        var mates = Array.prototype.slice.call(r.querySelectorAll('input[type=radio][name="' + e.name + '"]'));
        if (
          mates.some(function (m) {
            return order.indexOf(m) !== -1;
          })
        )
          return false;
      }
      return true;
    });
    if (unreachable.length)
      C.add(
        4,
        '2.1.1',
        'Tab reaches every interactive part',
        'fail',
        'HIGH',
        'Out of the Tab sequence with no reachable alternative (tabindex="-1", a missing tabindex, or a roving group with no item at tabindex="0"). This is the exact bug the mandatory keyboard section exists for.',
        unreachable,
      );
    else
      C.add(
        4,
        '2.1.1',
        'Tab reaches every interactive part',
        'pass',
        '',
        interactive.length + ' interactive element(s), all reachable (computed). Confirm with a real keyboard walk.',
      );

    var positive = order.filter(function (e) {
      return e.tabIndex > 0;
    });
    C.add(
      4,
      '2.4.3',
      'Tab order is logical',
      positive.length ? 'fail' : 'manual',
      positive.length ? 'MEDIUM' : '',
      (positive.length
        ? 'Positive tabindex reorders focus away from the DOM order; use 0 and fix the DOM order instead. '
        : '') +
        'Computed Tab order: ' +
        order
          .map(function (e, i) {
            return i + 1 + '. ' + describe(e);
          })
          .join(' | ') +
        '. Compare with the visual order.',
      positive,
    );

    // Arrow-key probe on composite widgets (tests the component's own JS).
    var probed = [];
    function probeGroup(g) {
      if (probed.indexOf(g) !== -1) return;
      probed.push(g);
      var items = itemsOf(g);
      if (items.length < 2) return;
      var nativeRadios = items.every(function (i) {
        return i.type === 'radio';
      });
      if (nativeRadios) {
        C.add(
          4,
          '2.1.1',
          'Arrow keys move focus between rows/options',
          'manual',
          '',
          "Native radios: the browser handles arrows, and script events can't simulate that. Verify in the keyboard walk.",
          [g],
        );
        return;
      }
      var usesActiveDesc = g.hasAttribute('aria-activedescendant');
      var start = usesActiveDesc
        ? g
        : items.filter(function (i) {
            return i.tabIndex >= 0;
          })[0] || items[0];
      try {
        start.focus();
      } catch (e) {}
      var before = usesActiveDesc ? g.getAttribute('aria-activedescendant') : deepActive();
      var horizontal =
        /^(tablist|menubar|toolbar)$/.test(g.getAttribute('role')) ||
        g.getAttribute('aria-orientation') === 'horizontal';
      fire(usesActiveDesc ? g : deepActive() || start, horizontal ? 'ArrowRight' : 'ArrowDown');
      var after = usesActiveDesc ? g.getAttribute('aria-activedescendant') : deepActive();
      var moved = after !== before;
      var endMoved = null;
      if (moved) {
        fire(usesActiveDesc ? g : deepActive(), 'End');
        var atEnd = usesActiveDesc ? g.getAttribute('aria-activedescendant') : deepActive();
        endMoved =
          atEnd !== after ||
          (usesActiveDesc ? atEnd === items[items.length - 1].id : atEnd === items[items.length - 1]);
      }
      C.add(
        4,
        '2.1.1',
        'Arrow keys move focus between rows/options',
        moved ? 'pass' : 'fail',
        moved ? '' : 'HIGH',
        moved
          ? 'Arrow moved focus (' +
              describe(before) +
              ' → ' +
              describe(after) +
              ').' +
              (endMoved === false ? ' End key did nothing: add Home/End support.' : '')
          : 'Pressing ' +
              (horizontal ? 'ArrowRight' : 'ArrowDown') +
              ' on ' +
              describe(start) +
              " didn't move focus. Add roving tabindex or aria-activedescendant handling.",
        [g],
      );
      try {
        start.focus();
      } catch (e) {}
    }
    groups.forEach(probeGroup);

    // Enter/Space on custom (non-native) buttons.
    var custom = interactive.filter(function (e) {
      return (
        !e.matches(NATIVE_INTERACTIVE) &&
        /^(button|link|checkbox|switch|tab|option|menuitem|radio)$/.test(e.getAttribute('role'))
      );
    });
    var dead = [];
    custom.forEach(function (e) {
      ['Enter', ' '].forEach(function (k) {
        if (k === 'Enter' || e.getAttribute('role') !== 'link') {
          var reacted = false;
          var mo = new MutationObserver(function () {
            reacted = true;
          });
          mo.observe(root === document ? document.body : root, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true,
          });
          var onClick = function () {
            reacted = true;
          };
          e.addEventListener('click', onClick, true);
          var snapshot = { ae: deepActive() };
          var ev = fire(e, k);
          if (ev.defaultPrevented || deepActive() !== snapshot.ae) reacted = true;
          mo.takeRecords().length && (reacted = true);
          mo.disconnect();
          e.removeEventListener('click', onClick, true);
          if (!reacted) dead.push(e.getAttribute('role') + ' ' + (k === ' ' ? 'Space' : k) + ' on ' + describe(e));
        }
      });
    });
    if (dead.length)
      C.add(
        4,
        '2.1.1',
        'Enter/Space activate the focused control',
        'fail',
        'HIGH',
        'No reaction (no click, no DOM change, no preventDefault): ' + dead.join('; '),
      );
    else
      C.add(
        4,
        '2.1.1',
        'Enter/Space activate the focused control',
        custom.length ? 'pass' : 'n/a',
        '',
        custom.length
          ? custom.length + ' custom control(s) reacted to Enter/Space.'
          : 'Only native controls: the browser handles Enter/Space.',
      );

    // Escape: open each disclosure, press Escape, check it closes and focus lands somewhere visible.
    var triggers = interactive.filter(function (e) {
      return (
        (e.getAttribute('aria-expanded') === 'false' && e.hasAttribute('aria-controls')) ||
        (e.getAttribute('aria-haspopup') && e.getAttribute('aria-expanded') === 'false')
      );
    });
    var escIssues = [],
      escOk = 0;
    triggers.forEach(function (t) {
      t.focus();
      t.click();
      if (t.getAttribute('aria-expanded') !== 'true') return;
      // While it's open, probe any list/menu it revealed.
      composites(allElements(root === document ? document.body : root)).forEach(probeGroup);
      var target = deepActive() || t;
      fire(target, 'Escape');
      var closed = t.getAttribute('aria-expanded') === 'false';
      var landed = deepActive();
      if (!closed) escIssues.push("Escape didn't close " + describe(t));
      else if (!landed || landed === document.body || isHidden(landed))
        escIssues.push(
          'After Escape, focus is stranded on ' +
            (landed ? describe(landed) : 'nothing') +
            ' (should return to ' +
            describe(t) +
            ')',
        );
      else escOk++;
      if (t.getAttribute('aria-expanded') === 'true') t.click();
    });
    if (escIssues.length)
      C.add(4, '2.1.2', 'Escape closes what the component opened, focus returns', 'fail', 'HIGH', escIssues.join('; '));
    else
      C.add(
        4,
        '2.1.2',
        'Escape closes what the component opened, focus returns',
        triggers.length ? 'pass' : 'n/a',
        '',
        triggers.length
          ? escOk + ' popup(s) closed on Escape with focus kept visible.'
          : 'No aria-expanded trigger found.',
      );

    if (!probed.length)
      C.add(
        4,
        '2.1.1',
        'Arrow keys move focus between rows/options',
        'n/a',
        '',
        'No composite widget (listbox, menu, tablist, radiogroup, grid, tree, toolbar) found, even after opening popups.',
      );

    C.add(
      4,
      '2.1.2',
      'No focus trap except deliberate modals',
      'manual',
      '',
      "Can't be simulated: in the keyboard walk, Tab and Shift+Tab out of the component. Modals may trap only until dismissed.",
    );

    // Focus indicator: a rule that removes the outline (on :focus or
    // unconditionally) needs a visible replacement in a :focus rule.
    var tabbables = order.filter(function (e) {
      return els.indexOf(e) !== -1 || root === document;
    });
    var killed = [];
    tabbables.forEach(function (e) {
      var focusRules = rulesMatching(e, /:focus(-visible|-within)?\b/);
      var plainKills = rulesMatching(e, null).some(function (r) {
        return removesOutline(r.style);
      });
      var focusKills = focusRules.some(function (r) {
        return removesOutline(r.style);
      });
      var replaced = focusRules.some(function (r) {
        return declaresVisibleIndicator(r.style);
      });
      if ((plainKills || focusKills) && !replaced) killed.push(e);
    });
    if (killed.length)
      C.add(
        4,
        '2.4.7',
        'Focus indicator visible (≥3:1) and never removed without replacement',
        'fail',
        'MEDIUM',
        'outline is removed (on :focus or always) with no visible replacement in a :focus/:focus-visible rule.',
        killed,
      );
    else
      C.add(
        4,
        '2.4.7',
        'Focus indicator visible (≥3:1) and never removed without replacement',
        'manual',
        '',
        'No outline removal without replacement found. Confirm the ring is visible and ≥3:1 against its background in the keyboard walk.',
      );
    // Measure custom focus-ring contrast where the rule declares a literal color.
    tabbables.forEach(function (e) {
      rulesMatching(e, /:focus-visible\b/).forEach(function (r) {
        var col =
          r.style.getPropertyValue('outline-color') ||
          (r.style.getPropertyValue('outline').match(/(#[0-9a-f]{3,8}|rgba?\([^)]*\)|var\([^)]*\))/i) || [])[0];
        if (!col) return;
        var probe = document.createElement('span');
        probe.style.color = col;
        (e.getRootNode() === document ? document.body : e.getRootNode()).appendChild(probe);
        var c = parseRGBA(getComputedStyle(probe).color);
        probe.remove();
        var bg = effectiveBg(parentOf(e) || e);
        if (c && bg) {
          var rr = ratio(over(c, bg), bg);
          if (rr < 3)
            C.add(
              4,
              '2.4.7 / 1.4.11',
              'Focus ring contrast ≥ 3:1',
              'fail',
              'MEDIUM',
              'Focus ring ' + rr.toFixed(2) + ':1 against its background.',
              [e],
            );
        }
      });
    });
  }

  function checkColor(C, els) {
    var fails = [],
      manual = [],
      checked = 0;
    els.forEach(function (e) {
      var hasText = Array.prototype.some.call(e.childNodes, function (n) {
        return n.nodeType === 3 && n.textContent.trim();
      });
      if (!hasText || isHidden(e)) return;
      var cs = getComputedStyle(e);
      var fg = parseRGBA(cs.color);
      var bg = effectiveBg(e);
      if (!fg) return;
      if (!bg) {
        manual.push(e);
        return;
      }
      var disabled = e.closest && e.closest('[disabled],[aria-disabled=true]');
      if (disabled) return; // exempt from 1.4.3
      checked++;
      var f = over(fg, bg);
      var r = ratio(f, bg),
        lc = Math.abs(apca(f, bg));
      var need = isLargeText(cs) ? 3 : 4.5,
        needLc = apcaMin(cs);
      if (r < need || lc < needLc)
        fails.push({
          el: e,
          msg:
            describe(e) +
            ': WCAG ' +
            r.toFixed(2) +
            ':1 (needs ' +
            need +
            '), APCA Lc ' +
            lc.toFixed(0) +
            ' (needs ' +
            needLc +
            ')',
          wcagFail: r < need,
        });
    });
    var hard = fails.filter(function (f) {
        return f.wcagFail;
      }),
      soft = fails.filter(function (f) {
        return !f.wcagFail;
      });
    if (hard.length)
      C.add(
        5,
        '1.4.3',
        'Text contrast (WCAG ≥4.5:1 / 3:1 large, plus APCA)',
        'fail',
        'MEDIUM',
        hard
          .map(function (f) {
            return f.msg;
          })
          .join('; '),
        hard.map(function (f) {
          return f.el;
        }),
      );
    if (soft.length)
      C.add(
        5,
        '1.4.3 (APCA)',
        'Text contrast (WCAG ≥4.5:1 / 3:1 large, plus APCA)',
        'fail',
        'LOW',
        'Passes WCAG, fails APCA: ' +
          soft
            .map(function (f) {
              return f.msg;
            })
            .join('; '),
        soft.map(function (f) {
          return f.el;
        }),
      );
    if (!fails.length)
      C.add(
        5,
        '1.4.3',
        'Text contrast (WCAG ≥4.5:1 / 3:1 large, plus APCA)',
        'pass',
        '',
        checked + ' text element(s) measured with computed colors.',
      );
    if (manual.length)
      C.add(
        5,
        '1.4.3',
        'Text over images/gradients',
        'manual',
        'MEDIUM',
        'Text sits on a background image or gradient. Check it by eye or with a picker.',
        manual,
      );

    // Non-text: control boundaries and icons.
    var ntFails = [];
    els.forEach(function (e) {
      if (isHidden(e)) return;
      var isControl =
        e.matches('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),select,textarea') ||
        /^(textbox|combobox|searchbox)$/.test(e.getAttribute('role') || '');
      var isIcon = (e.tagName === 'svg' || e.tagName === 'SVG') && e.closest('button,a,[role=button],[role=link]');
      if (!isControl && !isIcon) return;
      var outer = effectiveBg(parentOf(e) || e);
      if (!outer) return;
      var cs = getComputedStyle(e);
      if (isControl) {
        var bw = parseFloat(cs.borderBottomWidth) || 0;
        var bc = parseRGBA(cs.borderBottomColor),
          own = parseRGBA(cs.backgroundColor);
        var borderR = bw > 0 && bc ? ratio(over(bc, outer), outer) : 0;
        var fillR = own && own[3] > 0 ? ratio(over(own, outer), outer) : 0;
        if (Math.max(borderR, fillR) < 3)
          ntFails.push({ el: e, msg: describe(e) + ': boundary ' + Math.max(borderR, fillR).toFixed(2) + ':1' });
      } else {
        var fill = parseRGBA(cs.fill !== 'none' ? cs.fill : cs.stroke) || parseRGBA(cs.color);
        if (fill) {
          var ir = ratio(over(fill, outer), outer);
          if (ir < 3) ntFails.push({ el: e, msg: describe(e) + ': icon ' + ir.toFixed(2) + ':1' });
        }
      }
    });
    if (ntFails.length)
      C.add(
        5,
        '1.4.11',
        'Non-text UI contrast ≥ 3:1 (borders, icons)',
        'fail',
        'MEDIUM',
        ntFails
          .map(function (f) {
            return f.msg;
          })
          .join('; '),
        ntFails.map(function (f) {
          return f.el;
        }),
      );
    else C.add(5, '1.4.11', 'Non-text UI contrast ≥ 3:1 (borders, icons)', 'pass');

    // Color as the only signal: compare a stateful element with a sibling that lacks the state.
    var STATE = ['aria-invalid', 'aria-selected', 'aria-current', 'aria-checked', 'aria-pressed', 'aria-disabled'];
    var VISUAL = [
      'borderTopWidth',
      'borderTopStyle',
      'outlineStyle',
      'fontWeight',
      'textDecorationLine',
      'boxShadow',
      'fontStyle',
      'borderLeftWidth',
      'backgroundImage',
    ];
    var colorOnly = [];
    els.forEach(function (e) {
      STATE.forEach(function (a) {
        var v = e.getAttribute(a);
        if (v !== 'true' && v !== 'page' && v !== 'step') return;
        var p = parentOf(e);
        if (!p) return;
        var sib = Array.prototype.filter.call(p.children || [], function (s) {
          return s !== e && s.tagName === e.tagName && s.getAttribute(a) !== v;
        })[0];
        if (!sib) return;
        var a1 = getComputedStyle(e),
          a2 = getComputedStyle(sib);
        var colorDiff =
          a1.color !== a2.color || a1.backgroundColor !== a2.backgroundColor || a1.borderTopColor !== a2.borderTopColor;
        var otherDiff =
          VISUAL.some(function (k) {
            return a1[k] !== a2[k];
          }) ||
          e.querySelectorAll('svg,img,[class*=icon]').length !== sib.querySelectorAll('svg,img,[class*=icon]').length ||
          (clean(e.textContent) !== clean(sib.textContent) && a === 'aria-invalid');
        if (colorDiff && !otherDiff) colorOnly.push({ el: e, a: a });
      });
    });
    if (colorOnly.length)
      C.add(
        5,
        '1.4.1',
        'Color is never the only signal for state',
        'fail',
        'MEDIUM',
        'State differs from its sibling only by color: ' +
          colorOnly
            .map(function (c) {
              return c.a + ' on ' + describe(c.el);
            })
            .join('; ') +
          '. Add an icon, text, weight or border change.',
        colorOnly.map(function (c) {
          return c.el;
        }),
      );
    else
      C.add(
        5,
        '1.4.1',
        'Color is never the only signal for state',
        'manual',
        '',
        "No color-only state found among sibling pairs. Also check error/selected/disabled states you can't see right now.",
      );

    // Hover/active rules that only change color.
    var onlyColor = [];
    els.filter(isInteractive).forEach(function (e) {
      rulesMatching(e, /:(hover|active)\b/).forEach(function (r) {
        var props = Array.prototype.slice.call(r.style);
        if (
          props.length &&
          props.every(function (p) {
            return /^(color|background|background-color|border-color|border-(top|right|bottom|left)-color|fill|stroke|opacity)$/.test(
              p,
            );
          })
        )
          onlyColor.push(e);
      });
    });
    var uniq = onlyColor.filter(function (e, i) {
      return onlyColor.indexOf(e) === i;
    });
    if (uniq.length)
      C.add(
        5,
        '(best practice)',
        'Hover/active states have a non-color cue',
        'fail',
        'LOW',
        'These :hover/:active rules change only color. Add an underline, border, shadow or similar.',
        uniq,
      );
    else C.add(5, '(best practice)', 'Hover/active states have a non-color cue', 'pass');
  }

  function checkForms(C, els) {
    var fields = els
      .filter(function (e) {
        return (
          e.matches(
            'input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]):not([type=image]),select,textarea',
          ) || /^(textbox|combobox|searchbox|spinbutton|slider)$/.test(e.getAttribute('role') || '')
        );
      })
      .filter(function (e) {
        return !isHidden(e);
      });
    if (!fields.length) {
      C.add(6, '1.3.1 / 3.3.2', 'Form fields', 'n/a', '', 'No form fields.');
      return;
    }
    var unlabeled = [],
      brokenRef = [],
      placeholderOnly = [];
    fields.forEach(function (f) {
      var lb = f.getAttribute('aria-labelledby');
      if (
        lb &&
        lb.split(/\s+/).some(function (id) {
          return !byIdInRoot(f, id);
        })
      )
        brokenRef.push(f);
      var hasReal = (f.labels && f.labels.length) || clean(f.getAttribute('aria-label')) || (lb && clean(accName(f)));
      if (!hasReal) (f.getAttribute('placeholder') || f.getAttribute('title') ? placeholderOnly : unlabeled).push(f);
    });
    if (brokenRef.length)
      C.add(
        6,
        '1.3.1',
        'Labels actually associated with their field',
        'fail',
        'HIGH',
        "aria-labelledby points to an ID that doesn't exist in this tree. IDs don't cross the Shadow DOM boundary (Pattern 5).",
        brokenRef,
      );
    if (unlabeled.length)
      C.add(6, '1.3.1 / 3.3.2', 'Labels actually associated with their field', 'fail', 'HIGH', 'No label.', unlabeled);
    if (placeholderOnly.length)
      C.add(
        6,
        '3.3.2',
        'Labels actually associated with their field',
        'fail',
        'MEDIUM',
        "Only a placeholder/title: it disappears on typing and isn't a label.",
        placeholderOnly,
      );
    if (!brokenRef.length && !unlabeled.length && !placeholderOnly.length)
      C.add(
        6,
        '1.3.1 / 3.3.2',
        'Labels actually associated with their field',
        'pass',
        '',
        fields.length + ' field(s) labeled.',
      );

    var req = fields.filter(function (f) {
      return f.required || f.getAttribute('aria-required') === 'true';
    });
    var reqNoText = req.filter(function (f) {
      var label =
        (f.labels && f.labels.length ? textOf(f.labels[0], 0) : accName(f)) +
        ' ' +
        (f.getAttribute('aria-describedby') || '')
          .split(/\s+/)
          .map(function (id) {
            var t = id && byIdInRoot(f, id);
            return t ? textOf(t, 0) : '';
          })
          .join(' ');
      return !/\*|required|obligatori|requerid/i.test(label);
    });
    var visualReq = fields.filter(function (f) {
      var l = f.labels && f.labels[0];
      return (
        l &&
        /\*|obligatori|required/i.test(l.textContent) &&
        !(f.required || f.getAttribute('aria-required') === 'true')
      );
    });
    if (reqNoText.length)
      C.add(
        6,
        '3.3.2',
        'Required fields marked with visible text and required/aria-required',
        'fail',
        'MEDIUM',
        "Required in code, but the label doesn't say so in text.",
        reqNoText,
      );
    if (visualReq.length)
      C.add(
        6,
        '3.3.2',
        'Required fields marked with visible text and required/aria-required',
        'fail',
        'MEDIUM',
        'Label says required, but the control has no required/aria-required.',
        visualReq,
      );
    if (!reqNoText.length && !visualReq.length)
      C.add(
        6,
        '3.3.2',
        'Required fields marked with visible text and required/aria-required',
        req.length ? 'pass' : 'n/a',
      );

    var invalid = fields.filter(function (f) {
      return f.getAttribute('aria-invalid') === 'true';
    });
    var badErr = invalid.filter(function (f) {
      var d = f.getAttribute('aria-describedby') || f.getAttribute('aria-errormessage');
      if (!d) return true;
      return !clean(
        d
          .split(/\s+/)
          .map(function (id) {
            var t = byIdInRoot(f, id);
            return t ? textOf(t, 0) : '';
          })
          .join(' '),
      );
    });
    var errLooking = fields.filter(function (f) {
      return (
        /\b(error|invalid|is-invalid|has-error)\b/i.test(f.getAttribute('class') || '') &&
        f.getAttribute('aria-invalid') !== 'true'
      );
    });
    if (badErr.length)
      C.add(
        6,
        '3.3.1 / 3.3.3',
        'Invalid fields: aria-invalid + described error message',
        'fail',
        'MEDIUM',
        'aria-invalid=true without a resolvable, non-empty aria-describedby message.',
        badErr,
      );
    if (errLooking.length)
      C.add(
        6,
        '3.3.1',
        'Invalid fields: aria-invalid + described error message',
        'fail',
        'MEDIUM',
        "Styled as an error, but aria-invalid isn't set.",
        errLooking,
      );
    if (!badErr.length && !errLooking.length)
      C.add(
        6,
        '3.3.1 / 3.3.3',
        'Invalid fields: aria-invalid + described error message',
        invalid.length ? 'pass' : 'manual',
        '',
        invalid.length ? '' : 'No field is in an error state right now. Trigger validation and run again.',
      );
  }

  function checkMedia(C, els) {
    var imgs = els.filter(function (e) {
      return e.tagName === 'IMG';
    });
    var noAlt = imgs.filter(function (i) {
      return !i.hasAttribute('alt');
    });
    var svgImg = els.filter(function (e) {
      return (e.tagName === 'svg' || e.tagName === 'SVG') && e.getAttribute('role') === 'img' && !accName(e);
    });
    if (noAlt.length || svgImg.length)
      C.add(
        7,
        '1.1.1',
        'Images have alt (or alt="" if decorative)',
        'fail',
        'MEDIUM',
        'Missing text alternative.',
        noAlt.concat(svgImg),
      );
    else C.add(7, '1.1.1', 'Images have alt (or alt="" if decorative)', imgs.length ? 'pass' : 'n/a');
    var iconOnly = els.filter(function (e) {
      if (!(e.matches('button,a[href]') || /^(button|link)$/.test(e.getAttribute('role') || '')) || isHidden(e))
        return false;
      var visibleText = clean((e.shadowRoot ? e.shadowRoot.textContent : '') + e.textContent);
      return !visibleText && !accName(e);
    });
    if (iconOnly.length)
      C.add(
        7,
        '1.1.1 / 4.1.2',
        'Icon-only controls named by the wrapping button',
        'fail',
        'HIGH',
        'Icon-only control with no name. Add aria-label on the button and aria-hidden="true" on the icon.',
        iconOnly,
      );
    else C.add(7, '1.1.1 / 4.1.2', 'Icon-only controls named by the wrapping button', 'pass');
    var media = els.filter(function (e) {
      return e.tagName === 'VIDEO' || e.tagName === 'AUDIO';
    });
    var noCap = media.filter(function (m) {
      return m.tagName === 'VIDEO' && !m.querySelector('track[kind=captions],track[kind=subtitles]');
    });
    if (noCap.length)
      C.add(
        7,
        '1.2.2',
        'Video has captions / transcript',
        'fail',
        'HIGH',
        'No captions track. A nearby transcript also counts; check by hand.',
        noCap,
      );
    else C.add(7, '1.2.2', 'Video has captions / transcript', media.length ? 'pass' : 'n/a');
    var auto = media.filter(function (m) {
      return m.autoplay && !m.muted && !m.controls;
    });
    if (auto.length)
      C.add(
        7,
        '1.4.2',
        'Autoplaying media can be paused/muted',
        'fail',
        'HIGH',
        'Autoplays with sound and no controls.',
        auto,
      );
    else C.add(7, '1.4.2', 'Autoplaying media can be paused/muted', media.length ? 'pass' : 'n/a');
  }

  // Reflow and zoom: re-render a copy of the page in hidden iframes.
  function probeFrame(width, html) {
    return new Promise(function (resolve) {
      var f = document.createElement('iframe');
      f.name = 'a11y-probe-' + width;
      f.setAttribute('aria-hidden', 'true');
      f.tabIndex = -1;
      f.style.cssText = 'position:fixed;left:-10000px;top:0;height:800px;border:0;width:' + width + 'px';
      var done = false;
      function finish(res) {
        if (done) return;
        done = true;
        window.removeEventListener('message', onMsg);
        f.remove();
        resolve(res);
      }
      // The copy measures itself and posts the numbers back. This works even
      // in sandboxed artifact frames where the parent can't read the child.
      function onMsg(ev) {
        var d = ev.data;
        if (d && d.a11yProbe === f.name) {
          window.removeEventListener('message', onMsg);
          finish(d.result);
        }
      }
      window.addEventListener('message', onMsg);
      setTimeout(function () {
        finish({ ok: false, error: 'timeout' });
      }, 5000);
      f.srcdoc = html;
      document.body.appendChild(f);
    });
  }

  function checkReflow(C) {
    var html = window.__A11Y_SOURCE__ || null;
    if (!html) {
      // Rebuild from the live DOM, minus this tool's UI. Open shadow roots are
      // recreated by the page's own scripts when the copy boots.
      var clone = document.documentElement.cloneNode(true);
      var p = clone.querySelector('#' + PANEL_ID);
      if (p) p.remove();
      html = '<!doctype html>' + clone.outerHTML;
    }
    return Promise.all([probeFrame(320, html), probeFrame(640, html)]).then(function (res) {
      var r320 = res[0],
        r640 = res[1];
      if (!r320.ok)
        C.add(
          8,
          '1.4.10',
          'Reflows at 320px with no horizontal scroll',
          'manual',
          '',
          "Couldn't render the probe copy (" +
            r320.error +
            '). Resize the preview to 320px wide and look for horizontal scroll.',
        );
      else if (r320.scrollWidth > 321)
        C.add(
          8,
          '1.4.10',
          'Reflows at 320px with no horizontal scroll',
          'fail',
          'MEDIUM',
          'At 320px the page is ' + r320.scrollWidth + 'px wide: horizontal scroll.',
        );
      else
        C.add(
          8,
          '1.4.10',
          'Reflows at 320px with no horizontal scroll',
          'pass',
          '',
          'No horizontal overflow at 320px.' +
            (r320.clipped.length
              ? ' Truncated text: ' + r320.clipped.join(', ') + ' (check nothing important is cut).'
              : ''),
        );
      if (!r640.ok)
        C.add(
          8,
          '1.4.4',
          'Usable at 200% zoom',
          'manual',
          '',
          "Couldn't render the probe copy. Zoom the preview to 200%.",
        );
      else
        C.add(
          8,
          '1.4.4',
          'Usable at 200% zoom',
          r640.scrollWidth > 641 || r640.clipped.length ? 'fail' : 'pass',
          r640.scrollWidth > 641 || r640.clipped.length ? 'MEDIUM' : '',
          'Simulated as a 640px viewport (a 1280px screen at 200%). ' +
            (r640.scrollWidth > 641 ? 'Horizontal overflow (' + r640.scrollWidth + 'px). ' : '') +
            (r640.clipped.length ? 'Clipped text: ' + r640.clipped.join(', ') + '.' : 'No clipping detected.'),
        );
    });
  }

  function addManual(C) {
    C.add(
      9,
      '2.1.1 / 2.1.2',
      'Keyboard section verified live, not assumed',
      'manual',
      '',
      'Record a keyboard walk: Tab in, through and out; arrows inside lists/menus; Enter/Space; Escape on anything that opens. Report the log to the reviewing agent.',
    );
    C.add(
      9,
      '4.1.2',
      'Screen-reader pass for anything new',
      'manual',
      '',
      'Human only. For a new composite widget or ARIA pattern, operate it once with VoiceOver (macOS/iOS), NVDA (Windows) or TalkBack (Android).',
    );
    C.add(
      9,
      '—',
      'Every finding triaged',
      'manual',
      '',
      'Each fail above plus the static scan (audit-a11y.py) goes into the HIGH/MEDIUM/LOW table (Pattern 3): fixed, or deferred with a reason.',
    );
  }

  // -------------------------------------------------------------------------
  // Runner and report
  // -------------------------------------------------------------------------
  function run(opts) {
    opts = opts || {};
    var root = opts.root || document;
    var els = allElements(root === document ? document.body : root);
    if (root !== document && root.nodeType === 1) els.unshift(root);
    var C = new Collector();
    var steps = [
      checkStructure,
      checkSemantics,
      checkContent,
      function (c, e) {
        checkKeyboard(c, e, root === document ? document : root);
      },
      checkColor,
      checkForms,
      checkMedia,
    ];
    var prevFocus = deepActive();
    steps.forEach(function (fn) {
      try {
        fn(C, els);
      } catch (e) {
        C.add(0, '—', 'Checker error in ' + (fn.name || 'step'), 'manual', '', String((e && e.stack) || e));
      }
    });
    try {
      if (prevFocus && prevFocus !== document.body && prevFocus.focus) prevFocus.focus();
      else {
        var a = deepActive();
        if (a && a.blur) a.blur();
      }
    } catch (e) {}
    var tail =
      opts.reflow === false
        ? Promise.resolve()
        : checkReflow(C).catch(function (e) {
            C.add(8, '1.4.10', 'Reflow probe', 'manual', '', String(e));
          });
    return tail.then(function () {
      addManual(C);
      C.items.sort(function (a, b) {
        return a.section - b.section;
      });
      return { results: C.items, report: toReport(C.items) };
    });
  }

  function toReport(items) {
    var counts = { fail: 0, pass: 0, manual: 0, 'n/a': 0 };
    items.forEach(function (i) {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });
    var lines = [
      'Self-validation checklist: rendered-page results',
      'fail ' +
        counts.fail +
        ' · pass ' +
        counts.pass +
        ' · needs a person ' +
        counts.manual +
        ' · n/a ' +
        counts['n/a'],
      '',
    ];
    var last = null;
    items.forEach(function (i) {
      if (i.section !== last) {
        lines.push('## ' + i.section + '. ' + (SECTIONS[i.section] || 'Checker'));
        last = i.section;
      }
      var box = i.status === 'pass' ? '[x]' : i.status === 'n/a' ? '[-]' : i.status === 'manual' ? '[?]' : '[ ]';
      if (i.status === 'fail') {
        lines.push(box + ' [SC ' + i.sc + '] ' + i.check + ' — ' + i.impact);
        if (i.elements.length)
          lines.push(
            '    Location: ' +
              i.elements.slice(0, 6).join(' | ') +
              (i.elements.length > 6 ? ' (+' + (i.elements.length - 6) + ' more)' : ''),
          );
        lines.push('    Issue: ' + i.detail);
      } else {
        lines.push(
          box +
            ' [SC ' +
            i.sc +
            '] ' +
            i.check +
            (i.status === 'manual' ? ' (needs a person)' : '') +
            (i.detail ? ': ' + i.detail : ''),
        );
      }
    });
    return lines.join('\n');
  }

  // -------------------------------------------------------------------------
  // Keyboard walk recorder (real key presses by a person)
  // -------------------------------------------------------------------------
  var walk = null;
  function startWalk() {
    stopWalk();
    walk = { log: [], t0: performance.now(), lastKey: null };
    walk.onKey = function (e) {
      if (isOwnUI(e.composedPath()[0])) return;
      walk.lastKey = (e.shiftKey && e.key === 'Tab' ? 'Shift+' : '') + (e.key === ' ' ? 'Space' : e.key);
      var before = deepActive();
      var key = walk.lastKey;
      setTimeout(function () {
        var after = deepActive();
        var entry = key + ': ' + (after === before ? 'focus stayed on ' : '→ ') + describe(after);
        if (after === document.body || !after) entry += '  ⚠ focus lost to <body>';
        else if (isHidden(after)) entry += '  ⚠ focused element is hidden';
        walk.log.push(entry);
        render();
      }, 0);
    };
    document.addEventListener('keydown', walk.onKey, true);
  }
  function stopWalk() {
    if (!walk) return [];
    document.removeEventListener('keydown', walk.onKey, true);
    var log = walk.log;
    walk.done = true;
    return log;
  }
  function walkReport() {
    if (!walk || !walk.log.length) return '';
    return (
      '\n## Keyboard walk (real key presses)\n' +
      walk.log
        .map(function (l, i) {
          return i + 1 + '. ' + l;
        })
        .join('\n')
    );
  }

  // -------------------------------------------------------------------------
  // Floating panel (lives in its own shadow root, excluded from all checks)
  // -------------------------------------------------------------------------
  var host,
    ui,
    last = null;
  function render() {
    if (!ui) return;
    var body = ui.querySelector('.body');
    var walking = walk && !walk.done;
    ui.querySelector('.walk').textContent = walking ? 'Stop keyboard walk' : 'Record keyboard walk';
    ui.querySelector('.walk').setAttribute('aria-pressed', walking ? 'true' : 'false');
    var html = '';
    if (last) {
      var cur = null;
      last.results.forEach(function (i) {
        if (i.section !== cur) {
          html += '<h3>' + i.section + '. ' + esc(SECTIONS[i.section] || 'Checker') + '</h3>';
          cur = i.section;
        }
        var label = i.status === 'manual' ? 'check' : i.status;
        html +=
          '<div class="row ' +
          i.status.replace('/', '') +
          '"><span class="tag">' +
          label +
          (i.impact ? ' · ' + i.impact : '') +
          '</span><div><strong>' +
          esc(i.check) +
          '</strong> <span class="sc">SC ' +
          esc(i.sc) +
          '</span>' +
          (i.detail ? '<p>' + esc(i.detail) + '</p>' : '') +
          (i.elements.length ? '<p class="els">' + esc(i.elements.slice(0, 4).join(' · ')) + '</p>' : '') +
          '</div></div>';
      });
    }
    if (walk && walk.log.length)
      html +=
        '<h3>Keyboard walk</h3><ol class="log">' +
        walk.log
          .map(function (l) {
            return '<li>' + esc(l) + '</li>';
          })
          .join('') +
        '</ol>';
    if (walking)
      html =
        '<p class="hint" role="status">Recording. Click the page, then use Tab, Shift+Tab, arrows, Enter, Space and Escape.</p>' +
        html;
    body.innerHTML = html || '<p class="hint">Run the checks against this rendered page.</p>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function mountPanel() {
    host = document.createElement('div');
    host.id = PANEL_ID;
    document.body.appendChild(host);
    var sr = host.attachShadow({ mode: 'open' });
    sr.innerHTML =
      '<style>' +
      ':host{all:initial}*{box-sizing:border-box;font-family:Inter,system-ui,sans-serif}' +
      '.fab{position:fixed;right:16px;bottom:16px;z-index:2147483646;min-height:44px;padding:0 16px;border-radius:22px;border:2px solid #fff;background:#1d1d1f;color:#fff;font:600 14px/1 Inter,system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.25)}' +
      '.fab:focus-visible,button:focus-visible{outline:3px solid #0a66ff;outline-offset:2px}' +
      '.panel{position:fixed;right:16px;bottom:72px;z-index:2147483647;width:min(440px,calc(100vw - 32px));max-height:min(70vh,640px);display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border:1px solid #c7c7cc;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.2)}' +
      '.panel[hidden]{display:none}.bar{display:flex;flex-wrap:wrap;gap:8px;padding:12px;border-bottom:1px solid #e5e5ea}' +
      '.bar button{min-height:36px;padding:0 12px;border-radius:8px;border:1px solid #8e8e93;background:#fff;color:#1d1d1f;font:500 13px/1 Inter,system-ui,sans-serif;cursor:pointer}' +
      '.bar button.primary{background:#1d1d1f;color:#fff;border-color:#1d1d1f}.bar button[aria-pressed=true]{background:#fff4e5;border-color:#b25000}' +
      '.body{overflow:auto;padding:4px 12px 12px;font-size:13px;line-height:1.4}h2{font-size:14px;margin:0;padding:12px 12px 0}h3{font-size:12px;text-transform:uppercase;letter-spacing:.04em;color:#48484a;margin:16px 0 4px}' +
      '.row{display:grid;grid-template-columns:84px 1fr;gap:8px;padding:6px 0;border-top:1px solid #f2f2f7}.row p{margin:2px 0 0;color:#3a3a3c}.els{font-family:ui-monospace,monospace;font-size:11px;word-break:break-all}' +
      '.tag{font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;height:fit-content;text-transform:uppercase}' +
      '.fail .tag{background:#ffe5e5;color:#9b0000}.fail .tag::before{content:"✕ "}.pass .tag{background:#e3f6e8;color:#0b5d1e}.pass .tag::before{content:"✓ "}' +
      '.manual .tag{background:#fff4e5;color:#7a3a00}.manual .tag::before{content:"? "}.na .tag{background:#f2f2f7;color:#48484a}' +
      '.sc{color:#636366;font-size:11px}.hint{color:#48484a}.log{padding-left:20px;font-family:ui-monospace,monospace;font-size:11px}' +
      '@media (prefers-color-scheme:dark){.panel{background:#1c1c1e;color:#f2f2f7;border-color:#3a3a3c}.bar{border-color:#3a3a3c}.bar button{background:#2c2c2e;color:#f2f2f7}.bar button.primary{background:#f2f2f7;color:#1c1c1e}.row{border-color:#2c2c2e}.row p,.hint,h3,.sc{color:#aeaeb2}.bar button[aria-pressed=true]{background:#3a2a10}}' +
      '@media (prefers-reduced-motion:no-preference){.panel{transition:opacity .15s ease-out}}' +
      '</style>' +
      '<button class="fab" type="button" aria-expanded="false" aria-controls="p">A11y</button>' +
      '<section class="panel" id="p" role="dialog" aria-labelledby="t" hidden>' +
      '<h2 id="t">Accessibility self-check</h2>' +
      '<div class="bar"><button class="primary run" type="button">Run checks</button><button class="walk" type="button" aria-pressed="false">Record keyboard walk</button><button class="copy" type="button">Copy report</button></div>' +
      '<div class="body" aria-live="polite"></div></section>';
    ui = sr;
    var fab = sr.querySelector('.fab'),
      panel = sr.querySelector('.panel');
    function toggle(open) {
      panel.hidden = !open;
      fab.setAttribute('aria-expanded', String(open));
      if (open) sr.querySelector('.run').focus();
      else fab.focus();
    }
    fab.addEventListener('click', function () {
      toggle(panel.hidden);
    });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggle(false);
    });
    sr.querySelector('.run').addEventListener('click', function () {
      var b = this;
      b.textContent = 'Running…';
      b.disabled = true;
      run().then(function (r) {
        last = r;
        b.textContent = 'Run again';
        b.disabled = false;
        render();
      });
    });
    sr.querySelector('.walk').addEventListener('click', function () {
      if (walk && !walk.done) stopWalk();
      else startWalk();
      render();
    });
    sr.querySelector('.copy').addEventListener('click', function () {
      var b = this;
      var text = (last ? last.report : 'Run the checks first.') + walkReport();
      var done = function () {
        b.textContent = 'Copied';
        setTimeout(function () {
          b.textContent = 'Copy report';
        }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText)
        navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;left:-9999px';
        sr.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {
          b.textContent = 'Copy failed: select text in the console';
          console.log(text);
        }
        ta.remove();
      }
    });
    render();
  }

  function measureSelf() {
    var d = document,
      w = window,
      width = w.innerWidth;
    var sw = Math.max(d.documentElement.scrollWidth, d.body ? d.body.scrollWidth : 0);
    var clipped = [];
    Array.prototype.forEach.call(d.querySelectorAll('body *'), function (el) {
      var cs = w.getComputedStyle(el);
      if (
        (cs.overflowX === 'hidden' || cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') &&
        el.scrollWidth > el.clientWidth + 1 &&
        el.textContent.trim()
      )
        clipped.push(
          el.tagName.toLowerCase() +
            (el.className && typeof el.className === 'string' ? '.' + el.className.split(/\s+/)[0] : ''),
        );
    });
    return { ok: true, scrollWidth: sw, width: width, clipped: clipped.slice(0, 8) };
  }
  if (IS_PROBE_FRAME) {
    var report = function () {
      setTimeout(function () {
        var res;
        try {
          res = measureSelf();
        } catch (e) {
          res = { ok: false, error: String(e) };
        }
        try {
          window.parent.postMessage({ a11yProbe: window.name, result: res }, '*');
        } catch (e) {}
      }, 400);
    };
    if (document.readyState === 'complete') report();
    else window.addEventListener('load', report);
  }

  window.A11ySelfCheck = {
    run: run,
    startWalk: startWalk,
    stopWalk: stopWalk,
    walkLog: function () {
      return walk ? walk.log.slice() : [];
    },
    focusOrder: function (r) {
      return focusOrder(r || document).map(describe);
    },
  };
  if (!IS_PROBE_FRAME && !window.A11Y_SELF_CHECK_HEADLESS) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountPanel);
    else mountPanel();
  }
})();
