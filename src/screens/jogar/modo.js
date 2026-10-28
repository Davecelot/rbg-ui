import { play } from '../../data/play.js';
import amistosos from './amistosos.js';
import solo from './ranqueada-solo.js';
import { avatarArt } from '../../data/art.js';
import { artImage } from '../art.js';

const details = { buscando: solo, amistosos };
const matchStates = ['escalacao', 'em-andamento'];

const squads = [
  {
    name: 'Time 1 (azul)',
    side: 'blue',
    players: [
      { position: 'GK', name: 'Jogador 01 (você)', rank: 'Bronze I, 34 PDL', avatar: 0 },
      { position: 'DEF', name: 'Jogador 06', rank: 'Bronze II, 22 PDL', avatar: 1 },
      { position: 'MID', name: 'Jogador 07', rank: 'Prata III, 41 PDL', avatar: 2 },
      { position: 'ATK', name: 'Jogador 08', rank: 'Prata IV, 18 PDL', avatar: 3 },
    ],
  },
  {
    name: 'Time 2 (vermelho)',
    side: 'red',
    players: [
      { position: 'GK', name: 'Jogador 09', rank: 'Prata IV, 52 PDL', autofill: true, avatar: 4 },
      { position: 'DEF', name: 'Jogador 10', rank: 'Prata IV, 12 PDL', avatar: 5 },
      { position: 'MID', name: 'Jogador 11', rank: 'Bronze III, 45 PDL', avatar: 6 },
      { position: 'ATK', name: 'Jogador 12', rank: 'Ferro I, 28 PDL', avatar: 7 },
    ],
  },
];

const squadsMarkup = (id = 'jogar-escalacao') => `
    <div class="jogar__squads" id="${id}" tabindex="-1">
      ${squads
        .map(
          (team) => `<section class="jogar__squad jogar__squad--${team.side}" aria-labelledby="jogar-team-${team.side}">
            <h3 id="jogar-team-${team.side}">${team.name}</h3>
            <ul>${team.players
              .map(
                (player) => `<li class="jogar__player">
                  <span class="jogar__position">${player.position}</span>
                  ${player.autofill ? '<span class="jogar__autofill">Autofill</span>' : ''}
                  <span class="jogar__player-avatar">${artImage(avatarArt(player.avatar), `Avatar de ${player.name}`, 64)}</span>
                  <strong>${player.name}</strong>
                  <span class="jogar__player-rank">${player.rank}</span>
                  ${team.side === 'blue' && player.name !== 'Jogador 01 (você)' ? `<button type="button" class="rbg-link" data-pending="Trocar ${player.position}">Trocar (${player.position})</button>` : ''}
                </li>`,
              )
              .join('')}</ul>
          </section>`,
        )
        .join('')}
    </div>`;

const lineup = () => `
  <section class="jogar__match" aria-labelledby="jogar-match-title">
    <h2 class="jogar__title" id="jogar-match-title">Escalação</h2>
    <p class="jogar__countdown"><time datetime="PT6S">6s</time> para ir ao campo</p>
    <p class="jogar__lede">Confira sua posição. Para trocar com um companheiro, clique em Trocar no card dele: ele precisa aceitar. Quando o tempo acaba, vocês vão para o campo.</p>
    <section class="jogar__vote" aria-labelledby="jogar-nitro-title">
      <h3 id="jogar-nitro-title">Nitro da partida</h3>
      <div class="jogar__vote-options"><span>Rebug <strong>1 voto</strong></span><span>Aleatório <strong>2 votos</strong></span></div>
      <p>Empate ou sem votos: Rebug. Sem campo livre do nitro escolhido, a partida é cancelada e todos voltam para a fila.</p>
    </section>
    ${squadsMarkup()}
  </section>`;

const redirecting = () => `
  <section class="jogar__match jogar__match--redirect" aria-labelledby="jogar-match-title">
    <h2 class="jogar__title" id="jogar-match-title">Partida em andamento</h2>
    <p class="jogar__lede">Vocês estão sendo levados ao campo. O placar vale pelos gols: 2 tempos de 10 minutos.</p>
    ${squadsMarkup('jogar-lineup-redirect')}
  </section>`;

const row = (mode, picked) => `
  <label class="jogar__mode">
    <input type="radio" name="modo" value="${mode.id}" aria-label="${mode.name}"${mode.id === picked ? ' checked' : ''} />
    <span class="jogar__mode-state"><span class="jogar__mode-indicator" aria-hidden="true"></span><span class="jogar__mode-selected">Selecionado</span></span>
    <span class="jogar__mode-name">${mode.name}</span>
    <span class="jogar__mode-format">${mode.format}</span>
    <span class="jogar__mode-note">${mode.note}</span>
  </label>`;

export default {
  id: 'modo',
  tab: 'jogar',
  label: 'Jogar',
  states: ['default', ...matchStates],
  render: ({ state, data = {} } = {}) => {
    if (state === 'escalacao') return lineup();
    if (state === 'em-andamento') return redirecting();
    const detail = details[data.mode];
    if (detail) return detail.render({ state, data });
    const picked = data.mode?.startsWith('escolhido-') ? data.mode.replace('escolhido-', '') : null;
    return `
      <h2 class="jogar__title">Escolha o modo de jogo</h2>
      <fieldset class="jogar__modes">
        <legend class="rbg-visually-hidden">Modo de jogo</legend>
        <div class="jogar__choices">${play.modes.map((m) => row(m, picked)).join('')}</div>
      </fieldset>
    `;
  },
  enter: (view, panel) => {
    if (matchStates.includes(view.dataset.state)) {
      if (panel.mode() !== view.dataset.state) panel.setMode(view.dataset.state);
      return null;
    }
    const detail = details[panel.mode()];
    if (detail) return detail.enter?.(view, panel) ?? null;
    const fieldset = view.querySelector('.jogar__modes');
    const onChange = (event) => {
      panel.setMode(`escolhido-${event.target.value}`);
      panel.view.querySelector(`input[value="${event.target.value}"]`).focus();
    };
    fieldset.addEventListener('change', onChange);
    return () => fieldset.removeEventListener('change', onChange);
  },
};
