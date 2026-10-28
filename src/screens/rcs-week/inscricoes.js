import { artImage } from '../art.js';
import { rcs } from '../../data/rcs.js';
import { rcsHead } from './head.js';

export default {
  id: 'inscricoes',
  tab: 'rcs-week',
  label: 'Inscrições',
  states: ['default'],
  render: () => `
    ${rcsHead()}
    <section class="rcs__section rcs__enrol" aria-labelledby="rcs-inscricoes">
      <h3 id="rcs-inscricoes" class="rbg-visually-hidden">Inscrições</h3>
      <p class="rcs__figure">${rcs.enrolment.clubs}<span class="rcs__figure-label">clubes inscritos</span></p>
      <p class="rcs__notice">${rcs.enrolment.notice}</p>
      <ul class="rcs__registrations">${rcs.registrations.map((team) => `<li><span class="rcs__identity">${artImage(team.crestSrc, '', 48)}${team.name}</span><span class="rbg-tag">${team.status}</span></li>`).join('')}</ul>
    </section>`,
};
