import { rcs } from '../../data/rcs.js';
import { chevron } from '../format.js';
import { rcsHead } from './head.js';

const step = (s, i) => `
  <li class="rcs__step">
    <span class="rcs__step-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
    <h4 class="rcs__step-title">${s.title}</h4>
    <p class="rcs__note">${s.text}</p>
  </li>`;

export default {
  id: 'tutorial',
  tab: 'rcs-week',
  label: 'Tutorial',
  states: ['default'],
  render: () => `
    ${rcsHead()}
    <section class="rcs__section" aria-labelledby="rcs-como">
      <h3 id="rcs-como" class="rcs__title">Como participar da RCS Week</h3>
      <ol class="rcs__steps">${rcs.steps.map(step).join('')}</ol>
      <dl class="rcs__schedule">
        <div><dt>Dias de partida</dt><dd>${rcs.schedule.days}</dd><dd>${rcs.schedule.hours}</dd></div>
      </dl>
    </section>
    <section class="rcs__section" aria-labelledby="rcs-edicoes">
      <h3 id="rcs-edicoes" class="rcs__title">Edições e histórico</h3>
      <dl class="rcs__editions">
        <div><dt>${rcs.edition.label}</dt><dd>${rcs.edition.status}</dd></div>
      </dl>
      <details class="rcs__archive">
        <summary>${chevron}Competições anteriores preservadas</summary>
        <dl class="rcs__editions">${rcs.previous.map((edition) => `<div><dt>${edition.label}</dt><dd>Campeão: ${edition.champion}</dd></div>`).join('')}</dl>
      </details>
    </section>`,
};
