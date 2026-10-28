import { artImage } from '../art.js';
import { club } from '../../data/club.js';
import { positions } from '../../data/positions.js';
import { goLink } from '../format.js';
import { clubHead } from './head.js';

const player = (p) => `
  <li class="clube__player${p.me ? ' is-me' : ''}">
    <abbr class="clube__slot" title="${positions[p.slot]}">${p.slot}</abbr>
    <span class="clube__player-name">${p.name}${p.me ? '<span class="clube__me">Você</span>' : ''}</span>
    <span class="clube__status">${p.status}${p.captain ? ' <span class="rbg-tag">Capitão</span>' : ''}</span>
    <span class="rbg-slot clube__sprite" data-slot="avatar" data-alt="Avatar de ${p.name}">${artImage(p.avatarSrc, `Avatar de ${p.name}`, 48)}</span>
  </li>`;

export default {
  id: 'elenco',
  tab: 'meu-time',
  label: 'Elenco e convites',
  states: ['default'],
  render: () => `
    ${clubHead({ leave: true })}
    <section class="clube__section" aria-labelledby="clube-escalacao">
      <div class="clube__section-head">
        <h3 id="clube-escalacao" class="clube__title">Escalação</h3>
        <p class="clube__note">Partidas do time ficam em Jogar, Amistosos. ${goLink('jogar', 'Ir para os amistosos').replace('data-go="jogar"', 'data-go="jogar" data-go-sub="amistosos"')}</p>
      </div>
      <ol class="clube__lineup">${club.lineup.map(player).join('')}</ol>
    </section>
    <section class="clube__section clube__staff" aria-labelledby="clube-comissao">
      <h3 id="clube-comissao" class="clube__title">Comissão técnica</h3>
      <p class="clube__note">O técnico é um jogador vinculado ao clube, sem ocupar vaga na escalação.</p>
      <p class="clube__coach">${artImage(club.coach.avatarSrc, `Avatar de ${club.coach.name}`, 48)}<span>${club.coach.name}<span class="rbg-tag">Técnico</span></span></p>
    </section>`,
};
