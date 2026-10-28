import { club } from '../../data/club.js';
import { matchHead, matchRow } from '../match-row.js';
import { clubHead } from './head.js';

const { history } = club;
const figure = (label, value, tone = '') => `<div><dt>${label}</dt><dd class="${tone}">${value}</dd></div>`;

export default {
  id: 'historico',
  tab: 'meu-time',
  label: 'Histórico',
  states: ['default'],
  render: () => `
    ${clubHead({ slim: true })}
    <section class="clube__section" aria-labelledby="clube-historico">
      <div class="clube__section-head">
        <h3 id="clube-historico" class="clube__title">Histórico do clube</h3>
        <p class="clube__note">${history.matches} partidas contabilizadas</p>
      </div>
      <div class="clube__record">
        <p class="clube__figure"><span>${history.winRate}<span class="clube__unit">%</span></span><span class="clube__figure-label">de aproveitamento</span></p>
        <dl class="clube__stats">
          ${figure('Vitórias', history.wins, 'rbg-positive')}
          ${figure('Empates', history.draws)}
          ${figure('Derrotas', history.losses, 'rbg-negative')}
          ${figure('Gols marcados', history.goalsFor)}
          ${figure('Gols sofridos', history.goalsAgainst, 'rbg-negative')}
          ${figure('Sequência invicta', history.unbeaten)}
        </dl>
      </div>
      <dl class="clube__insights">
        ${history.insights.map((i) => `<div><dt>${i.label}</dt><dd>${i.value}</dd><dd class="clube__note${i.label === 'Mais derrotas' ? ' rbg-negative' : i.label === 'Mais vitórias' ? ' rbg-positive' : ''}">${i.note}</dd></div>`).join('')}
        <div>
          <dt>Últimos resultados</dt>
          <dd><ol class="clube__form" aria-label="Mais recente primeiro">${history.last.map((r) => `<li class="clube__form-${r === 'V' ? 'win' : r === 'E' ? 'draw' : 'loss'}"><abbr title="${r === 'V' ? 'Vitória' : r === 'E' ? 'Empate' : 'Derrota'}">${r}</abbr></li>`).join('')}</ol></dd>
          <dd class="clube__note">Mais recente à esquerda</dd>
        </div>
      </dl>
    </section>
    <section class="clube__section" aria-labelledby="clube-partidas">
      <div class="clube__section-head">
        <h3 id="clube-partidas" class="clube__title">Partidas</h3>
        <p class="clube__note">Mais recentes primeiro</p>
      </div>
      <table class="rbg-table historico">
        <caption class="rbg-visually-hidden">Partidas do clube, da mais recente para a mais antiga</caption>
        ${matchHead('Tipo')}
        <tbody>${history.rows.map((m) => matchRow(m, `<span class="rbg-tag">${m.type}</span>`)).join('')}</tbody>
      </table>
    </section>`,
};
