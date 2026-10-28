import { profileCustomization } from '../../data/profile-customization.js';
import { bindArt } from '../art.js';
import { icon } from '../icons.js';
import { bindEquipPicker, equipPicker } from '../equip-picker.js';

const groups = [
  { id: 'card', label: 'Card' },
  { id: 'banner', label: 'Banner' },
  { id: 'moldura', label: 'Moldura' },
];

const markup = () => `
  <section class="profile-customize" aria-labelledby="profile-customize-title">
    <header class="profile-customize__head">
      <button type="button" class="rbg-link rbg-back profile-customize__back" data-profile-back>${icon('chevronLeft', 16)}Voltar ao perfil</button>
      <h2 id="profile-customize-title">Personalizar perfil</h2>
    </header>
    <fieldset class="rbg-segmented profile-customize__filters">
      <legend class="rbg-visually-hidden">Tipo de item</legend>
      ${groups
        .map(
          ({ id, label }) =>
            `<label><input type="radio" name="profile-customization-group" value="${id}"${id === 'banner' ? ' checked' : ''} /><span>${label}</span></label>`,
        )
        .join('')}
    </fieldset>
    <div class="profile-customize__content">
      ${groups
        .map(
          ({
            id,
            label,
          }) => `<section class="profile-customize__section" data-profile-section="${id}"${id === 'banner' ? '' : ' hidden'} aria-label="${label}">
            ${equipPicker(profileCustomization[id], `perfil-${id}`)}
          </section>`,
        )
        .join('')}
    </div>
  </section>`;

export function profileCustomizer(view, panel) {
  const trigger = view.querySelector('[data-profile-customize]');
  let cleanupPickers = [];
  let unbindArts = [];
  let backButton = null;
  let filters = null;
  let isOpen = false;

  const onFilter = (event) => {
    if (!event.target.matches('input[name="profile-customization-group"]')) return;
    view.querySelectorAll('[data-profile-section]').forEach((section) => {
      section.hidden = section.dataset.profileSection !== event.target.value;
    });
  };

  const onBack = () => {
    if (!isOpen) return;
    isOpen = false;
    cleanupPickers.forEach((cleanup) => cleanup());
    cleanupPickers = [];
    unbindArts.forEach((cleanup) => cleanup());
    unbindArts = [];
    filters?.removeEventListener('change', onFilter);
    panel.refresh();
    view.querySelector('[data-profile-customize]')?.focus();
  };

  const onKeydown = (event) => {
    if (event.key !== 'Escape' || !isOpen) return;
    event.preventDefault();
    event.stopPropagation();
    onBack();
  };

  const onOpen = () => {
    if (isOpen) return;
    isOpen = true;
    view.innerHTML = markup();
    backButton = view.querySelector('[data-profile-back]');
    filters = view.querySelector('.profile-customize__filters');
    filters.addEventListener('change', onFilter);
    for (const group of groups) {
      const root = view.querySelector(`[data-profile-section="${group.id}"]`);
      unbindArts.push(bindArt(root));
      cleanupPickers.push(bindEquipPicker(root, profileCustomization[group.id], panel, { refresh: false }));
    }
    backButton.addEventListener('click', onBack);
    backButton.focus();
  };

  trigger.addEventListener('click', onOpen);
  view.addEventListener('keydown', onKeydown);

  return () => {
    cleanupPickers.forEach((cleanup) => cleanup());
    unbindArts.forEach((cleanup) => cleanup());
    unbindArts = [];
    filters?.removeEventListener('change', onFilter);
    trigger.removeEventListener('click', onOpen);
    backButton?.removeEventListener('click', onBack);
    view.removeEventListener('keydown', onKeydown);
  };
}
