import { icon } from './icons.js';

const NBSP = ' ';

export const number = (value) => value.toLocaleString('pt-BR');
export const unit = (value, label) => `${value}${NBSP}${label}`;
export const signed = (value) => (value > 0 ? `+${value}` : `−${Math.abs(value)}`);

export const chevron = icon('chevronRight', 16);

export const goLink = (tab, label) =>
  `<button type="button" class="rbg-link" data-go="${tab}">${label}${chevron}</button>`;
