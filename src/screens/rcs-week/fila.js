import { rcs } from '../../data/rcs.js';
import { chevron } from '../format.js';
import { rcsHead } from './head.js';
import { artImage } from '../art.js';
import { positions } from '../../data/positions.js';

export default {
  id: 'fila',
  tab: 'rcs-week',
  label: 'Fila',
  states: ['default', 'locked'],
  render: ({ state }) => `
    ${rcsHead()}
    <section class="rcs__section rcs__play-panel" aria-labelledby="rcs-play-title">
      <h3 id="rcs-play-title" class="rcs__title">Jogar RCS Week</h3>
      <div class="rcs__gate" aria-labelledby="rcs-fila">
      <h4 id="rcs-fila" class="rcs__pending-title">${state === 'locked' ? rcs.queueGate : 'Clube Alfa, escalação pronta'}</h4>
      ${
        state === 'locked'
          ? `<button type="button" class="rbg-button rcs__fila-action" data-go="rcs-week" data-go-sub="inscricoes">Ver inscrições da RCS Week${chevron}</button>`
          : `
      <p class="rcs__note">Clube aprovado. ${rcs.schedule.days}, ${rcs.schedule.hours}.</p>
      <ul class="rcs__lineup">${rcs.lineup.map((member) => `<li>${artImage(member.avatarSrc, '', 40)}<span>${member.name}</span><abbr title="${positions[member.slot]}">${member.slot}</abbr><span class="rbg-tag">Pronto</span></li>`).join('')}</ul>`
      }
      </div>
    </section>`,
  enter: (view, panel) => {
    const mode = view.dataset.state === 'locked' ? 'rcs-fila' : 'rcs-pronto';
    if (panel.mode() !== mode) panel.setMode(mode);
    return null;
  },
};
