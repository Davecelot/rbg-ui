import { rcs } from '../../data/rcs.js';
import { rcsHead } from './head.js';
import { artImage } from '../art.js';

const block = (id, title, matches, empty, state) => `
  <section class="rcs__section rcs__games" aria-labelledby="${id}">
    <h3 id="${id}" class="rcs__title">${title} (${state === 'empty' ? 0 : matches.length})</h3>
    ${
      state === 'empty'
        ? `<p class="rcs__empty">${empty}</p>`
        : `<ul class="rcs__matches">${matches
            .map(
              (match) => `
      <li><span class="rcs__identity">${artImage(match.home.crestSrc, '', 48)}${match.home.name}</span>
      <strong class="rcs__score">${match.score ? match.score.join(' × ') : 'vs'}</strong>
      <span class="rcs__identity">${artImage(match.away.crestSrc, '', 48)}${match.away.name}</span>
      <span class="rcs__note">${match.when}</span></li>`,
            )
            .join('')}</ul>`
    }
  </section>`;

export default {
  id: 'jogos',
  tab: 'rcs-week',
  label: 'Jogos',
  states: ['default', 'empty'],
  render: ({ state }) => `
    ${rcsHead()}
    <div class="rcs__split">
      ${block('rcs-partidas', 'Partidas oficiais', rcs.matches.official, rcs.matches.officialEmpty, state)}
      ${block('rcs-pendentes', 'Confrontos pendentes', rcs.matches.pending, rcs.matches.pendingEmpty, state)}
    </div>`,
};
