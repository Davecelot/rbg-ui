import { locker } from '../../data/locker.js';
import { player } from '../../data/player.js';
import { avatarStage, bindTurn } from '../avatar.js';
import { chevron } from '../format.js';

const owned = (group) => group.items.length - 1;
const nameOf = (group) => group.items.find((i) => i.id === group.equipped).name;

const slot = (sub, label, value, meta = '', figure = false) => `
  <li>
    <button type="button" id="vestiario-slot-${sub}" class="vestiario__slot" data-go="vestiario" data-go-sub="${sub}">
      <span class="vestiario__slot-label">${label}</span>
      <span class="vestiario__slot-value${figure ? ' vestiario__slot-value--figure' : ''}">${value}</span>
      <span class="vestiario__slot-meta">${meta}</span>
      ${chevron}
    </button>
  </li>`;

export default {
  id: 'vestiario-overview',
  tab: 'vestiario',
  label: 'Equipamento',
  states: ['default'],
  render: () => `
    <div class="vestiario vestiario--overview">
      ${avatarStage({ named: true })}
      <div class="vestiario__panel">
        <div>
          <h2 class="rbg-visually-hidden">Equipamento</h2>
          <p class="vestiario__lede">Seu equipamento para a próxima partida.</p>
          <p class="vestiario__help">O uniforme será o da sua equipe.</p>
        </div>
        <ul class="vestiario__slots">
          ${slot('numero', 'Número', `#${player.number}`, '', true)}
          ${slot('chuteira', 'Chuteira', locker.boots.model)}
          ${slot('pose-mvp', 'Pose de MVP', nameOf(locker.poses), `${owned(locker.poses)} itens`)}
          ${slot('comemoracao', 'Comemoração', nameOf(locker.celebrations), `${owned(locker.celebrations)} itens`)}
        </ul>
      </div>
    </div>`,
  enter: (view) => bindTurn(view),
};
