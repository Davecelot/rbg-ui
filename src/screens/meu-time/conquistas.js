import { club } from '../../data/club.js';
import { itemSheets } from '../item-sheet.js';
import { itemTile } from '../item-tile.js';
import { clubHead } from './head.js';

const trophy = (t) => `
  <li class="clube__trophy">
    <span class="clube__trophy-name">${t.name}</span>
    <span class="rbg-tag">${t.rarity}</span>
    <span class="clube__note">${t.criterion}. Desbloqueia ${t.unlocks}.</span>
    <progress class="rbg-progress" max="${t.goal}" value="${t.done}" aria-label="${t.name}" aria-valuetext="${t.done} de ${t.goal}"></progress>
    <span class="clube__mission-count">${t.done}/${t.goal}</span>
  </li>`;

const rewards = [
  ...club.trail.map((r) => ({
    id: `clube-nivel-${r.level}`,
    name: r.name,
    art: r.art,
    category: r.type,
    description: r.description,
    replay: r.replay,
    owned: r.level <= club.level,
    unlock: { source: 'club', level: r.level },
  })),
  ...club.special.map((r, i) => ({
    id: `clube-especial-${i}`,
    name: r.name,
    art: r.art,
    owned: r.owned,
    unlock: { source: 'club', condition: r.condition },
  })),
];

const unlocked = club.trophies.filter((t) => t.done === t.goal).length;

export default {
  id: 'conquistas',
  tab: 'meu-time',
  label: 'Conquistas',
  states: ['default'],
  render: () => `
    ${clubHead({ slim: true })}
    <section class="clube__section" aria-labelledby="clube-trilha">
      <div class="clube__section-head">
        <h3 id="clube-trilha" class="clube__title">Trilha de recompensas</h3>
        <p class="clube__note">Nível ${club.level}/${club.trail.at(-1).level}, ${club.totalXp} XP total. Próximo desbloqueio: ${club.next.name}, nível ${club.next.level}</p>
      </div>
      <ol class="rbg-tiles">${club.trail.map((r) => itemTile({ name: r.name, art: r.art, locked: r.level > club.level, note: r.level <= club.level ? 'Desbloqueada' : '', type: r.type, top: `Nível ${r.level}`, item: `clube-nivel-${r.level}` })).join('')}</ol>
    </section>
    <section class="clube__section" aria-labelledby="clube-especiais">
      <div class="clube__section-head">
        <h3 id="clube-especiais" class="clube__title">Recompensas especiais</h3>
        <p class="clube__note">Liberadas por títulos e marcos do clube</p>
      </div>
      <ul class="rbg-tiles">${club.special.map((r, i) => itemTile({ name: r.name, art: r.art, locked: !r.owned, note: r.owned ? 'Desbloqueada' : '', condition: r.condition, item: `clube-especial-${i}` })).join('')}</ul>
    </section>
    <section class="clube__section" aria-labelledby="clube-trofeus">
      <div class="clube__section-head">
        <h3 id="clube-trofeus" class="clube__title">Sala de troféus</h3>
        <p class="clube__note">${unlocked}/${club.trophies.length} conquistas</p>
      </div>
      <ul class="clube__trophies">${club.trophies.map(trophy).join('')}</ul>
    </section>`,
  enter: (view, panel) => itemSheets(view, panel, (id) => rewards.find((r) => r.id === id)),
};
