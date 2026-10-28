import { club } from '../../data/club.js';
import { goLink } from '../format.js';
import { matchHead, matchRow } from '../match-row.js';

export default {
  id: 'partidas-time',
  tab: 'perfil',
  label: 'Partidas de time',
  states: ['default', 'empty'],
  render: ({ state }) =>
    state === 'empty'
      ? `
    <div class="rbg-empty">
      <h2 class="rbg-empty__title">Nenhuma partida de time ainda.</h2>
      ${goLink('meu-time', 'Ver meu time')}
    </div>`
      : `
    <h2 class="rbg-visually-hidden">Partidas de time</h2>
    <table class="rbg-table historico">
      <caption class="rbg-visually-hidden">Suas últimas partidas com ${club.name}</caption>
      ${matchHead('Tipo')}
      <tbody>${club.history.rows.map((match) => matchRow(match, `<span class="rbg-tag">${match.type}</span>`)).join('')}</tbody>
    </table>`,
};
