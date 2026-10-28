import { clubRanking } from '../../data/ranking.js';
import { chevron, goLink, unit } from '../format.js';
import { bindIdentitySlots, identitySlot } from './identity.js';

const row = (c) => `
  <tr${c.mine ? ' class="ranking__mine" aria-current="true"' : ''}>
    <td class="ranking__pos">${c.position}</td>
    <th scope="row"><span class="ranking__person">${identitySlot(c.crestSrc, 'crest', c.name)}<span class="ranking__who">
      <span class="ranking__name">${c.name}</span>${c.mine ? '<span class="rbg-visually-hidden"> (seu clube)</span>' : ''}
      <span class="ranking__meta">${c.tag}</span></span></span>
    </th>
    <td class="ranking__num">${c.level}</td>
    <td class="ranking__num">${unit(c.xp, 'XP')}</td>
    <td class="ranking__num ranking__points">${c.points}</td>
    <td class="ranking__num">${c.titles}</td>
    <td class="ranking__action">${
      c.mine
        ? goLink('meu-time', 'Ver clube')
        : `<button type="button" class="rbg-link" data-pending="Ver clube ${c.name}">Ver clube${chevron}</button>`
    }</td>
  </tr>`;

export default {
  id: 'times',
  tab: 'ranking',
  label: 'Times',
  states: ['default'],
  render: () => {
    return `
    <div class="ranking__bar">
      <div>
        <h2 class="ranking__count">${unit(clubRanking.total, 'clubes')} no ranking</h2>
        <p class="ranking__lede">Classificação por pontos da temporada. Desempate por XP total.</p>
      </div>
    </div>
    <table class="rbg-table ranking">
      <caption class="rbg-visually-hidden">Ranking de times da temporada atual</caption>
      <thead>
        <tr>
          <th scope="col" class="ranking__pos">#</th>
          <th scope="col">Clube</th>
          <th scope="col" class="ranking__num">Nível</th>
          <th scope="col" class="ranking__num">XP total</th>
          <th scope="col" class="ranking__num">Pontos</th>
          <th scope="col" class="ranking__num">Títulos</th>
          <th scope="col"><span class="rbg-visually-hidden">Ações</span></th>
        </tr>
      </thead>
      <tbody>${clubRanking.rows.map(row).join('')}</tbody>
    </table>`;
  },
  enter: bindIdentitySlots,
};
