import { locker } from '../../data/locker.js';
import { previewStage } from '../avatar.js';
import { bindEquipPicker, equipPicker } from '../equip-picker.js';
import { returnToLocker } from './back.js';

const group = locker.celebrations;

export default {
  id: 'comemoracao',
  tab: 'vestiario',
  label: 'Comemoração',
  states: ['default'],
  render: () => `
    <div class="vestiario">
      ${previewStage(group.items.find((i) => i.id === group.equipped))}
      <div class="vestiario__panel">
        ${returnToLocker('comemoracao')}
        <h2 class="rbg-visually-hidden">Comemoração</h2>
        <fieldset class="rbg-segmented" aria-describedby="vestiario-gols-help">
          <legend class="vestiario__legend">Nos meus gols</legend>
          ${group.goalModes
            .map(
              (m) =>
                `<label><input type="radio" name="gols" value="${m.id}"${m.id === group.goalMode ? ' checked' : ''} /><span>${m.name}</span></label>`,
            )
            .join('')}
        </fieldset>
        ${equipPicker(group, 'comemoracao', true)}
        <p id="vestiario-gols-help" class="vestiario__help">A escolha vale para as próximas partidas. A coletiva exige a recompensa equipada no seu clube; sem ela, será usada a individual. Apenas uma comemoração por gol.</p>
      </div>
    </div>`,
  enter: (view, panel) => {
    const unpick = bindEquipPicker(view, group, panel);
    const modes = view.querySelector('.rbg-segmented');
    const onMode = (event) => {
      group.goalMode = event.target.value;
    };
    modes.addEventListener('change', onMode);
    return () => {
      unpick();
      modes.removeEventListener('change', onMode);
    };
  },
};
