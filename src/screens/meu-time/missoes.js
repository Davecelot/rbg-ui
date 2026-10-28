import { club } from '../../data/club.js';
import { unit } from '../format.js';
import { clubHead } from './head.js';

const { missions } = club;
const doneCount = missions.items.filter((m) => m.done === m.goal).length;

const mission = (m) => `
  <li class="clube__mission">
    <span class="clube__mission-name">${m.name}</span>
    <span class="clube__mission-xp">${unit(`+${m.xp}`, 'XP')}</span>
    <progress class="rbg-progress" max="${m.goal}" value="${m.done}" aria-label="${m.name}" aria-valuetext="${m.done} de ${m.goal}"></progress>
    <span class="clube__mission-count">${m.done}/${m.goal}</span>
  </li>`;

export default {
  id: 'missoes',
  tab: 'meu-time',
  label: 'Missões',
  states: ['default'],
  render: () => `
    ${clubHead({ slim: true })}
    <section class="clube__section" aria-labelledby="clube-missoes">
      <div class="clube__section-head">
        <h3 id="clube-missoes" class="clube__title">Missões do clube</h3>
        <p class="clube__note">${missions.renews}, ${missions.left}</p>
      </div>
      <p class="clube__figure">${doneCount}/${missions.items.length}<span class="clube__figure-label">missões completas hoje</span></p>
      <ul class="clube__missions">${missions.items.map(mission).join('')}</ul>
    </section>`,
};
