#!/usr/bin/env python3
"""
audit-a11y.py -- static WCAG 2.2 accessibility scanner for the rbg-ui panel.
Vendored from the Mody plugin's a11y-checker and retargeted: scans
index.html, src/ (the shell, the screen modules' `render` template strings,
mock data) and the CSS in styles/; panel rules added (asset alt policy,
emoji as content, a heading per screen, progress values, table headers,
global style leaks out of the .rbg scope).

Scans source files (.js, .html, .css) for the patterns documented
in this skill's SKILL.md and references/wcag-checklist.md, and reports:

  1. A confidence table explaining how reliable each automated check is.
  2. Findings in the skill's structured format:
       [SC {number}] {title} -- {HIGH|MEDIUM|LOW}
       Location: {file}:{line}
       Issue: ...
       Fix: ...
  3. An overall accessibility score (0-100) with a plain-language verdict.

This is a static, regex-based scanner -- it reads source text, it does not
render the DOM, compute real contrast, or press keys. It is a triage tool,
not a certification: every finding below HIGH confidence needs the manual
checks in SKILL.md's POUR sections before you treat it as resolved either
way, and some things (keyboard traps, actual rendered contrast, screen
reader announcement) cannot be checked by this script at all -- see
"What this script cannot check" at the bottom of its output.

Usage (from the repo root):
  python3 -I audit-a11y.py                       # index.html, src/, styles/
  python3 -I audit-a11y.py src/screens
  python3 -I audit-a11y.py src/screens/ranking/jogadores.js --json
  python3 -I audit-a11y.py --min-confidence medium

No third-party dependencies -- standard library only.
"""

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, asdict

SCAN_EXTENSIONS = {".js", ".html", ".css"}
SKIP_DIRS = {"node_modules", "dist", "build", ".git", "coverage", "reference",
             "public", "playwright-report", "test-results"}
DEFAULT_PATHS = ["index.html", "src", "styles"]

# Asset folders under public/assets/ whose images are decorative by policy
# (SKILL.md, "Alt text policy") versus ones that always carry meaning.
DECORATIVE_ASSETS = r"assets/(ornaments|patterns)/"
INFORMATIVE_ASSETS = r"assets/(avatars|items)/"
CSS_ONLY_RULES = {"global-style-leak"}
# Emoji presentation ranges commonly used as stand-in icons or item art.
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F2FF]")

IMPACT_WEIGHT = {"HIGH": 10, "MEDIUM": 5, "LOW": 2}
CONFIDENCE_MULTIPLIER = {"HIGH": 1.0, "MEDIUM": 0.6, "LOW": 0.3}
CONFIDENCE_RANK = {"low": 0, "medium": 1, "high": 2}


@dataclass
class Finding:
    rule_id: str
    sc: str
    title: str
    pour: str
    impact: str
    confidence: str
    file: str
    line: int
    issue: str
    fix: str


def line_at(text, offset):
    return text.count("\n", 0, offset) + 1


# ---------------------------------------------------------------------------
# Color math: sRGB parsing, WCAG 2.x contrast ratio, and APCA (Lc) contrast.
#
# APCA constants and algorithm are the official SA98G / APCA 0.0.98G values
# from the W3-licensed reference implementation (github.com/Myndex/apca-w3),
# ported line-for-line from its sRGBtoY() and APCAcontrast() functions.
# ---------------------------------------------------------------------------

NAMED_COLORS = {
    "black": (0, 0, 0), "white": (255, 255, 255),
    "red": (255, 0, 0), "lime": (0, 255, 0), "blue": (0, 0, 255),
    "yellow": (255, 255, 0), "cyan": (0, 255, 255), "aqua": (0, 255, 255),
    "magenta": (255, 0, 255), "fuchsia": (255, 0, 255),
    "silver": (192, 192, 192), "gray": (128, 128, 128), "grey": (128, 128, 128),
    "maroon": (128, 0, 0), "olive": (128, 128, 0), "green": (0, 128, 0),
    "purple": (128, 0, 128), "teal": (0, 128, 128), "navy": (0, 0, 128),
    "orange": (255, 165, 0), "pink": (255, 192, 203), "brown": (165, 42, 42),
}

APCA = {
    "mainTRC": 2.4,
    "sRco": 0.2126729, "sGco": 0.7151522, "sBco": 0.0721750,
    "normBG": 0.56, "normTXT": 0.57, "revTXT": 0.62, "revBG": 0.65,
    "blkThrs": 0.022, "blkClmp": 1.414,
    "scaleBoW": 1.14, "scaleWoB": 1.14,
    "loBoWoffset": 0.027, "loWoBoffset": 0.027,
    "deltaYmin": 0.0005, "loClip": 0.1,
}

# Simplified APCA Lc reference bands (Helvetica/Arial-based), from the APCA
# "easy intro": https://git.apcacontrast.com/documentation/APCAeasyIntro.html
APCA_THRESHOLDS = [
    (90, "preferred minimum for fluent body text (~14px/weight 400+)"),
    (75, "minimum for body text (~18px/weight 400+)"),
    (60, "minimum for content text needing readability (~24px/400 or 16px/700)"),
    (45, "minimum for headlines and pictograms (~36px/400 or 24px/700)"),
    (30, "minimum for other text: placeholders, disabled elements"),
    (15, "minimum for non-text discernible elements (5px+ dimension)"),
]


def parse_color(value):
    """Best-effort parse of a CSS color value to an (r, g, b) 0-255 tuple.
    Returns None for anything it can't resolve statically -- gradients,
    url(...), and var(...) custom properties are deliberately left alone
    rather than guessed at."""
    value = value.strip()
    low = value.lower()
    if "gradient" in low or "url(" in low or "var(" in low:
        return None
    hexm = re.search(r"#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", value)
    if hexm:
        h = hexm.group(1)
        if len(h) == 3:
            return tuple(int(c * 2, 16) for c in h)
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    rgbm = re.search(r"rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})", value, re.IGNORECASE)
    if rgbm:
        return tuple(min(255, int(rgbm.group(i))) for i in (1, 2, 3))
    if low in NAMED_COLORS:
        return NAMED_COLORS[low]
    return None


def srgb_to_y(rgb):
    def chan(c):
        return (c / 255.0) ** APCA["mainTRC"]
    r, g, b = rgb
    return APCA["sRco"] * chan(r) + APCA["sGco"] * chan(g) + APCA["sBco"] * chan(b)


def apca_lc(text_rgb, bg_rgb):
    """Signed APCA contrast: returns (lc, polarity). lc is roughly -108..106;
    positive means dark text on a light background ('BoW'), negative means
    light text on a dark background ('WoB') -- matching the sign convention
    of the official APCA reference implementation."""
    txt_y = srgb_to_y(text_rgb)
    bg_y = srgb_to_y(bg_rgb)
    txt_y = txt_y if txt_y > APCA["blkThrs"] else txt_y + (APCA["blkThrs"] - txt_y) ** APCA["blkClmp"]
    bg_y = bg_y if bg_y > APCA["blkThrs"] else bg_y + (APCA["blkThrs"] - bg_y) ** APCA["blkClmp"]
    if abs(bg_y - txt_y) < APCA["deltaYmin"]:
        return 0.0, "BoW"
    if bg_y > txt_y:
        sapc = (bg_y ** APCA["normBG"] - txt_y ** APCA["normTXT"]) * APCA["scaleBoW"]
        out = 0.0 if sapc < APCA["loClip"] else sapc - APCA["loBoWoffset"]
        return out * 100.0, "BoW"
    sapc = (bg_y ** APCA["revBG"] - txt_y ** APCA["revTXT"]) * APCA["scaleWoB"]
    out = 0.0 if sapc > -APCA["loClip"] else sapc + APCA["loWoBoffset"]
    return out * 100.0, "WoB"


def wcag_relative_luminance(rgb):
    def lin(c):
        c = c / 255.0
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def wcag_contrast_ratio(rgb_a, rgb_b):
    l1 = wcag_relative_luminance(rgb_a)
    l2 = wcag_relative_luminance(rgb_b)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def classify_text_size(css_body):
    """Returns 'large' / 'normal' per WCAG's own size+weight definition, or
    None if this rule declares no font-size to classify from."""
    fs_m = re.search(r"font-size\s*:\s*([\d.]+)px", css_body, re.IGNORECASE)
    if not fs_m:
        return None
    size_px = float(fs_m.group(1))
    fw_m = re.search(r"font-weight\s*:\s*(\d+|bold|normal)", css_body, re.IGNORECASE)
    weight_raw = fw_m.group(1).lower() if fw_m else None
    is_bold = weight_raw == "bold" or (weight_raw and weight_raw.isdigit() and int(weight_raw) >= 700)
    large = size_px >= 24 or (size_px >= 18.66 and is_bold)
    return "large" if large else "normal"


def iter_css_rule_blocks(text):
    """Yields (offset, selector, body) for flat (non-nested) `selector { ... }`
    blocks -- good enough for the CSS files and <style> blocks this
    skill targets."""
    for m in re.finditer(r"([^{}]{1,200})\{([^{}]*)\}", text):
        yield m.start(), m.group(1), m.group(2)


# ---------------------------------------------------------------------------
# Individual checks. Each returns a list of (offset, issue, fix) tuples.
# ---------------------------------------------------------------------------

def check_img_alt(text):
    out = []
    for m in re.finditer(r"<img\b[^>]*?/?>", text, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        if not re.search(r"\balt\s*=", tag, re.IGNORECASE):
            out.append((
                m.start(),
                "An <img> has no alt attribute -- a screen reader announces the file "
                "name or nothing at all.",
                'Add alt="<meaningful description>" for informative images, or '
                'alt="" role="presentation" if the image is purely decorative.',
            ))
    return out


def check_icon_only_control(text):
    out = []
    for m in re.finditer(r"<button\b([^>]*)>(.*?)</button>", text, re.IGNORECASE | re.DOTALL):
        attrs, inner = m.group(1), m.group(2)
        if re.search(r"aria-label\s*=|aria-labelledby\s*=", attrs, re.IGNORECASE):
            continue
        stripped = re.sub(r"<[^>]+>", "", inner).strip()
        if stripped == "":
            out.append((
                m.start(),
                "A <button> has no visible text and no aria-label/aria-labelledby -- "
                "assistive tech has no accessible name to announce for it.",
                'Add aria-label="<action>" (e.g. aria-label="Close") to the button, '
                "or include visible text inside it.",
            ))
    return out


def check_input_label(text):
    out = []
    label_ids = set(re.findall(
        r'<label\b[^>]*\bfor\s*=\s*["\']([^"\']+)["\']', text, re.IGNORECASE
    ))
    for m in re.finditer(r"<(input|select|textarea)\b([^>]*?)/?>", text, re.IGNORECASE):
        tag, attrs = m.group(1), m.group(2)
        if re.search(r'type\s*=\s*["\'](hidden|button|submit|reset)["\']', attrs, re.IGNORECASE):
            continue
        if re.search(r"aria-label\s*=|aria-labelledby\s*=", attrs, re.IGNORECASE):
            continue
        id_match = re.search(r'\bid\s*=\s*["\']([^"\']+)["\']', attrs)
        if id_match and id_match.group(1) in label_ids:
            continue
        out.append((
            m.start(),
            f"A <{tag}> has no associated <label>, aria-label, or aria-labelledby -- "
            "its purpose is not announced to assistive tech.",
            'Associate a <label for="..."> with a matching id, or add '
            'aria-label="<field name>" directly on the control.',
        ))
    return out


def check_heading_sequence(text):
    out = []
    headings = [(m.start(), int(m.group(1))) for m in re.finditer(r"<h([1-6])\b", text, re.IGNORECASE)]
    prev = None
    for offset, level in headings:
        if prev is not None and level > prev + 1:
            out.append((
                offset,
                f"Heading jumps from h{prev} to h{level}, skipping a level -- users "
                "navigating by heading structure lose the outline.",
                f"Insert an h{prev + 1} in between, or lower this heading to h{prev + 1}.",
            ))
        prev = level
    return out


def check_color_contrast_pair(text):
    """When a rule declares both a literal text color and a literal
    background in the same block, compute the exact WCAG ratio and APCA Lc
    and flag it if either fails its threshold for the text size this rule
    declares (or the stricter 'normal text' threshold, assumed, if it
    doesn't declare a size)."""
    out = []
    for offset, _selector, body in iter_css_rule_blocks(text):
        color_m = re.search(r"(?<![\w-])color\s*:\s*([^;]+);", body, re.IGNORECASE)
        bg_m = re.search(r"\bbackground(?:-color)?\s*:\s*([^;]+);", body, re.IGNORECASE)
        if not (color_m and bg_m):
            continue
        fg = parse_color(color_m.group(1))
        bg = parse_color(bg_m.group(1))
        if not (fg and bg):
            continue
        ratio = wcag_contrast_ratio(fg, bg)
        lc, polarity = apca_lc(fg, bg)
        size_class = classify_text_size(body)
        assumed = size_class is None
        size_class = size_class or "normal"
        wcag_min = 3.0 if size_class == "large" else 4.5
        apca_min = 45 if size_class == "large" else 75
        if ratio >= wcag_min and abs(lc) >= apca_min:
            continue
        size_note = (
            " (no font-size in this rule -- assuming normal-sized text)"
            if assumed else f" ({size_class} text per this rule's font-size/weight)"
        )
        out.append((
            offset,
            f"color: {color_m.group(1).strip()} on background: {bg_m.group(1).strip()} "
            f"resolves to a WCAG contrast ratio of {ratio:.2f}:1 (needs >= {wcag_min}:1) "
            f"and an APCA contrast of Lc {lc:.1f} {polarity} (needs >= Lc {apca_min}){size_note}.",
            f"Choose a pair that clears both: WCAG >= {wcag_min}:1 and APCA >= Lc {apca_min} "
            "for this text size/weight (see the APCA thresholds table in SKILL.md for other "
            "sizes). Prefer a verified design token over a literal color.",
        ))
    return out


def check_color_needs_manual_check(text):
    """A literal text color with no background declared in the same rule --
    neither metric can be computed from this file alone."""
    out = []
    for offset, _selector, body in iter_css_rule_blocks(text):
        color_m = re.search(r"(?<![\w-])color\s*:\s*([^;]+);", body, re.IGNORECASE)
        bg_m = re.search(r"\bbackground(?:-color)?\s*:\s*([^;]+);", body, re.IGNORECASE)
        if not color_m or bg_m:
            continue
        fg = parse_color(color_m.group(1))
        if not fg:
            continue
        out.append((
            offset,
            f"color: {color_m.group(1).strip()} is a hardcoded value with no "
            "background declared in the same rule -- neither its WCAG ratio nor its "
            "APCA Lc can be computed from this file alone.",
            "Check both against the real rendered background: WCAG >= 4.5:1 (>= 3:1 "
            "large text/UI) and APCA (Lc 90 preferred for body text, down to Lc 45 for "
            "large headlines -- see the thresholds table in SKILL.md). Prefer a "
            "verified design token over a literal color.",
        ))
    return out


def check_focus_outline(text):
    out = []
    has_focus_visible = bool(re.search(r":focus-visible", text))
    for m in re.finditer(
        r"([.\w:#\[\]-]+)\s*\{[^}]*\boutline\s*:\s*(none|0)\b[^}]*\}",
        text, re.IGNORECASE | re.DOTALL,
    ):
        if not has_focus_visible:
            out.append((
                m.start(),
                "A rule sets outline:none/0 and this file defines no :focus-visible "
                "replacement -- keyboard users lose all visible focus indication.",
                "Add a :focus-visible rule with a visible indicator (e.g. outline: 2px "
                "solid <your focus-ring token/color>) before removing the default.",
            ))
    return out


def check_clickable_div(text):
    out = []
    click_handlers = re.findall(r"addEventListener\(\s*['\"]click['\"]", text)
    if not click_handlers:
        return out
    for m in re.finditer(r"<(div|span)\b([^>]*)>", text, re.IGNORECASE):
        tag, attrs = m.group(1), m.group(2)
        if re.search(r"\brole\s*=", attrs, re.IGNORECASE) and re.search(r"\btabindex\s*=", attrs, re.IGNORECASE):
            continue
        class_match = re.search(r'class\s*=\s*["\']([^"\']+)["\']', attrs)
        part_match = re.search(r'part\s*=\s*["\']([^"\']+)["\']', attrs)
        names = []
        if class_match:
            names.extend(class_match.group(1).split())
        if part_match:
            names.extend(part_match.group(1).split())
        if not names:
            continue
        # Heuristic: does any class/part name also appear as a querySelector-ish
        # target near a click listener? This can false-positive on coincidental
        # name reuse -- treat as LOW confidence, always confirm by hand.
        if any(re.search(re.escape(n), text) for n in names):
            out.append((
                m.start(),
                f"A <{tag}> looks like it may have a click handler wired up in script "
                "but has no role/tabindex here -- if so, it is likely not keyboard-"
                "focusable or announced as interactive.",
                'Replace it with a native <button>, or add role="button" tabindex="0" '
                "plus a keydown handler that activates on Enter and Space.",
            ))
    return out


ROLE_EXPECTATIONS = {
    "combobox": ["aria-expanded"],
    "tab": ["aria-selected"],
    "dialog": ["aria-modal"],
    "progressbar": ["aria-valuenow"],
}


def check_aria_widget_state(text):
    out = []
    for m in re.finditer(r'role\s*=\s*["\'](\w+)["\']', text, re.IGNORECASE):
        role = m.group(1).lower()
        expected = ROLE_EXPECTATIONS.get(role)
        if not expected:
            continue
        window = text[max(0, m.start() - 300): m.start() + 300]
        missing = [a for a in expected if a not in window]
        if missing:
            out.append((
                m.start(),
                f'role="{role}" has no {", ".join(missing)} nearby in this file -- '
                "assistive tech may not be able to report this widget's state.",
                f"Set {', '.join(missing)} and keep it in sync with the component's "
                "internal state on every update.",
            ))
    return out


def check_decorative_asset_alt(text):
    out = []
    for m in re.finditer(r"<img\b[^>]*?/?>", text, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        if not re.search(DECORATIVE_ASSETS, tag):
            continue
        alt = re.search(r"\balt\s*=\s*([\"'])(.*?)\1", tag, re.DOTALL)
        if alt and alt.group(2).strip():
            out.append((
                m.start(),
                "A decorative panel asset (laurel, pitch lines, pattern) has "
                "non-empty alt text -- a screen reader reads ornament between the "
                "screen's real content.",
                'Use alt="" (and aria-hidden="true" on decorative wrappers). If the '
                "image genuinely carries meaning on this screen, move it out of the "
                "decorative folders.",
            ))
    return out


def check_informative_asset_alt(text):
    out = []
    for m in re.finditer(r"<img\b[^>]*?/?>", text, re.IGNORECASE | re.DOTALL):
        tag = m.group(0)
        if not re.search(INFORMATIVE_ASSETS, tag):
            continue
        alt = re.search(r"\balt\s*=\s*([\"'])(.*?)\1", tag, re.DOTALL)
        if alt and not alt.group(2).strip():
            out.append((
                m.start(),
                "A player avatar or item image has empty alt text -- the "
                "information it carries is lost to a screen reader.",
                'Describe it in pt-BR: the player (alt="Avatar de Atleta Exemplo") or the '
                "item (alt=\"Coroa dourada\"); keep rarity and price as visible text.",
            ))
    return out


def check_screen_heading(text):
    out = []
    for m in re.finditer(r"\brender\s*:\s*\([^)]*\)\s*=>\s*`(.*?)`", text, re.DOTALL):
        if not re.search(r"<h[1-6]\b|role\s*=\s*[\"']heading", m.group(1), re.IGNORECASE):
            out.append((
                m.start(),
                "This screen's markup has no heading -- screen-reader users "
                "navigating by heading can't find or name the screen.",
                "Start every screen at h2, visually hidden with .visually-hidden if "
                "the design has no visible title.",
            ))
    return out


def check_emoji_content(text):
    out = []
    for m in re.finditer(r"`([^`]*)`", text, re.DOTALL):
        em = EMOJI.search(m.group(1))
        if em:
            out.append((
                m.start(1) + em.start(),
                f"Emoji {em.group(0)!r} in markup -- screen readers read its Unicode "
                "name, and emoji stand-ins for items or icons are banned by rbg-taste.",
                "Use the real pixel asset with pt-BR alt, or an SVG icon with "
                'aria-hidden="true" inside a labelled control.',
            ))
    return out


def check_progress_value(text):
    out = []
    for m in re.finditer(r"<(progress|[a-z]+[^>]*role\s*=\s*[\"']progressbar[\"'])\b[^>]*>", text, re.IGNORECASE):
        tag = m.group(0)
        if tag.lower().startswith("<progress"):
            if not re.search(r"\bvalue\s*=", tag):
                out.append((m.start(), "A <progress> without value= is indeterminate -- the "
                            "player's real progress isn't exposed.",
                            'Set value and max (and aria-valuetext in pt-BR, e.g. "455 de 860 XP").'))
        elif not re.search(r"aria-valuenow\s*=", tag):
            out.append((m.start(), "A role=progressbar without aria-valuenow exposes no value.",
                        "Set aria-valuenow/min/max and a pt-BR aria-valuetext, or use <progress>."))
    return out


def check_table_headers(text):
    out = []
    for m in re.finditer(r"<table\b.*?</table>", text, re.IGNORECASE | re.DOTALL):
        if not re.search(r"<th\b", m.group(0), re.IGNORECASE):
            out.append((m.start(), "A <table> without <th> headers -- cells can't be tied "
                        "to their column (position, player, tier, matches).",
                        'Add <th scope="col"> per column, a <caption>, and row headers where meaningful.'))
    return out


def check_global_style_leak(text):
    out = []
    for m in re.finditer(r"(^|})\s*([^{}@]+?)\s*\{", text):
        for sel in m.group(2).split(","):
            sel = sel.strip()
            if not sel or sel.startswith(("from", "to")) or re.match(r"^\d+%$", sel):
                continue
            if re.match(r"^(html|body|:root|\*)(\b|$|[\s:>.\[])", sel) and not re.search(r"\.rbg\b|#rbg\b|\.host\b", sel):
                if sel.startswith(":root"):
                    continue
                out.append((m.start(2), f"Selector {sel!r} styles the host page, not the panel -- "
                            "a global reset or outline change can break the host's own accessibility.",
                            "Scope it under .rbg (or .host for the dev simulator only)."))
    return out


def check_target_size(text):
    out = []
    for m in re.finditer(
        r"([.\w-]*(?:icon|button|control|tab|chip)[.\w-]*)\s*\{([^}]*)\}",
        text, re.IGNORECASE | re.DOTALL,
    ):
        selector, body = m.group(1), m.group(2)
        for prop in ("width", "height", "min-width", "min-height"):
            pm = re.search(rf"\b{prop}\s*:\s*(\d+(?:\.\d+)?)px", body, re.IGNORECASE)
            if pm and float(pm.group(1)) < 24:
                out.append((
                    m.start(),
                    f"{selector} sets {prop}: {pm.group(1)}px, under the 24x24 CSS px "
                    "minimum target size.",
                    "Increase to at least 24x24px (44x44px recommended for comfortable "
                    "touch), unless this component has its own documented minimum.",
                ))
    return out


def check_error_input(text):
    out = []
    pattern = r'<input\b([^>]*class\s*=\s*["\'][^"\']*\berror\b[^"\']*["\'][^>]*)/?>'
    for m in re.finditer(pattern, text, re.IGNORECASE):
        attrs = m.group(1)
        if not re.search(r"aria-invalid\s*=", attrs, re.IGNORECASE):
            out.append((
                m.start(),
                'An input with an "error" class has no aria-invalid attribute -- the '
                "error state is only conveyed visually.",
                'Add aria-invalid="true" plus aria-describedby pointing at the visible '
                "error message element.",
            ))
    return out


# rule_id, SC number, title, POUR letter, impact, confidence, detector, why-this-confidence
RULES = [
    ("img-alt", "1.1.1", "Image missing alt text", "P", "MEDIUM", "HIGH",
     check_img_alt,
     "Purely syntactic: an <img> tag either carries alt= or it doesn't."),
    ("icon-only-control", "1.1.1", "Icon-only control without accessible name", "P", "HIGH", "MEDIUM",
     check_icon_only_control,
     "Reliable for empty-inner-HTML buttons, but can miss a name supplied via "
     "slotted content or set dynamically in JS after render."),
    ("input-label", "1.3.1", "Form control without a label", "P", "MEDIUM", "MEDIUM",
     check_input_label,
     "Matches <label for> and aria-label/-labelledby in the same file; misses "
     "labels defined in a different file or attached at runtime."),
    ("heading-sequence", "1.3.1", "Non-sequential heading levels", "P", "LOW", "MEDIUM",
     check_heading_sequence,
     "Only sees headings within one file -- cannot know the true heading "
     "context of the page a component renders into."),
    ("color-contrast-pair", "1.4.3 / 1.4.11", "Text/background pair fails WCAG and/or APCA contrast", "P", "MEDIUM", "MEDIUM",
     check_color_contrast_pair,
     "The WCAG ratio and APCA Lc math on the two extracted colors is exact; "
     "the heuristic part is confirming this really is a rendered text-on-"
     "background style rule and not, say, an unrelated JS object that "
     "happens to use the words 'color'/'background'."),
    ("color-needs-manual-check", "1.4.3", "Hardcoded color needs a manual contrast check", "P", "MEDIUM", "LOW",
     check_color_needs_manual_check,
     "Flags a hardcoded value with no paired background in the same rule; "
     "both WCAG ratio and APCA Lc depend on the actual rendered background, "
     "which this script cannot see here."),
    ("focus-outline", "2.4.7", "Focus outline removed without replacement", "O", "MEDIUM", "MEDIUM",
     check_focus_outline,
     "Text-matches outline:none/0 against :focus-visible in the same file; "
     "misses a replacement defined in a shared stylesheet elsewhere."),
    ("clickable-div", "2.1.1", "Non-focusable clickable element", "O", "HIGH", "LOW",
     check_clickable_div,
     "Infers a click handler from a coincidentally-matching class/part name "
     "anywhere in the file -- confirm every hit by hand."),
    ("aria-widget-state", "4.1.2", "ARIA widget missing expected state attribute", "R", "HIGH", "LOW",
     check_aria_widget_state,
     "Only checks nearby text for the expected attribute name; state set "
     "dynamically further away in the file will false-positive."),
    ("decorative-asset-alt", "1.1.1", "Decorative panel asset announced to screen readers", "P", "LOW", "HIGH",
     check_decorative_asset_alt,
     "Purely syntactic on the asset path and the alt value -- relies on the "
     "folder convention in public/assets/ being followed."),
    ("informative-asset-alt", "1.1.1", "Avatar or item image with empty alt", "P", "MEDIUM", "HIGH",
     check_informative_asset_alt,
     "Purely syntactic on the asset path and the alt value; an image whose "
     "src is built from a variable isn't matched."),
    ("screen-heading", "1.3.1 / 2.4.6", "Screen without a heading", "P", "MEDIUM", "MEDIUM",
     check_screen_heading,
     "Matches arrow-function `render` template strings in screen modules; a "
     "heading built by a helper or injected later is missed."),
    ("emoji-content", "1.1.1", "Emoji used as content, icon or item art", "P", "MEDIUM", "MEDIUM",
     check_emoji_content,
     "Matches emoji code points inside template strings; an emoji in a code "
     "comment inside a template, or one meant as copy, still needs a person."),
    ("progress-value", "1.3.1 / 4.1.2", "Progress without an exposed value", "R", "MEDIUM", "HIGH",
     check_progress_value,
     "Purely syntactic on the progress element's attributes; values set "
     "later in JS will false-positive."),
    ("table-headers", "1.3.1", "Data table without header cells", "P", "MEDIUM", "HIGH",
     check_table_headers,
     "Purely syntactic on a literal <table>...</table> in one string."),
    ("global-style-leak", "panel-embedding", "Style escapes the .rbg scope into the host", "R", "HIGH", "MEDIUM",
     check_global_style_leak,
     "Matches top-level html/body/* selectors in CSS; :root custom properties "
     "are allowed, and nested or generated selectors are not resolved."),
    ("target-size", "2.5.8", "Target size under 24x24 CSS px", "O", "MEDIUM", "LOW",
     check_target_size,
     "Matches literal px values against an interactive-sounding selector "
     "name -- cannot see computed/inherited sizing."),
    ("error-input", "3.3.1", "Error state not exposed via aria-invalid", "U", "MEDIUM", "MEDIUM",
     check_error_input,
     "Depends on the project using a literal 'error' class name for invalid "
     "fields; a different naming convention will be missed."),
]

RULES_BY_ID = {r[0]: r for r in RULES}


def scan_file(path, text):
    findings = []
    for rule_id, sc, title, pour, impact, confidence, fn, _why in RULES:
        if rule_id in CSS_ONLY_RULES and not path.endswith(".css"):
            continue
        for offset, issue, fix in fn(text):
            findings.append(Finding(
                rule_id=rule_id, sc=sc, title=title, pour=pour,
                impact=impact, confidence=confidence,
                file=path, line=line_at(text, offset),
                issue=issue, fix=fix,
            ))
    return findings


def collect_files(paths):
    files = []
    for p in paths:
        if os.path.isfile(p):
            files.append(p)
        elif os.path.isdir(p):
            for root, dirs, names in os.walk(p):
                dirs[:] = [d for d in dirs if d not in SKIP_DIRS and not d.startswith(".")]
                for name in names:
                    if os.path.splitext(name)[1] in SCAN_EXTENSIONS:
                        files.append(os.path.join(root, name))
        else:
            print(f"warning: path not found, skipping: {p}", file=sys.stderr)
    return sorted(files)


def compute_score(findings):
    deduction = sum(
        IMPACT_WEIGHT[f.impact] * CONFIDENCE_MULTIPLIER[f.confidence]
        for f in findings
    )
    return max(0, round(100 - deduction))


def verdict(score):
    if score >= 90:
        return "Strong -- spot-check the flagged items, this is not a certification."
    if score >= 75:
        return "Needs attention -- review the HIGH and MEDIUM impact findings before shipping."
    if score >= 50:
        return "Significant gaps -- prioritize every HIGH impact finding first."
    return "Not ready -- multiple high-impact blockers, work through POUR order in SKILL.md."


CONFIDENCE_LEGEND = """\
Confidence key
  HIGH   Purely syntactic pattern -- if it fires, the rule is correct.
  MEDIUM Contextual heuristic -- usually correct, can miss cross-file or
         runtime-only cases (a label in another file, aria set dynamically).
  LOW    Suggestive pattern only -- confirm every hit by hand before acting
         on it; false positives are expected.
"""


def print_confidence_table():
    print(CONFIDENCE_LEGEND)
    header = f"{'Rule':<26}{'SC':<16}{'Impact':<8}{'Confidence':<12}Why"
    print(header)
    print("-" * len(header))
    for rule_id, sc, title, pour, impact, confidence, _fn, why in RULES:
        print(f"{rule_id:<26}{sc:<16}{impact:<8}{confidence:<12}{why}")
    print()


def print_apca_table():
    print("APCA Lc reference (Helvetica/Arial-based; see SKILL.md for the full picture):")
    for lc, meaning in APCA_THRESHOLDS:
        print(f"  Lc {lc:<3} {meaning}")
    print("  Sign: positive Lc = dark text on light background (BoW); "
          "negative Lc = light text on dark background (WoB).")
    print()


def print_report(findings, score, min_confidence):
    if min_confidence:
        findings = [f for f in findings if CONFIDENCE_RANK[f.confidence.lower()] >= CONFIDENCE_RANK[min_confidence]]

    print_confidence_table()
    print_apca_table()

    if not findings:
        print("No findings from the automated checks.\n")
    else:
        by_impact = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for f in findings:
            by_impact[f.impact] += 1
        print(f"{len(findings)} finding(s) -- HIGH: {by_impact['HIGH']}  "
              f"MEDIUM: {by_impact['MEDIUM']}  LOW: {by_impact['LOW']}\n")

        for f in sorted(findings, key=lambda x: (-IMPACT_WEIGHT[x.impact], x.file, x.line)):
            print(f"[SC {f.sc}] {f.title} -- {f.impact} (confidence: {f.confidence})")
            print(f"Location: {f.file}:{f.line}")
            print(f"Issue: {f.issue}")
            print(f"Fix: {f.fix}")
            print()

    print(f"Accessibility score: {score}/100 -- {verdict(score)}\n")

    print("What this script cannot check (verify these by hand, per SKILL.md):")
    print("  - Colors set via a CSS custom property (var(--...)), gradients, or images --")
    print("    only literal hex/rgb()/named colors can be resolved statically.")
    print("  - Real rendered contrast when text and background aren't declared in the same rule.")
    print("  - Actual keyboard behavior: tab order, focus traps, Enter/Space activation.")
    print("  - What a screen reader actually announces at runtime.")
    print("  - Anything set dynamically in JS that this file's text does not show.")


def print_json(findings, score, min_confidence, files_scanned):
    if min_confidence:
        findings = [f for f in findings if CONFIDENCE_RANK[f.confidence.lower()] >= CONFIDENCE_RANK[min_confidence]]
    payload = {
        "files_scanned": files_scanned,
        "score": score,
        "verdict": verdict(score),
        "confidence_legend": {
            "HIGH": "Purely syntactic pattern -- if it fires, the rule is correct.",
            "MEDIUM": "Contextual heuristic -- can miss cross-file or runtime-only cases.",
            "LOW": "Suggestive only -- confirm every hit by hand.",
        },
        "apca_thresholds": [{"lc": lc, "meaning": meaning} for lc, meaning in APCA_THRESHOLDS],
        "rules": [
            {"id": r[0], "sc": r[1], "title": r[2], "pour": r[3], "impact": r[4],
             "confidence": r[5], "why_this_confidence": r[7]}
            for r in RULES
        ],
        "findings": [asdict(f) for f in findings],
    }
    print(json.dumps(payload, indent=2))


def main():
    parser = argparse.ArgumentParser(description="Static WCAG 2.2 accessibility scanner for the rbg-ui panel.")
    parser.add_argument("paths", nargs="*", default=DEFAULT_PATHS,
                        help="Files or directories to scan (default: index.html src styles).")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON instead of the text report.")
    parser.add_argument("--min-confidence", choices=["low", "medium", "high"], default=None,
                         help="Only show findings at or above this confidence level.")
    args = parser.parse_args()

    files = collect_files(args.paths)
    all_findings = []
    for path in files:
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as fh:
                text = fh.read()
        except OSError as e:
            print(f"warning: could not read {path}: {e}", file=sys.stderr)
            continue
        all_findings.extend(scan_file(path, text))

    score = compute_score(all_findings)

    if args.json:
        print_json(all_findings, score, args.min_confidence, len(files))
    else:
        print(f"Scanned {len(files)} file(s).\n")
        print_report(all_findings, score, args.min_confidence)


if __name__ == "__main__":
    main()
