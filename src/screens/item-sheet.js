import { artImage, bindArt } from './art.js';
import { icon } from './icons.js';
import { player } from '../data/player.js';
// The item sheet (panel-builder § Item templates): one item you don't have yet, in a dialog inside the panel.

const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);

const meta = (item) => {
  const level = item.unlock?.level ? `nível ${item.unlock.level}` : '';
  return capital([item.category, level].filter(Boolean).join(', '));
};

const slug = (text = '') =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');

const unlockText = (item) =>
  item.unlock.source === 'pass'
    ? item.free
      ? `Libera grátis no nível ${item.unlock.level}`
      : `Libera com o Passe de Batalha, no nível ${item.unlock.level}`
    : `Ainda bloqueado${item.unlock.condition ? `. ${item.unlock.condition}` : ''}`;

const prices = ({ brl, eur, usd }) => [brl, [eur, usd].filter(Boolean).join(', ')].filter(Boolean);

const forSale = (item) => {
  const [main, others] = prices(item.price);
  return `
    <div class="rbg-sheet__buyrow">
      <p class="rbg-sheet__price">${main}${others ? ` <span class="rbg-sheet__meta">(${others})</span>` : ''}</p>
      <button type="button" class="rbg-button" data-pending="Comprar ${item.name}">Comprar por ${main}</button>
    </div>
    <div class="rbg-sheet__gift">
      <label class="rbg-visually-hidden" for="rbg-sheet-gift">Presentear: nome do amigo</label>
      <input class="rbg-input" id="rbg-sheet-gift" type="text" autocomplete="off" placeholder="Presentear: nome do amigo" />
      <button type="button" class="rbg-link" data-pending="Presentear ${item.name}">Presentear</button>
    </div>`;
};

const locked = (item) => `
    <p class="rbg-sheet__unlock">${unlockText(item)}</p>
    ${item.unlock.source === 'pass' && !item.free ? '<button type="button" class="rbg-button" data-pending="Obter o Passe">Obter o Passe</button>' : ''}
    ${item.replay ? `<button type="button" class="rbg-link" data-pending="${item.replay}">${item.replay}</button>` : ''}`;

const itemPreview = (item) =>
  item.category === 'Banner'
    ? `<span class="rbg-slot rbg-sheet__art rbg-product-art rbg-sheet__art--banner" data-slot="preview" data-rarity="${item.rarity ?? ''}" data-kind="${slug(item.category)}" data-alt="Prévia de ${item.name}">${artImage(item.preview ?? item.art, '', 192)}<span class="rbg-sheet__banner-identity">${artImage(player.avatarFrames?.[0]?.src, '', 64)}<span>${player.name}</span></span></span>`
    : `<span class="rbg-slot rbg-sheet__art rbg-product-art" data-slot="preview" data-rarity="${item.rarity ?? ''}" data-kind="${slug(item.category)}" data-alt="Prévia de ${item.name}">${artImage(item.preview ?? item.art, `Prévia de ${item.name}`)}</span>`;

const sheet = (item) => `
  <dialog class="rbg-sheet" aria-labelledby="rbg-sheet-title">
    <div class="rbg-sheet__head">
      <span class="rbg-slot rbg-sheet__thumb" data-slot="item" aria-hidden="true">${artImage(item.art, '', 64)}</span>
      <div>
        <h2 id="rbg-sheet-title" class="rbg-sheet__title">${item.name}</h2>
        <p class="rbg-sheet__meta">${item.rarity ? `<span class="rbg-tag">${capital(item.rarity)}</span> ` : ''}${meta(item)}</p>
        ${item.unlock?.source === 'club' ? '<p class="rbg-sheet__meta">Recompensa do clube</p>' : ''}
      </div>
      <button type="button" class="rbg-icon-button rbg-sheet__close" data-sheet-close aria-label="Fechar">${icon('close')}</button>
    </div>
    <figure class="rbg-sheet__preview">
      ${itemPreview(item)}
      ${item.previewCaption ? `<figcaption class="rbg-sheet__meta">${item.previewCaption}</figcaption>` : ''}
    </figure>
    ${item.description ? `<p class="rbg-sheet__text">${item.description}</p>` : ''}
    ${item.owned ? '<p class="rbg-sheet__unlock">Desbloqueada pelo clube</p>' : item.state === 'for-sale' ? forSale(item) : locked(item)}
  </dialog>`;

// Opens over the view when a `[data-item]` tile is pressed; `find(id)` returns the item.
// The panel is non-modal toward the host, but the sheet keeps Tab inside itself and Esc closes it before the panel.
export function itemSheets(view, api, find) {
  const panel = view.closest('.rbg-panel');
  let open = null;

  const close = () => {
    if (!open) return;
    const { dialog, trigger } = open;
    open = null;
    dialog.remove();
    if (trigger.isConnected) trigger.focus();
  };

  const onClick = (event) => {
    const trigger = event.target.closest('[data-item]');
    const item = trigger && find(trigger.dataset.item);
    if (!item) return;
    close();
    panel.insertAdjacentHTML('beforeend', sheet(item));
    const dialog = panel.lastElementChild;
    // Docked over the view only, so the shell's tabs, close button and play bar stay whole.
    dialog.style.top = `${view.offsetTop}px`;
    dialog.style.bottom = `${panel.clientHeight - view.offsetTop - view.offsetHeight}px`;
    dialog.addEventListener('click', (e) => {
      if (e.target.closest('[data-sheet-close]')) close();
      const pending = e.target.closest('[data-pending]');
      if (pending) api.announce(`${pending.dataset.pending}: ainda não está no protótipo.`);
    });
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
      if (e.key !== 'Tab') return;
      const focusable = [...dialog.querySelectorAll('button, [href], input')];
      const edge = e.shiftKey ? focusable[0] : focusable.at(-1);
      if (document.activeElement === edge) {
        e.preventDefault();
        (e.shiftKey ? focusable.at(-1) : focusable[0]).focus();
      }
    });
    bindArt(dialog);
    dialog.show();
    dialog.querySelector('[data-sheet-close]').focus();
    open = { dialog, trigger };
  };

  view.addEventListener('click', onClick);
  return () => {
    view.removeEventListener('click', onClick);
    if (open) {
      open.dialog.remove();
      open = null;
    }
  };
}
