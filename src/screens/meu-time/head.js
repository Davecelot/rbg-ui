import { artImage } from '../art.js';
import { club } from '../../data/club.js';

// The club header every Meu Time sub-tab shares.
export const clubHead = ({ slim = false } = {}) => `
  <header class="clube__head${slim ? ' clube__head--slim' : ''}">
    <span class="rbg-slot clube__crest" data-slot="crest" data-alt="Escudo do ${club.name}">${artImage(club.crestSrc, `Escudo do ${club.name}`, 48)}</span>
    <div class="clube__identity">
      <div class="clube__name-row"><h2 class="clube__name">${club.name}</h2><span class="rbg-tag">${club.tag}</span></div>
      <p class="clube__meta">Nível ${club.level}, ${club.levelLabel.toLowerCase()}. Próxima: ${club.next.name} (nível ${club.next.level})</p>
    </div>
    <dl class="clube__facts">
      <div><dt>XP do clube</dt><dd>${club.xp}/${club.xpNext}</dd></div>
      <div><dt>Capitão</dt><dd>${club.captain}</dd></div>
      <div><dt>Elenco</dt><dd>${club.roster.count}/${club.roster.max}</dd></div>
    </dl>
    <progress class="rbg-progress clube__xp" max="${club.xpNext}" value="${club.xp}" aria-label="XP do clube" aria-valuetext="${club.xp} de ${club.xpNext} XP"></progress>
  </header>`;
