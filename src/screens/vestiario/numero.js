import { locker } from '../../data/locker.js';
import { player } from '../../data/player.js';
import { avatarStage, bindTurn } from '../avatar.js';
import { returnToLocker } from './back.js';
import { slotHead } from './head.js';

export default {
  id: 'numero',
  tab: 'vestiario',
  label: 'Número',
  states: ['default'],
  render: () => `
    <div class="vestiario">
      ${avatarStage({ named: true })}
      <div class="vestiario__panel">
        ${returnToLocker('numero')}
        ${slotHead('Número', `#${player.number}`)}
        <fieldset class="vestiario__numbers">
          <legend class="rbg-visually-hidden">Número da camisa</legend>
          ${locker.numbers
            .map(
              (n) =>
                `<label class="vestiario__number"><input type="radio" name="numero" value="${n}"${n === player.number ? ' checked' : ''} /><span>${n}</span></label>`,
            )
            .join('')}
        </fieldset>
        <div class="vestiario__actions">
          <button type="button" class="rbg-button" data-save-number>Salvar número</button>
          <button type="button" class="rbg-link" data-pending="Salvar estampa atual">Salvar estampa atual</button>
        </div>
        <p class="vestiario__help">Para importar seu visual atual, esteja no lobby. As mudanças valem na próxima partida.</p>
      </div>
    </div>`,
  enter: (view, panel) => {
    const untie = bindTurn(view);
    const save = view.querySelector('[data-save-number]');
    const onSave = () => {
      player.number = Number(view.querySelector('input[name="numero"]:checked').value);
      panel.refresh();
      panel.view.querySelector('[data-save-number]').focus();
      panel.announce(`Número ${player.number} salvo.`);
    };
    save.addEventListener('click', onSave);
    return () => {
      untie();
      save.removeEventListener('click', onSave);
    };
  },
};
