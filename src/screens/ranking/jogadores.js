import { playerRanking } from '../../data/ranking.js';
import { unit } from '../format.js';
import { icon } from '../icons.js';
import { rankBadge, rankName } from '../rank-badge.js';
import { bindIdentitySlots, identitySlot } from './identity.js';

const row = (p) => `
  <tr${p.mine ? ' class="ranking__mine ranking__self" aria-current="true"' : ''}>
    <td class="ranking__pos">${p.position}</td>
    <th scope="row"><span class="ranking__person">${identitySlot(p.headSrc, 'avatar', p.name, p.pass)}<span class="ranking__who">
      <span class="ranking__name">${p.name}</span>${p.mine ? '<span class="rbg-visually-hidden"> (você)</span>' : ''}
      ${p.pass ? '<span class="rbg-tag ranking__pass">Passe T1</span>' : ''}</span></span>
    </th>
    <td><span class="ranking__elo">${rankBadge(p.tierId, p.division)}<span><span class="ranking__tier">${rankName(p.tierId, p.division)}</span> <span class="ranking__meta">${unit(p.pdl, 'PDL')}</span></span></span></td>
    <td class="ranking__record">${p.wins}V ${p.losses}D ${p.draws}E</td>
    <td class="ranking__num">${unit(p.goals, 'gols')}</td>
  </tr>`;

const perPage = Math.ceil(playerRanking.total / playerRanking.pages);

export default {
  id: 'jogadores',
  tab: 'ranking',
  label: 'Jogadores',
  states: ['default'],
  render: () => `
    <div class="ranking__bar">
      <h2 class="ranking__count">${playerRanking.total} jogadores no ranking</h2>
      <nav class="ranking__pager" aria-label="Páginas do ranking">
        <button type="button" class="rbg-icon-button" aria-label="Primeira página" data-page="first" aria-disabled="${playerRanking.page === 1}">${icon('firstPage')}</button>
        <button type="button" class="rbg-icon-button" aria-label="Página anterior" data-page="previous" aria-disabled="${playerRanking.page === 1}">${icon('chevronLeft')}</button>
        <span>Página ${playerRanking.page} de ${playerRanking.pages}</span>
        <button type="button" class="rbg-icon-button" aria-label="Próxima página" data-page="next" aria-disabled="${playerRanking.page === playerRanking.pages}">${icon('chevronRight')}</button>
        <button type="button" class="rbg-icon-button" aria-label="Última página" data-page="last" aria-disabled="${playerRanking.page === playerRanking.pages}">${icon('lastPage')}</button>
      </nav>
    </div>
    <table class="rbg-table ranking">
      <caption class="rbg-visually-hidden">Ranking de jogadores, página ${playerRanking.page} de ${playerRanking.pages}</caption>
      <thead>
        <tr>
          <th scope="col" class="ranking__pos">#</th>
          <th scope="col">Jogador</th>
          <th scope="col">Elo</th>
          <th scope="col">Partidas</th>
          <th scope="col" class="ranking__num">Gols</th>
        </tr>
      </thead>
      <tbody>
        ${playerRanking.rows
          .slice((playerRanking.page - 1) * perPage, playerRanking.page * perPage)
          .map(row)
          .join('')}
      </tbody>
    </table>`,
  enter: (view, panel) => {
    const unbind = bindIdentitySlots(view);
    const onPage = (event) => {
      const button = event.target.closest('[data-page]');
      if (!button || button.getAttribute('aria-disabled') === 'true') return;
      const action = button.dataset.page;
      playerRanking.page = {
        first: 1,
        previous: playerRanking.page - 1,
        next: playerRanking.page + 1,
        last: playerRanking.pages,
      }[action];
      panel.refresh();
      panel.view.querySelector(`[data-page="${action}"]`).focus();
      panel.announce(`Página ${playerRanking.page} de ${playerRanking.pages}`);
    };
    view.addEventListener('click', onPage);
    return () => {
      unbind();
      view.removeEventListener('click', onPage);
    };
  },
};
