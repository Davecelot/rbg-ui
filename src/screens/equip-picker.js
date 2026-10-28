import { artImage, bindArt } from './art.js';
import { avatarArt } from '../data/art.js';
import { showPreview } from './avatar.js';
import { icon } from './icons.js';
// The equip picker (panel-builder § Item templates): owned items of one type, a live detail, and one Equipar action.
const preview = (item) => {
  if (item.profilePreview === 'card')
    return `<div class="equip__preview profile-customize__card-wrap"><div class="profile-customize__card-preview">
      <span class="profile-customize__goal">GOL!</span>${artImage(avatarArt(0), 'Jogador 01')}
      <strong>JOGADOR 01</strong><span>Assim aparece quando você marca</span>
    </div></div>`;
  if (item.profilePreview === 'banner')
    return `<div class="equip__preview profile-customize__banner-wrap" role="img" aria-label="Prévia do perfil de Jogador 01 com Banner Gramado">
      <div class="profile-customize__banner-art" aria-hidden="true">
        <div class="profile-customize__pitch">
          ${artImage(item.art, item.name)}
          <span class="profile-customize__banner-name">${artImage(avatarArt(0), 'Avatar de Jogador 01', 24)}Jogador 01</span>
        </div>
      </div>
      <span class="profile-customize__preview-caption">Assim fica o topo do seu perfil.</span>
    </div>`;
  return item.art ? `<div class="equip__preview">${artImage(item.art, item.name)}</div>` : '';
};
const detail = (group, item, staged = false) => {
  const equipped = item.id === group.equipped;
  const current = group.items.find((i) => i.id === group.equipped);
  const status =
    current.id === 'nenhum' ? (current.id === item.id ? '' : current.description) : `${current.name} equipado.`;
  return `
    ${!staged ? preview(item) : ''}
    <p class="equip__type">${group.type}${item.rarity ? ` <span class="rbg-tag">${item.rarity}</span>` : ''}</p>
    <h3 class="equip__name">${item.name}</h3>
    <p class="equip__description">${item.description}</p>
    ${equipped ? '' : `<button type="button" class="rbg-button" data-equip="${item.id}">Equipar</button>`}
    ${status ? `<p class="equip__status">${status}</p>` : ''}`;
};

const tile = (group, item, name) => `
  <label class="equip__tile">
    <input type="radio" name="${name}" value="${item.id}"${item.id === group.equipped ? ' checked' : ''} />
    <span class="equip__art">${item.id === 'nenhum' ? icon('close', 24) : `<span class="rbg-slot equip__slot" data-slot="item">${artImage(item.art, item.name)}</span>`}</span>
    <span class="equip__tile-name">${item.name}</span>
    ${item.id === group.equipped ? '<span class="equip__flag">Equipado</span>' : ''}
  </label>`;

export const equipPicker = (group, name, staged = false) => `
  <div class="equip">
    <div class="equip__detail" aria-live="off">${detail(
      group,
      group.items.find((i) => i.id === group.equipped),
      staged,
    )}</div>
    <fieldset class="equip__options">
      <legend class="rbg-visually-hidden">${group.type}: itens</legend>
      ${group.items.map((item) => tile(group, item, name)).join('')}
      ${group.empty ? `<p class="profile-customize__empty">${group.empty}</p>` : ''}
    </fieldset>
  </div>`;

export function bindEquipPicker(view, group, panel, { refresh = true } = {}) {
  const box = view.querySelector('.equip__detail');
  const options = view.querySelector('.equip__options');
  const staged = Boolean(view.querySelector('.rbg-stage[data-preview]'));
  let unbindPreview = () => {};
  let unbindStage = () => {};
  const onChange = (event) => {
    unbindPreview();
    unbindStage();
    const item = group.items.find((i) => i.id === event.target.value);
    box.innerHTML = detail(group, item, staged);
    unbindPreview = bindArt(box);
    unbindStage = showPreview(view, item);
  };
  const onClick = (event) => {
    const button = event.target.closest('[data-equip]');
    if (!button) return;
    group.equipped = button.dataset.equip;
    if (refresh) panel.refresh();
    else {
      unbindPreview();
      box.innerHTML = detail(
        group,
        group.items.find((i) => i.id === group.equipped),
        staged,
      );
      unbindPreview = bindArt(box);
      for (const input of options.querySelectorAll('input')) {
        input.checked = input.value === group.equipped;
        const flag = input.closest('.equip__tile').querySelector('.equip__flag');
        if (input.checked && !flag)
          input.closest('.equip__tile').insertAdjacentHTML('beforeend', '<span class="equip__flag">Equipado</span>');
        if (!input.checked) flag?.remove();
      }
    }
    (refresh
      ? panel.view.querySelector(
          `.equip__tile input[name="${options.querySelector('input').name}"][value="${group.equipped}"]`,
        )
      : options.querySelector(`input[name="${options.querySelector('input').name}"][value="${group.equipped}"]`)
    ).focus();
    const item = group.items.find((i) => i.id === group.equipped);
    panel.announce(item.id === 'nenhum' ? item.description : `${item.name} equipado.`);
  };
  options.addEventListener('change', onChange);
  box.addEventListener('click', onClick);
  return () => {
    unbindPreview();
    unbindStage();
    options.removeEventListener('change', onChange);
    box.removeEventListener('click', onClick);
  };
}
