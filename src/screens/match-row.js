import { positions } from '../data/positions.js';
import { unit } from './format.js';

// One match in a history table (Perfil and Meu Time); `tail` fills the last column.
export const matchRow = (match, tail) => `
  <tr class="historico__row historico__row--${match.result === 'Vitória' ? 'win' : 'loss'}">
    <th scope="row">
      <span class="historico__result">${match.result}</span>
      <span class="historico__meta">${match.reason}</span>
      <span class="historico__meta">${match.ago}${match.duration ? `, ${match.duration.replace(' ', ' ')} de partida` : ''}</span>
    </th>
    <td><abbr class="historico__position" title="${positions[match.position]}">${match.position}</abbr></td>
    <td class="historico__ga">
      <span>${unit(match.goals, '<abbr title="gols">G</abbr>')}</span>
      <span>${unit(match.assists, '<abbr title="assistências">A</abbr>')}</span>
      ${match.note ? `<span class="historico__meta">${match.note}</span>` : ''}
    </td>
    <td class="historico__score">${match.score ? `${match.score[0]} × ${match.score[1]}` : '<span class="rbg-slot historico__score-slot" data-slot="score">[placar]</span>'}</td>
    <td class="historico__opponent">${match.opponent}</td>
    <td class="historico__pdl">${tail}</td>
  </tr>`;

export const matchHead = (last) => `
  <thead>
    <tr>
      <th scope="col">Resultado</th>
      <th scope="col">Posição</th>
      <th scope="col">Gols e assistências</th>
      <th scope="col">Placar</th>
      <th scope="col">Adversário</th>
      <th scope="col" class="historico__pdl">${last}</th>
    </tr>
  </thead>`;
