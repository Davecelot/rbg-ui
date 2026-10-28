import { artImage } from '../art.js';
import { club } from '../../data/club.js';
import { clubHead } from './head.js';

const uniform = (u) => `
  <li class="clube__uniform">
    ${u.filled ? `<span class="rbg-slot clube__uniform-art" data-slot="uniform" data-alt="${u.label}">${artImage(u.art, u.label, 64)}</span>` : '<span class="clube__uniform-art clube__uniform-art--empty">Vaga</span>'}
    <span class="clube__uniform-name">${u.label}</span>
    ${u.filled ? `<span class="clube__note">${u.colors}</span>` : ''}
  </li>`;

export default {
  id: 'identidade',
  tab: 'meu-time',
  label: 'Identidade e gestão',
  states: ['default'],
  render: () => `
    ${clubHead({ slim: true })}
    <section class="clube__section" aria-labelledby="clube-uniformes">
      <div class="clube__section-head">
        <h3 id="clube-uniformes" class="clube__title">Uniformes</h3>
      </div>
      <p class="clube__note">Só o capitão grava os uniformes. Na partida de times cada um entra vestido com eles.</p>
      <ul class="clube__uniforms">${club.uniforms.map(uniform).join('')}</ul>
    </section>`,
};
