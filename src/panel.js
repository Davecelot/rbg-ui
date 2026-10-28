import { bindArt } from './screens/art.js';
import { icon } from './screens/icons.js';
import { play } from './data/play.js';
import { positions } from './data/positions.js';

const find = (list, id) => list.find((item) => item.id === id) ?? list[0];

const tabButton = (item, attr) =>
  `<button type="button" role="tab" id="rbg-${attr}-${item.id}" data-${attr}="${item.id}" aria-controls="rbg-view">` +
  `<span class="rbg-tab__label">${item.label}</span>` +
  (item.badge ? ` <span class="rbg-badge">${item.badge}</span>` : '') +
  `</button>`;

const sizeOption = (size) =>
  `<label class="rbg-settings__option"><input type="radio" name="rbg-size" value="${size.id}" />` +
  `<span>${size.width} × ${size.height}</span> <span class="rbg-settings__fit" hidden>(não cabe na tela: diminui até caber)</span></label>`;

const shell = (tabs, sizes) => `
  <section class="rbg-panel" role="dialog" aria-labelledby="rbg-title">
    <div class="rbg-ambient" aria-hidden="true"></div>
    <header class="rbg-header">
      <h1 id="rbg-title" class="rbg-brand">RBG</h1>
      <div class="rbg-header__actions">
        <span class="rbg-demo-label">Dados de exemplo</span>
        <button type="button" class="rbg-icon-button" data-action="settings" aria-label="Configurações" aria-expanded="false" aria-controls="rbg-settings">${icon('settings')}</button>
        <button type="button" class="rbg-icon-button" data-action="close" aria-label="Fechar">${icon('close')}</button>
      </div>
      <div class="rbg-settings" id="rbg-settings" hidden>
        <fieldset class="rbg-settings__sizes">
          <legend class="rbg-settings__title">Resolução da janela</legend>
          ${sizes.map(sizeOption).join('')}
        </fieldset>
        <label class="rbg-settings__option"><input type="checkbox" name="rbg-ambient-motion" aria-describedby="rbg-motion-note" />Animar fundo</label>
        <p class="rbg-settings__fit" id="rbg-motion-note" hidden>Movimento reduzido nas preferências do sistema.</p>
      </div>
    </header>
    <nav class="rbg-tabs" aria-label="Seções">
      <div role="tablist" aria-label="Seções">${tabs.map((tab) => tabButton(tab, 'tab')).join('')}</div>
    </nav>
    <div class="rbg-subtabs" role="tablist"></div>
    <div class="rbg-view" id="rbg-view" role="tabpanel" tabindex="0"></div>
    <footer class="rbg-actionbar">
      <div class="rbg-actionbar__context">
        <p class="rbg-actionbar__eyebrow"></p>
        <p class="rbg-actionbar__title"></p>
        <p class="rbg-actionbar__reason" id="rbg-actionbar-reason"></p>
        <p class="rbg-actionbar__queue" hidden><time data-queue-time aria-live="off">0:00</time><span data-queue-positions></span></p>
      </div>
      <button type="button" class="rbg-cta" data-action="primary"></button>
    </footer>
  </section>
  <p id="rbg-status" class="rbg-visually-hidden" aria-live="polite"></p>`;

const storedSize = () => {
  try {
    return localStorage.getItem('rbg:size');
  } catch {
    return null;
  }
};

export function mountPanel(root, { tabs, modes, sizes, defaultSize, launcher }) {
  const params = new URLSearchParams(location.search);
  const state = { tab: find(tabs, params.get('tab')) };
  const legacyJogarMode =
    state.tab.id === 'jogar' ? { 'ranqueada-solo': 'buscando', amistosos: 'amistosos' }[params.get('sub')] : null;
  const requestedSub = state.tab.showSubtabs === false ? state.tab.subs[0].id : params.get('sub');
  state.sub = find(state.tab.subs, legacyJogarMode ? 'modo' : requestedSub);
  state.view = state.sub.states.includes(params.get('state')) ? params.get('state') : state.sub.states[0];
  state.mode = find(modes, legacyJogarMode ?? params.get('mode'));
  if (state.tab.id === 'jogar' && state.sub.id === 'modo' && state.mode.id.startsWith('escolhido-')) {
    state.mode = find(modes, 'escolher');
  } else if (state.tab.id !== 'jogar' && !(state.tab.id === 'rcs-week' && state.sub.id === 'fila')) {
    state.mode = find(modes, 'escolher');
  }
  state.size = find(sizes, params.get('size') ?? storedSize() ?? defaultSize);

  root.innerHTML = shell(tabs, sizes);
  const tabList = root.querySelector('.rbg-tabs [role=tablist]');
  const subList = root.querySelector('.rbg-subtabs');
  const view = root.querySelector('.rbg-view');
  const actionbar = root.querySelector('.rbg-actionbar');
  const cta = actionbar.querySelector('[data-action=primary]');
  const status = root.querySelector('#rbg-status');
  const settingsButton = root.querySelector('[data-action=settings]');
  const settings = root.querySelector('#rbg-settings');
  const motionInput = settings.querySelector('[name=rbg-ambient-motion]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let ambientMotion = true;
  try {
    ambientMotion = localStorage.getItem('rbg:ambient-motion') !== 'false';
  } catch {
    // Keep the session preference when host storage is unavailable.
  }
  function syncAmbientMotion() {
    motionInput.disabled = reducedMotion.matches;
    motionInput.checked = ambientMotion && !reducedMotion.matches;
    settings.querySelector('#rbg-motion-note').hidden = !reducedMotion.matches;
    root.dataset.ambientMotion = String(ambientMotion && !reducedMotion.matches);
  }
  reducedMotion.addEventListener('change', syncAmbientMotion);
  syncAmbientMotion();
  let cleanup = null;
  let renderVersion = 0;
  let queue = null;
  let queueTimer = null;
  const onSolo = () => state.tab.id === 'jogar' && state.mode.id === 'buscando';

  function syncQueueTime() {
    if (!queue || !root.isConnected) {
      clearInterval(queueTimer);
      queueTimer = null;
      return;
    }
    const seconds = Math.max(0, Math.floor((Date.now() - queue.startedAt) / 1000));
    const elapsed = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    for (const timer of root.querySelectorAll('[data-queue-time]')) {
      timer.textContent = elapsed;
      timer.setAttribute('datetime', `PT${seconds}S`);
    }
  }

  function startQueue() {
    if (queue) return;
    const { primary, secondary, primaryOptions, secondaryOptions } = play.queue;
    if (!primaryOptions.includes(primary) || !secondaryOptions.includes(secondary)) {
      announce('Escolha suas posições antes de entrar na fila.');
      return;
    }
    queue = { startedAt: Date.now(), primary, secondary };
    queueTimer = setInterval(syncQueueTime, 1000);
    render();
    cta.focus();
    announce('Você entrou na fila. Procurando partida.');
  }

  function leaveQueue() {
    if (!queue) return;
    queue = null;
    clearInterval(queueTimer);
    queueTimer = null;
    if (state.tab.id !== 'jogar') state.mode = find(modes, 'escolher');
    render();
    cta.focus();
    announce('Você saiu da fila.');
  }

  function applySize() {
    root.style.setProperty('--panel-w', `${state.size.width}px`);
    root.dataset.size = state.size.id;
    settings.querySelector(`[name=rbg-size][value="${state.size.id}"]`).checked = true;
  }

  function toggleSettings(open) {
    settings.hidden = !open;
    settingsButton.setAttribute('aria-expanded', String(open));
    if (!open) return;
    const gutter = parseFloat(getComputedStyle(root).getPropertyValue('--host-gutter'));
    for (const option of settings.querySelectorAll('.rbg-settings__sizes .rbg-settings__option')) {
      const size = find(sizes, option.querySelector('input').value);
      const fits = size.width <= root.clientWidth - 2 * gutter && size.height <= root.clientHeight - 2 * gutter;
      option.querySelector('.rbg-settings__fit').hidden = fits;
    }
    settings.querySelector('[name=rbg-size]:checked').focus();
  }

  function syncTabs(list, attr, selected) {
    for (const button of list.querySelectorAll('[role=tab]')) {
      const isSelected = button.dataset[attr] === selected.id;
      button.setAttribute('aria-selected', String(isSelected));
      button.tabIndex = isSelected ? 0 : -1;
    }
  }

  function render({ announce = false } = {}) {
    const version = ++renderVersion;
    const { tab, sub, view: screenState, mode } = state;
    const hasSubs = tab.subs.length > 1;
    const showSubtabs = hasSubs && tab.showSubtabs !== false;
    syncTabs(tabList, 'tab', tab);

    subList.hidden = !showSubtabs;
    subList.setAttribute('aria-label', tab.label);
    subList.innerHTML = showSubtabs ? tab.subs.map((item) => tabButton(item, 'sub')).join('') : '';
    if (showSubtabs) syncTabs(subList, 'sub', sub);

    cleanup?.();
    cleanup = null;
    view.className = `rbg-view rbg-screen--${tab.id} rbg-sub--${sub.id}`;
    Object.assign(view.dataset, { tab: tab.id, sub: sub.id, state: screenState });
    view.setAttribute('aria-labelledby', showSubtabs ? `rbg-sub-${sub.id}` : `rbg-tab-${tab.id}`);
    view.innerHTML = sub.render({ state: screenState, data: { queue, mode: mode.id } });
    view.scrollTop = 0;

    actionbar.dataset.mode = mode.id;
    actionbar.dataset.queue = queue ? 'searching' : 'idle';
    actionbar.querySelector('.rbg-actionbar__eyebrow').textContent = queue ? 'Procurando partida' : mode.eyebrow;
    actionbar.querySelector('.rbg-actionbar__title').textContent = queue ? 'Ranqueada Solo' : mode.title;
    cta.textContent = queue ? 'Sair da fila' : onSolo() ? 'Entrar na fila' : mode.cta;
    const waitingForMode = tab.id === 'jogar' && mode.id === 'escolher';
    cta.setAttribute('aria-disabled', String(!queue && !onSolo() && (Boolean(mode.disabled) || waitingForMode)));
    const queueInfo = actionbar.querySelector('.rbg-actionbar__queue');
    queueInfo.hidden = !queue;
    if (queue) {
      actionbar.querySelector('[data-queue-positions]').textContent =
        `Primária: ${queue.primary} (${positions[queue.primary]}). Secundária: ${queue.secondary} (${positions[queue.secondary]}).`;
      syncQueueTime();
    }
    const reason = actionbar.querySelector('.rbg-actionbar__reason');
    const reasonText = mode.reason ?? (waitingForMode ? 'Escolha um modo para continuar.' : '');
    reason.textContent = reasonText;
    reason.hidden = Boolean(queue) || !reasonText;
    if (!queue && reasonText) cta.setAttribute('aria-describedby', reason.id);
    else cta.removeAttribute('aria-describedby');

    const query = new URLSearchParams({
      tab: tab.id,
      sub: sub.id,
      state: screenState,
      mode: mode.id,
      size: state.size.id,
    });
    history.replaceState(null, '', `?${query}`);
    if (announce) {
      const jogarContext = { buscando: 'Ranqueada Solo', amistosos: 'Amistosos' }[mode.id];
      status.textContent = hasSubs
        ? `${tab.label} — ${sub.label}`
        : jogarContext
          ? `${tab.label} — ${jogarContext}`
          : tab.label;
    }
    // Last, because a screen may switch the play mode on entry, which re-renders.
    const nextCleanup = sub.enter?.(view, api) ?? null;
    if (version === renderVersion) {
      const unbindArt = bindArt(view);
      cleanup = () => {
        nextCleanup?.();
        unbindArt();
      };
    }
  }

  function selectTab(tab) {
    const leavingPlayContext = state.tab.id === 'jogar' || (state.tab.id === 'rcs-week' && state.sub.id === 'fila');
    Object.assign(state, { tab, sub: tab.subs[0], view: tab.subs[0].states[0] });
    if (!queue && (leavingPlayContext || tab.id === 'jogar')) state.mode = find(modes, 'escolher');
    render({ announce: true });
  }

  function selectSub(sub) {
    const leavingRcsQueue = state.tab.id === 'rcs-week' && state.sub.id === 'fila' && sub.id !== 'fila';
    Object.assign(state, { sub, view: sub.states[0] });
    if (!queue && leavingRcsQueue) state.mode = find(modes, 'escolher');
    render({ announce: true });
  }

  function setMode(id) {
    if (queue) return;
    state.mode = find(modes, id);
    render();
  }

  function open() {
    root.hidden = false;
    if (launcher) launcher.hidden = true;
    tabList.querySelector('[aria-selected=true]').focus();
  }

  function close() {
    root.hidden = true;
    if (launcher) {
      launcher.hidden = false;
      launcher.focus();
    }
  }

  function roving(list, items, attr, select) {
    list.addEventListener('click', (event) => {
      const button = event.target.closest('[role=tab]');
      if (button) select(find(items(), button.dataset[attr]));
    });
    list.addEventListener('keydown', (event) => {
      const buttons = [...list.querySelectorAll('[role=tab]')];
      const index = buttons.indexOf(document.activeElement);
      if (index === -1) return;
      const last = buttons.length - 1;
      const next = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: last }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      const target = buttons[(next + buttons.length) % buttons.length];
      select(find(items(), target.dataset[attr]));
      list.querySelector(`[data-${attr}="${target.dataset[attr]}"]`).focus();
    });
  }

  const announce = (text) => {
    status.textContent = text;
  };
  const refresh = () => render();
  const currentMode = () => state.mode.id;
  const api = { setMode, mode: currentMode, queue: () => queue, close, announce, refresh, view };

  roving(tabList, () => tabs, 'tab', selectTab);
  roving(subList, () => state.tab.subs, 'sub', selectSub);
  root.querySelector('[data-action=close]').addEventListener('click', close);
  cta.addEventListener('click', () => {
    if (queue) return leaveQueue();
    if (onSolo()) return startQueue();
    const mode = state.mode;
    if (mode.disabled || (state.tab.id === 'jogar' && mode.id === 'escolher')) {
      return announce(mode.reason ?? 'Escolha um modo para continuar.');
    }
    if (mode.pending) return announce(mode.announcement ?? `${mode.cta}: ainda não está no protótipo.`);
    if (mode.id === 'escalacao') {
      const target = view.querySelector('#jogar-escalacao');
      target?.scrollIntoView({ block: 'start' });
      target?.focus({ preventScroll: true });
      announce('Escalação da partida.');
      return;
    }
    if (!mode.go) return;
    const tab = find(tabs, mode.go.tab);
    const sameTab = tab.id === state.tab.id;
    Object.assign(state, { tab, sub: find(tab.subs, mode.go.sub) });
    state.view = state.sub.states[0];
    if (mode.go.mode) state.mode = find(modes, mode.go.mode);
    render({ announce: true });
    if (sameTab) cta.focus();
    else (subList.hidden ? tabList : subList).querySelector('[aria-selected=true]').focus();
  });
  settingsButton.addEventListener('click', () => toggleSettings(settings.hidden));
  settings.addEventListener('change', (event) => {
    if (event.target === motionInput) {
      ambientMotion = motionInput.checked;
      syncAmbientMotion();
      try {
        localStorage.setItem('rbg:ambient-motion', String(ambientMotion));
      } catch {
        // Keep the session preference when host storage is unavailable.
      }
      return;
    }
    if (event.target.name !== 'rbg-size') return;
    state.size = find(sizes, event.target.value);
    try {
      localStorage.setItem('rbg:size', state.size.id);
    } catch {
      // Storage can be unavailable inside the host; the choice then lasts for this session only.
    }
    applySize();
    render();
  });
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!settings.hidden) {
      toggleSettings(false);
      settingsButton.focus();
    } else close();
  });
  launcher?.addEventListener('click', open);
  view.addEventListener('click', (event) => {
    const pending = event.target.closest('[data-pending]');
    if (pending) status.textContent = `${pending.dataset.pending}: ainda não está no protótipo.`;
    const link = event.target.closest('[data-go]');
    if (!link) return;
    const tab = find(tabs, link.dataset.go);
    if (link.dataset.goSub) {
      if (tab.id === state.tab.id && tab.showSubtabs === false) {
        selectSub(find(tab.subs, link.dataset.goSub));
      } else {
        selectTab(tab);
        selectSub(find(tab.subs, link.dataset.goSub));
      }
      const focusTarget = link.dataset.goFocus ? view.querySelector(link.dataset.goFocus) : null;
      if (focusTarget) focusTarget.focus();
      else if (tab.showSubtabs === false) view.querySelector('[data-sub-back]')?.focus();
      else (subList.hidden ? tabList : subList).querySelector('[aria-selected=true]').focus();
    } else {
      selectTab(tab);
      tabList.querySelector('[aria-selected=true]').focus();
    }
  });

  applySize();
  render();
  return api;
}
