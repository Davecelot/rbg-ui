import { artImage } from '../art.js';
import { club } from '../../data/club.js';
import { player } from '../../data/player.js';
import { play } from '../../data/play.js';
import { positions } from '../../data/positions.js';
import { changeMode } from './back.js';

const { friendly } = play;

const memberAction = (m) => {
  if (m.name === player.name) return '<span class="rbg-tag">Você</span>';
  const seat = friendly.slots.find((s) => s.name === m.name);
  if (seat) return `<span class="rbg-tag">${seat.confirmed ? 'Confirmado' : 'Convite enviado'}</span>`;
  return m.online ? `<button type="button" class="rbg-link" data-pending="Convidar ${m.name}">Convidar</button>` : '';
};

const member = (m) => `
  <li class="jogar__member${m.online ? '' : ' is-away'}">
    <span class="jogar__member-name">${m.name}</span>
    <span class="jogar__member-status">${m.online ? 'Online' : 'Fora do CT'}</span>
    ${memberAction(m)}
  </li>`;

const slot = ({ code, name, confirmed }) => `
  <li class="jogar__slot">
    <abbr class="jogar__slot-code" title="${positions[code]}">${code}</abbr>
    <span class="jogar__slot-state">${!name ? 'Vaga disponível' : confirmed ? `${name}, confirmado` : `Aguardando ${name}`}</span>
    ${!name ? `<button type="button" class="rbg-link" data-pending="Convidar para ${positions[code]}">Convidar</button>` : `<span class="rbg-tag">${confirmed ? 'Confirmado' : 'Convite enviado'}</span>`}
  </li>`;

export default {
  id: 'amistosos',
  tab: 'jogar',
  label: 'Amistosos',
  states: ['default'],
  render: () => `
    ${changeMode}
    <div class="jogar__head">
      <div class="jogar__club">
        <span class="rbg-slot jogar__crest" data-slot="crest" data-alt="Escudo do ${player.club.name}">${artImage(club.crestSrc, `Escudo do ${player.club.name}`, 48)}</span>
        <h2 class="jogar__title">${player.club.name}</h2>
        <span class="rbg-tag">${player.club.tag}</span>
      </div>
      <div class="jogar__head-links">
        <button type="button" class="rbg-link" data-pending="Histórico de amistosos">Histórico</button>
      </div>
    </div>
    <div class="jogar__friendly">
      <section aria-labelledby="jogar-escalacao">
        <h3 id="jogar-escalacao" class="rbg-visually-hidden">Escalação</h3>
        <p class="jogar__count">
          <span class="jogar__count-figure">${friendly.confirmed}/${friendly.lineupSize}</span>
          <span class="jogar__count-label">confirmados na escalação</span>
        </p>
        <p class="jogar__lede">${friendly.searching} procurando.${friendly.slots.some((s) => !s.name) ? ' Vagas abertas: escolha alguém do quarto.' : ''}</p>
        <ol class="jogar__slots">${friendly.slots.map(slot).join('')}</ol>
      </section>
      <section aria-labelledby="jogar-clube">
        <h3 id="jogar-clube" class="jogar__legend">Seu clube</h3>
        <ul class="jogar__members">${friendly.members.map(member).join('')}</ul>
      </section>
    </div>`,
  enter: (view, panel) => {
    if (panel.mode() !== 'amistosos') panel.setMode('amistosos');
    return null;
  },
};
