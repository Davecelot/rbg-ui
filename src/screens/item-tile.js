import { artImage } from './art.js';
import { icon } from './icons.js';
// The item tile (panel-builder § Item templates): one slot per item, shaped by its type, filled at runtime.
const action = (name, item, go) => {
  if (item) return `data-item="${item}"`;
  if (go) return `data-go="${go.tab}" data-go-sub="${go.sub}"`;
  return `data-pending="Prévia de ${name}"`;
};

// `item` opens the item sheet for that id; `go` links to where an owned item lives.
export const itemTile = ({
  name,
  art,
  type = '',
  rarity = '',
  top = '',
  condition = '',
  note = '',
  locked = true,
  next = false,
  item,
  go,
  tag = 'li',
}) => `
  <${tag} class="rbg-tile${locked ? ' is-locked' : ''}${next ? ' is-next' : ''}">
    <button type="button" class="rbg-tile__button" ${action(name, item, go)}>
      <span class="rbg-tile__top">${top || (condition ? `<span class="rbg-tile__meta">${condition}</span>` : '')}${locked ? `<span class="rbg-tile__lock">${icon('lock')}<span class="rbg-visually-hidden">Bloqueado</span></span>` : ''}</span>
      <span class="rbg-slot rbg-tile__art${rarity ? ' rbg-product-art' : ''}" data-slot="item" data-rarity="${rarity}">${artImage(art, name)}</span>
      <span class="rbg-tile__name">${name}</span>
      ${type && type !== name ? `<span class="rbg-tile__meta">${type}</span>` : ''}
      ${rarity ? `<span class="rbg-tile__meta">${rarity.charAt(0).toUpperCase() + rarity.slice(1)}</span>` : ''}
      ${note ? `<span class="rbg-tile__meta">${note}</span>` : ''}
    </button>
  </${tag}>`;
