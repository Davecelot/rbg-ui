import { club } from '../../data/club.js';
import { clubHead } from './head.js';
import { equipPicker, bindEquipPicker } from '../equip-picker.js';

export default {
  id: 'personalizar',
  tab: 'meu-time',
  label: 'Personalizar clube',
  states: ['default', 'empty'],
  render: ({ state }) => `
    ${clubHead({ slim: true })}
    <section class="clube__section" aria-labelledby="clube-inventario">
      <h3 id="clube-inventario" class="clube__title">Recompensas do clube</h3>
      ${
        state === 'empty'
          ? `<p class="clube__empty-title">Seu clube ainda não tem itens para equipar</p>
      <p class="clube__note">Desbloqueie recompensas no trilho para personalizar o clube.</p>
      <button type="button" class="rbg-link" data-go="meu-time" data-go-sub="conquistas">Ver o trilho</button>`
          : `${equipPicker(club.customization, 'clube-titulo')}${equipPicker(club.presentation, 'clube-apresentacao')}`
      }
    </section>`,
  enter: (view, panel) => {
    if (view.dataset.state === 'empty') return null;
    const groups = [club.customization, club.presentation];
    const cleanups = [...view.querySelectorAll('.equip')].map((element, index) =>
      bindEquipPicker(element, groups[index], panel),
    );
    return () => cleanups.forEach((cleanup) => cleanup());
  },
};
