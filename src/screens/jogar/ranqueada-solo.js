import { play } from '../../data/play.js';
import { positions } from '../../data/positions.js';
import { unit } from '../format.js';
import { changeMode } from './back.js';

const { queue } = play;

const picker = (name, label, options, selected, locked) => `
  <fieldset class="rbg-segmented jogar__positions"${locked ? ' disabled aria-describedby="jogar-position-lock"' : ''}>
    <legend class="jogar__legend">${label}</legend>
    ${options
      .map(
        (code) =>
          `<label><input type="radio" name="${name}" value="${code}"${code === selected ? ' checked' : ''} /><span><abbr title="${positions[code]}">${code}</abbr></span></label>`,
      )
      .join('')}
  </fieldset>`;

export default {
  id: 'ranqueada-solo',
  tab: 'jogar',
  label: 'Ranqueada Solo',
  states: ['default'],
  render: ({ data = {} } = {}) => {
    const active = data.queue;
    const filled = active ? 1 : 0;
    return `
    <h2 class="rbg-visually-hidden">Ranqueada Solo</h2>
    ${active ? '' : changeMode}
    <div class="jogar__queue">
      <div class="jogar__band">
        <p class="jogar__figure">${active ? '<time data-queue-time aria-live="off">0:00</time>' : `${filled}/${queue.size}`}</p>
        <p class="jogar__figure-label">${active ? 'Procurando partida' : 'na sua faixa de MMR'}</p>
        <ol class="jogar__seats" aria-label="Vagas na sua faixa de MMR">
          ${Array.from({ length: queue.size }, (_, i) => `<li${i < filled ? ' class="is-filled"' : ''}><span class="${active && i === 0 ? 'jogar__seat-you' : 'rbg-visually-hidden'}">${active && i === 0 ? 'Você' : 'Vaga livre'}</span></li>`).join('')}
        </ol>
        <p class="jogar__hint">${active ? `1/${queue.size} na sua faixa de MMR` : `${queue.inBand} jogadores na sua faixa: escolha suas posições para entrar.`}</p>
        <dl class="jogar__stats">
          <div><dt>Buscando no hotel</dt><dd>${queue.searching + (active ? 1 : 0)}</dd></div>
          <div><dt>Partidas formadas nos últimos ${unit(10, 'min')}</dt><dd>${queue.formedLast10}</dd></div>
          <div><dt>Times buscando</dt><dd>${queue.teamsSearching}</dd></div>
          <div><dt>Times em partida</dt><dd>${queue.teamsPlaying}</dd></div>
        </dl>
      </div>
      <div class="jogar__side">
        ${picker('primaria', 'Posição primária', queue.primaryOptions, queue.primary, active)}
        ${picker('secundaria', 'Posição secundária', queue.secondaryOptions, queue.secondary, active)}
        ${
          active
            ? '<p class="jogar__lock" id="jogar-position-lock">Saia da fila para trocar de posição ou modo.</p>'
            : ''
        }
        <p class="jogar__help">Várias partidas são montadas ao mesmo tempo no hotel, cada uma com jogadores de MMR parecido. Quem está na fila fica em segredo: você só descobre os outros jogadores quando a sua partida for encontrada.</p>
      </div>
    </div>`;
  },
  enter: (view, panel) => {
    if (!panel.queue() && panel.mode() !== 'buscando') {
      panel.setMode('buscando');
      return null;
    }
    const onChange = (event) => {
      if (!panel.queue() && event.target.name === 'primaria') queue.primary = event.target.value;
      if (!panel.queue() && event.target.name === 'secundaria') queue.secondary = event.target.value;
    };
    const side = view.querySelector('.jogar__side');
    side.addEventListener('change', onChange);
    return () => {
      side.removeEventListener('change', onChange);
    };
  },
};
