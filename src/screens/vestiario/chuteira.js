import { artImage } from '../art.js';
import { locker } from '../../data/locker.js';
import { avatarStage, bindTurn } from '../avatar.js';
import { returnToLocker } from './back.js';
import { slotHead } from './head.js';

const { boots } = locker;

export default {
  id: 'chuteira',
  tab: 'vestiario',
  label: 'Chuteira',
  states: ['default'],
  render: () => `
    <div class="vestiario">
      ${avatarStage({ named: true })}
      <div class="vestiario__panel">
        ${returnToLocker('chuteira')}
        ${slotHead('Chuteira', boots.model)}
        <div class="vestiario__boot">
          <span class="rbg-slot vestiario__boot-slot" data-slot="item" data-alt="Chuteira ${boots.model}">${artImage(
            `/assets/items/chuteira-${boots.color}.png`,
            `Chuteira ${boots.model}`,
          )}</span>
          <fieldset class="vestiario__colors">
            <legend class="vestiario__legend">Cor principal</legend>
            ${boots.colors
              .map(
                (c) =>
                  `<label class="vestiario__color"><input type="radio" name="cor" value="${c.id}"${c.id === boots.color ? ' checked' : ''} /><span class="vestiario__swatch vestiario__swatch--${c.id}" aria-hidden="true"></span>${c.name}</label>`,
              )
              .join('')}
          </fieldset>
        </div>
        <div class="vestiario__actions">
          <button type="button" class="rbg-button" data-save-color>Salvar cor</button>
          <button type="button" class="rbg-link" data-pending="Usar chuteira atual">Usar chuteira atual</button>
        </div>
        <p class="vestiario__help">O modelo e os detalhes da chuteira são mantidos. Para importar seu visual atual, esteja no lobby. As mudanças valem na próxima partida.</p>
      </div>
    </div>`,
  enter: (view, panel) => {
    const untie = bindTurn(view);
    const save = view.querySelector('[data-save-color]');
    const onSave = () => {
      const picked = view.querySelector('input[name="cor"]:checked');
      if (!picked) {
        panel.announce('Escolha uma cor primeiro.');
        return;
      }
      boots.color = picked.value;
      panel.refresh();
      panel.view.querySelector('[data-save-color]').focus();
      panel.announce(`Cor ${boots.colors.find((c) => c.id === boots.color).name.toLowerCase()} salva.`);
    };
    save.addEventListener('click', onSave);
    return () => {
      untie();
      save.removeEventListener('click', onSave);
    };
  },
};
