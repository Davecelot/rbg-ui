import { artUrl } from '../art.js';
import { rcs } from '../../data/rcs.js';

// The edition header every RCS Week sub-tab shares.
export const rcsHead = () => `
  <header class="rcs__head">
    <img class="rcs__logo" src="${artUrl('/assets/brand/rcs-logo.png')}" alt="Rebug Champions Series" width="64" height="60" />
    <h2 class="rcs__edition">${rcs.edition.name}</h2>
    <label class="rcs__picker">
      <span class="rbg-visually-hidden">Edição</span>
      <select class="rcs__select"><option>${rcs.edition.label}</option></select>
    </label>
  </header>`;
