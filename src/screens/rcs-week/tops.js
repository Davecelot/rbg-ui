import { rcs } from '../../data/rcs.js';
import { rcsHead } from './head.js';
import { artImage } from '../art.js';

export default {
  id: 'tops',
  tab: 'rcs-week',
  label: 'TOPs',
  states: ['default', 'pending'],
  render: ({ state }) => `
    ${rcsHead()}
    ${
      state === 'pending'
        ? `<section class="rcs__section rcs__pending" aria-labelledby="rcs-tops"><h3 id="rcs-tops" class="rcs__pending-title">${rcs.tops.pending}</h3></section>`
        : `
    <div class="rcs__tops">${[
      ['goals', 'Gols'],
      ['assists', 'Assistências'],
      ['mvps', 'MVPs'],
    ]
      .map(
        ([key, label]) => `
      <section class="rcs__section" aria-labelledby="rcs-top-${key}">
        <h3 id="rcs-top-${key}" class="rcs__title">${label}</h3>
        <ol class="rcs__leaders">${[...rcs.tops.rows]
          .sort((a, b) => b[key] - a[key])
          .map(
            (row) => `
          <li>${artImage(row.headSrc, '', 48)}<span>${row.name}<span class="rcs__note">${row.club}</span></span><strong>${row[key]}</strong></li>`,
          )
          .join('')}</ol>
      </section>`,
      )
      .join('')}</div>`
    }`,
};
