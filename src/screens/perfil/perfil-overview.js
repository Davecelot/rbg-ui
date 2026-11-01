import { player } from '../../data/player.js';
import { avatarStage, bindTurn } from '../avatar.js';
import { rankBadge, rankName } from '../rank-badge.js';
import { positions } from '../../data/positions.js';
import { chevron, goLink, number, unit } from '../format.js';
import { profileCustomizer } from './customize.js';
import { profileCustomization } from '../../data/profile-customization.js';
import { artImage } from '../art.js';
import { profileCard } from '../equip-picker.js';

const { rank, record, pass, club } = player;

const figure = (value, label, tone = '') => `<div><dt>${label}</dt><dd class="${tone}">${value}</dd></div>`;

let presentation = 'character';
try {
  if (typeof window !== 'undefined' && window.localStorage.getItem('rbg:profile-view') === 'card')
    presentation = 'card';
} catch {
  // The host may deny storage; the choice still works for this session.
}

const visuals = () => {
  const card = profileCustomization.card.items.find((item) => item.id === profileCustomization.card.equipped);
  const banner = profileCustomization.banner.items.find((item) => item.id === profileCustomization.banner.equipped);
  const showCard = presentation === 'card' && card?.id !== 'nenhum' && card;
  const backdrop = banner?.art ? `<div class="perfil__banner">${artImage(banner.art, banner.name, 192)}</div>` : '';
  return `<div class="perfil__visuals">
    <div class="perfil__presentation">
      <button type="button" class="perfil__toggle" data-profile-toggle aria-pressed="${Boolean(showCard)}"${!card || card.id === 'nenhum' ? ' disabled aria-describedby="perfil-card-hint"' : ''}>
        Exibir card<span class="perfil__toggle-track" aria-hidden="true"></span>
      </button>
    </div>
    <div class="perfil__character"${showCard ? ' hidden inert' : ''}>${avatarStage({ actions: goLink('vestiario', 'Vestiário'), backdrop })}</div>
    <div class="perfil__card"${showCard ? '' : ' hidden inert'}>${backdrop}${card?.id !== 'nenhum' && card ? profileCard(card) : ''}</div>
    ${!card || card.id === 'nenhum' ? '<p id="perfil-card-hint" class="perfil__card-hint">Equipe um card em Personalizar perfil.</p>' : ''}
  </div>`;
};

export default {
  id: 'perfil-overview',
  tab: 'perfil',
  label: 'Perfil',
  states: ['default'],
  render: () => `
    <div class="perfil">
      ${visuals()}

      <div class="perfil__id">
        <div class="perfil__name-row">
          <h2 class="perfil__name">${player.name}</h2>
          <button type="button" class="rbg-button perfil__customize-button" data-profile-customize>Personalizar perfil</button>
        </div>
        <p class="perfil__meta">
          <span class="rbg-live">${player.status}</span>
          ${player.positions.map((code) => `<abbr class="rbg-tag" title="${positions[code]}">${code}</abbr>`).join('')}
        </p>

        <div class="perfil__rank">
          <div class="perfil__elo">${rankBadge(rank.tierId, rank.division)}<p class="perfil__tier">${rankName(rank.tierId, rank.division)}</p></div>
          <progress class="rbg-progress" max="${rank.pdlMax}" value="${rank.pdl}" aria-label="Pontos de liga" aria-valuetext="${rank.pdl} de ${rank.pdlMax} PDL"></progress>
          <p class="perfil__pdl">
            <span>${unit(rank.pdl, '/')} ${unit(rank.pdlMax, 'PDL')}</span>
            <button type="button" class="rbg-link perfil__position" data-go="ranking">Ranking <span class="perfil__position-figure">#${rank.position}</span>${chevron}</button>
          </p>
        </div>

        <div class="perfil__numbers">
        <p class="perfil__headline">
          <span class="perfil__figure">${player.winRate}<span class="perfil__unit">%</span></span>
          <span class="perfil__caption">de aproveitamento<br />${unit(player.mvps, 'MVPs')}</span>
        </p>

        <dl class="perfil__record">
          ${figure(record.wins, 'Vitórias', 'rbg-positive')}
          ${figure(record.losses, 'Derrotas', 'rbg-negative')}
          ${figure(record.draws, 'Empates')}
          ${figure(record.goals, 'Gols')}
          ${figure(record.assists, 'Assistências')}
          ${figure(record.goalsPerGame, 'Gols por jogo')}
        </dl>
        </div>

      </div>

      <div class="perfil__ledger">
        <section class="perfil__entry" aria-labelledby="perfil-passe">
          <h3 id="perfil-passe" class="perfil__entry-title">Passe de Batalha</h3>
          <p class="perfil__entry-figure">Nível ${pass.level}</p>
          <progress class="rbg-progress" max="${pass.xpNext}" value="${pass.xp}" aria-label="XP do nível" aria-valuetext="${pass.xp} de ${pass.xpNext} XP"></progress>
          <p class="perfil__entry-meta">${unit(pass.xp, '/')} ${unit(pass.xpNext, 'XP')}</p>
          <p class="perfil__entry-meta">${unit(number(pass.xpTotal), 'XP')} no total, ${pass.season}</p>
          <ul class="perfil__missions">
            ${pass.missions
              .map(
                (m) => `<li class="perfil__mission${m.done === m.goal ? ' perfil__mission--done' : ''}">
                  <span>${m.name}</span>
                  <span class="perfil__mission-xp">${unit(`+${m.xp}`, 'XP')}</span>
                  <span class="perfil__mission-count">${m.done === m.goal ? 'Completa' : `${m.done}/${m.goal}`}</span>
                </li>`,
              )
              .join('')}
          </ul>
          ${goLink('passe', 'Ver passe e recompensas')}
        </section>
        <section class="perfil__entry" aria-labelledby="perfil-jogo">
          <h3 id="perfil-jogo" class="perfil__entry-title">Seu próximo jogo</h3>
          <p class="perfil__entry-name">${club.name}</p>
          <p class="perfil__entry-meta">Entre em campo</p>
          ${goLink('jogar', 'Modos de jogo')}
          ${goLink('meu-time', 'Meu time')}
        </section>
      </div>
    </div>`,
  enter: (view, panel) => {
    const cleanupTurn = bindTurn(view);
    const cleanupCustomizer = profileCustomizer(view, panel);
    const onPresentation = (event) => {
      const toggle = event.target.closest('[data-profile-toggle]');
      if (!toggle || toggle.disabled) return;
      presentation = toggle.getAttribute('aria-pressed') === 'true' ? 'character' : 'card';
      toggle.setAttribute('aria-pressed', String(presentation === 'card'));
      const character = view.querySelector('.perfil__character');
      const card = view.querySelector('.perfil__card');
      character.hidden = character.inert = presentation === 'card';
      card.hidden = card.inert = presentation !== 'card';
      try {
        localStorage.setItem('rbg:profile-view', presentation);
      } catch {
        // Keep the in-memory choice when storage is unavailable.
      }
      panel.announce(presentation === 'card' ? 'Visual do perfil: Card.' : 'Visual do perfil: Personagem.');
    };
    view.addEventListener('click', onPresentation);
    return () => {
      view.removeEventListener('click', onPresentation);
      cleanupTurn();
      cleanupCustomizer();
    };
  },
};
