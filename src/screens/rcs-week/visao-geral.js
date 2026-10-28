import { artImage } from '../art.js';
import { rcs } from '../../data/rcs.js';
import { chevron, unit } from '../format.js';
import { rcsHead } from './head.js';

const col = (label, title) => `<th scope="col" class="rcs__num"><abbr title="${title}">${label}</abbr></th>`;
const { done, total, pending } = rcs.confrontations;

export default {
  id: 'visao-geral',
  tab: 'rcs-week',
  label: 'Visão Geral',
  states: ['default'],
  render: () => `
    ${rcsHead()}
    <section class="rcs__status" aria-labelledby="rcs-status">
      <h3 id="rcs-status" class="rcs__status-title">${rcs.edition.status}</h3>
      <p class="rcs__note">${unit(rcs.enrolment.clubs, 'clubes inscritos')}. ${rcs.enrolment.notice}</p>
      <button type="button" class="rbg-link" data-go="rcs-week" data-go-sub="inscricoes">Ver inscrições${chevron}</button>
      <dl class="rcs__facts">
        <div><dt>Líder provisório</dt><dd>${rcs.leader.name}</dd></div>
        <div><dt>Confrontos concluídos</dt><dd>${done}/${total}</dd></div>
        <div><dt>Pendentes</dt><dd>${pending}</dd></div>
      </dl>
      <p class="rcs__note">${rcs.leader.note}</p>
    </section>
    <section class="rcs__section" aria-labelledby="rcs-classificacao">
      <div class="rcs__section-head">
        <h3 id="rcs-classificacao" class="rcs__title">Classificação</h3>
        <p class="rcs__note">${rcs.scoring}</p>
      </div>
      <table class="rbg-table rcs__table">
        <caption class="rbg-visually-hidden">Classificação da ${rcs.edition.name}</caption>
        <thead>
          <tr>
            <th scope="col" class="rcs__pos"><abbr title="Posição">Pos.</abbr></th>
            <th scope="col" class="rcs__club">Clube</th>
            ${col('Pts', 'Pontos')}${col('J', 'Jogos')}${col('V', 'Vitórias')}${col('E', 'Empates')}${col('D', 'Derrotas')}
            ${col('GP', 'Gols pró')}${col('GC', 'Gols contra')}${col('SG', 'Saldo de gols')}
            <th scope="col" class="rcs__form">Últimos 5</th>
          </tr>
        </thead>
        <tbody>${rcs.standings
          .map(
            (team, index) => `<tr${team.mine ? ' aria-current="true"' : ''}>
          <td>${index + 1}</td><th scope="row">${team.name}</th>
          <td class="rcs__num">${team.points}</td><td class="rcs__num">${team.played}</td>
          <td class="rcs__num rbg-positive">${team.wins}</td><td class="rcs__num">${team.draws}</td>
          <td class="rcs__num rbg-negative">${team.losses}</td><td class="rcs__num">${team.goalsFor}</td>
          <td class="rcs__num rbg-negative">${team.goalsAgainst}</td>
          <td class="rcs__num${team.goalsFor < team.goalsAgainst ? ' rbg-negative' : team.goalsFor > team.goalsAgainst ? ' rbg-positive' : ''}">${team.goalsFor - team.goalsAgainst}</td>
          <td class="rcs__form">${team.form
            .slice(0, 5)
            .map(
              (value) =>
                `<abbr class="${value === 'V' ? 'rbg-positive' : value === 'D' ? 'rbg-negative' : ''}" title="${{ V: 'Vitória', E: 'Empate', D: 'Derrota' }[value]}">${value}</abbr>`,
            )
            .join(' ')}</td>
        </tr>`,
          )
          .join('')}</tbody>
      </table>
    </section>
    <section class="rcs__section" aria-labelledby="rcs-hall">
      <h3 id="rcs-hall" class="rcs__title">Hall da Fama RCS Week</h3>
      <table class="rbg-table rcs__table rcs__table--hall">
        <caption class="rbg-visually-hidden">Hall da Fama RCS Week</caption>
        <thead>
          <tr>
            <th scope="col" class="rcs__club">Clube</th>
            <th scope="col" class="rcs__num">Títulos</th>
            <th scope="col" class="rcs__num">Participações</th>
            <th scope="col" class="rcs__num">Vitórias</th>
          </tr>
        </thead>
        <tbody>${rcs.hallOfFame
          .map(
            (team) => `<tr>
          <th scope="row"><span class="rcs__identity">${artImage(team.crestSrc, '', 48)}${team.name}</span></th>
          <td class="rcs__num">${team.titles}</td><td class="rcs__num">${team.appearances}</td><td class="rcs__num">${team.wins}</td>
        </tr>`,
          )
          .join('')}</tbody>
      </table>
    </section>`,
};
