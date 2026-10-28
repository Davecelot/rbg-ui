import { matches } from '../../data/matches.js';
import { signed, unit } from '../format.js';
import { matchHead, matchRow } from '../match-row.js';

const pdl = (match) => `
  <span class="historico__delta${match.pdl > 0 ? ' historico__delta--gain' : match.pdl < 0 ? ' historico__delta--loss' : ''}">${unit(signed(match.pdl), 'PDL')}</span>
  ${match.autofill ? '<span class="rbg-tag">Autofill</span>' : ''}`;

export default {
  id: 'historico-partidas',
  tab: 'perfil',
  label: 'Histórico de partidas',
  states: ['default', 'empty'],
  render: ({ state }) =>
    state === 'empty'
      ? `<div class="rbg-empty">
          <h2 class="rbg-empty__title">Nenhuma partida ainda.</h2>
        </div>`
      : `<h2 class="rbg-visually-hidden">Histórico de partidas</h2>
        <table class="rbg-table historico">
          <caption class="rbg-visually-hidden">Suas últimas partidas, da mais recente para a mais antiga</caption>
          ${matchHead('PDL')}
          <tbody>${matches.map((m) => matchRow(m, pdl(m))).join('')}</tbody>
        </table>`,
};
