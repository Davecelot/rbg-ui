import { artImage } from '../art.js';
import { pass } from '../../data/pass.js';
import { number, unit } from '../format.js';
import { icon } from '../icons.js';
import { itemSheets } from '../item-sheet.js';
import { itemTile } from '../item-tile.js';

const byLevel = new Map(pass.track.map((r) => [r.level, r]));
const upcoming = byLevel.get(pass.next.level);
const final = byLevel.get(pass.levels);
const toNext = pass.xpNext - pass.xp;

// Chapters of ten levels; uncaptured runs inside a chapter collapse into one gap column.
const chapters = Array.from({ length: pass.levels / 10 }, (_, c) => {
  const columns = [];
  for (let level = c * 10 + 1; level <= c * 10 + 10; level++) {
    const last = columns.at(-1);
    if (byLevel.has(level)) columns.push({ level, reward: byLevel.get(level) });
    else if (last?.gap) last.to = level;
    else columns.push({ gap: true, from: level, to: level });
  }
  return { from: c * 10 + 1, to: c * 10 + 10, columns };
});
const columns = chapters.flatMap((ch) => ch.columns.map((col, i) => ({ ...col, chapterStart: i === 0 })));

const isPeak = (r) => r.level === pass.levels || r.rarity === 'épica';
const tileNote = (r) => {
  if (r.next) return 'Próxima';
  if (r.level === pass.levels) return 'Recompensa final';
  return '';
};

const tile = (r) =>
  r.claimed
    ? itemTile({
        tag: 'div',
        name: r.name,
        art: r.art,
        rarity: r.rarity,
        note: 'Resgatada',
        locked: false,
        go: { tab: 'vestiario', sub: 'pose-mvp' },
      })
    : itemTile({
        tag: 'div',
        name: r.name,
        art: r.art,
        rarity: r.rarity,
        note: tileNote(r),
        next: r.next,
        item: r.id,
      });

const levelHead = (col) => {
  const cls = `passe__lv${col.chapterStart ? ' is-chapter' : ''}${col.level === pass.level ? ' is-current' : ''}`;
  if (col.gap) return `<td class="${cls}"></td>`;
  return `<th scope="col" class="${cls}">Nível ${col.level}${col.level === pass.level ? '<span class="passe__here">Seu nível</span>' : ''}</th>`;
};

const laneCell = (col, free) => {
  const names = [col.chapterStart && 'is-chapter', col.reward && isPeak(col.reward) && 'is-peak'].filter(Boolean);
  const cls = names.length ? ` class="${names.join(' ')}"` : '';
  if (col.gap) return free ? `<td rowspan="2"${cls}><span class="rbg-fill">[não capturados]</span></td>` : '';
  if (Boolean(col.reward.free) !== free)
    return `<td class="${[...names, 'is-empty'].join(' ')}"><span class="rbg-visually-hidden">${free ? 'Sem recompensa grátis' : 'Sem recompensa do Passe'}</span></td>`;
  return `<td${cls}>${tile(col.reward)}</td>`;
};

const hasProgress = (m) =>
  Number.isFinite(m.done) && Number.isFinite(m.goal) && m.goal > 0 && m.done >= 0 && m.done <= m.goal;

const progress = (m) => {
  if (!hasProgress(m)) return '<span class="passe__mission-progress rbg-fill">[progresso não capturado]</span>';
  const complete = m.done === m.goal;
  return `
    <span class="passe__mission-progress">
    <progress class="rbg-progress passe__bar${complete ? ' is-complete' : ''}" max="${m.goal}" value="${m.done}" aria-label="${m.name}" aria-valuetext="${complete ? 'Completa' : `${m.done} de ${m.goal}`}"></progress>
    <span class="passe__mission-count${complete ? ' is-complete' : ''}">${complete ? 'Completa' : `${m.done}/${m.goal}`}</span>
    </span>`;
};

const mission = (m) => `
  <li class="passe__mission">
    <span class="passe__mission-name">${m.name}${m.cut ? ' <span class="rbg-fill">[texto cortado]</span>' : ''}${m.tag ? ` <span class="rbg-tag">${m.tag}</span>` : ''}</span>
    ${progress(m)}
    <span class="passe__mission-xp">${unit(`+${number(m.xp)}`, 'XP')}</span>
  </li>`;

const missionList = (group) => {
  const open = group.items.filter((m) => hasProgress(m) && m.done < m.goal);
  const unknown = group.items.filter((m) => !hasProgress(m));
  const complete = group.items.filter((m) => hasProgress(m) && m.done === m.goal);
  const dailyTotal =
    group.id === 'diarias' &&
    group.items.length > 0 &&
    group.items.every((m) => hasProgress(m) && Number.isFinite(m.xp))
      ? `<p class="passe__note">As missões diárias em aberto valem ${unit(
          open.reduce((sum, m) => sum + m.xp, 0),
          'XP',
        )}.</p>`
      : '';
  const list = (title, items) =>
    items.length
      ? `<section class="passe__mission-section"><h5 class="passe__subtitle">${title}</h5><ul class="passe__list">${items.map(mission).join('')}</ul></section>`
      : '';
  return `
    <section class="passe__missions" data-mission-group="${group.id}" aria-labelledby="passe-${group.id}"${group.id === 'diarias' ? '' : ' hidden'}>
      <h4 id="passe-${group.id}" class="rbg-visually-hidden">${group.title}</h4>
      ${dailyTotal}
      ${group.items.length ? (list('Em aberto', open) || (!unknown.length ? '<p class="passe__note">Nenhuma missão em aberto.</p>' : '')) + list('Progresso não informado', unknown) + list('Completas', complete) : '<p class="passe__note">Nenhuma missão disponível.</p>'}
    </section>`;
};

export default {
  id: 'meu-progresso',
  tab: 'passe',
  label: 'Meu progresso',
  states: ['default'],
  render: () => `
    <header class="passe__head">
      <h2 class="passe__title">Passe de Batalha</h2>
      <p class="passe__note">${pass.season}, ${pass.endsIn} (${pass.endsOn})</p>
      <span class="rbg-tag">${pass.ribbon}</span>
    </header>
    <section class="passe__hero" aria-labelledby="passe-nivel">
      <button type="button" class="passe__final" data-item="${final.id}">
        <span class="rbg-slot passe__final-art" data-slot="item" data-alt="${final.name}">${artImage(final.art, final.name)}</span>
        <span class="passe__final-info">
          <span class="passe__final-level"><span>Nível</span> ${final.level}</span>
          <span class="passe__final-name">${final.name}</span>
          <span class="passe__final-label">Recompensa final com o Passe</span>
          <span class="passe__final-action">Ver recompensa ${icon('chevronRight')}</span>
        </span>
      </button>
      <div class="passe__level">
        <h3 id="passe-nivel" class="passe__figure"><span class="passe__figure-label">Nível</span> ${pass.level}</h3>
        <progress class="rbg-progress" max="${pass.xpNext}" value="${pass.xp}" aria-label="XP do nível" aria-valuetext="${pass.xp} de ${pass.xpNext} XP"></progress>
        <p class="passe__xp">${unit(pass.xp, '/')} ${unit(pass.xpNext, 'XP')}. Faltam ${unit(toNext, 'XP')}.</p>
        <button type="button" class="passe__next" data-item="${upcoming.id}">
          <span class="rbg-slot">${artImage(upcoming.art, upcoming.name)}</span>
          <span><span class="passe__note">Próxima, nível ${upcoming.level}, com o Passe</span><strong>${upcoming.name}</strong></span>
        </button>
        <div class="passe__offer">
          <button type="button" class="rbg-button" data-pending="Obter o Passe">Obter o Passe</button>
          <p>${pass.buy.perk} Inclui recompensas anteriores.</p>
        </div>
        <p class="passe__note passe__link-help">${pass.buy.linkHelp} <button type="button" class="rbg-link" data-pending="Copiar link">Copiar link</button></p>
      </div>
    </section>
    <section class="passe__section passe__buy" aria-labelledby="passe-comprar">
      <div class="passe__redeem-heading">
        <h3 id="passe-comprar" class="passe__section-title">Já pagou?</h3>
        <p class="passe__redeem-hint">Role para digitar o código</p>
      </div>
      <div class="passe__redeem">
        <label class="passe__redeem-label" for="passe-codigo">Digite o código</label>
        <div class="passe__redeem-row">
          <input class="rbg-input" id="passe-codigo" name="codigo" type="text" autocomplete="off" placeholder="ex.: ${pass.buy.codeExample}" />
          <button type="button" class="rbg-link" data-pending="Resgatar">Resgatar</button>
        </div>
      </div>
    </section>
    <section class="passe__section" aria-labelledby="passe-recompensas">
      <div class="passe__section-head">
        <h3 id="passe-recompensas" class="passe__section-title">Recompensas</h3>
        <p class="passe__note">${pass.notice}</p>
        <p class="passe__marker">Próxima épica: ${pass.nextEpic.name}, nível ${pass.nextEpic.level}.</p>
        <div class="passe__track-nav">
          <button type="button" class="rbg-icon-button" data-track="-1" aria-label="Níveis anteriores">${icon('chevronLeft')}</button>
          <button type="button" class="rbg-icon-button" data-track="1" aria-label="Próximos níveis">${icon('chevronRight')}</button>
        </div>
      </div>
      <div class="passe__track" role="region" aria-label="Trilha de recompensas" tabindex="0">
        <table class="passe__lanes" style="--passe-columns: ${columns.length}">
          <caption class="rbg-visually-hidden">Recompensas por nível, grátis e com o Passe</caption>
          <colgroup><col class="passe__lane-col" />${columns.map(() => '<col class="passe__reward-col" />').join('')}</colgroup>
          <thead>
            <tr class="passe__chapters">
              <td class="passe__corner"></td>
              ${chapters.map((ch) => `<th scope="colgroup" colspan="${ch.columns.length}" class="is-chapter">Níveis ${ch.from} a ${ch.to}</th>`).join('')}
            </tr>
            <tr>
              <td class="passe__corner"></td>
              ${columns.map(levelHead).join('')}
            </tr>
          </thead>
          <tbody>
            <tr><th scope="row" class="passe__lane">Grátis</th>${columns.map((col) => laneCell(col, true)).join('')}</tr>
            <tr><th scope="row" class="passe__lane"><span>Com o Passe</span></th>${columns.map((col) => laneCell(col, false)).join('')}</tr>
          </tbody>
        </table>
      </div>
    </section>
    <section class="passe__section" aria-labelledby="passe-missoes">
      <div class="passe__section-head">
        <h3 id="passe-missoes" class="passe__section-title">Missões</h3>
        <p class="passe__marker">Faltam ${unit(toNext, 'XP')} para o nível ${pass.level + 1}.</p>
      </div>
      <fieldset class="rbg-segmented passe__filters">
        <legend class="rbg-visually-hidden">Tipo de missão</legend>
        ${pass.missions.map((group) => `<label><input type="radio" name="passe-mission-group" value="${group.id}"${group.id === 'diarias' ? ' checked' : ''} /><span>${{ diarias: 'Diárias', semanais: 'Semanais', temporada: 'Temporada' }[group.id]}</span></label>`).join('')}
      </fieldset>
      <div class="passe__mission-groups">${pass.missions.map(missionList).join('')}</div>
    </section>
    `,
  enter: (view, panel) => {
    const track = view.querySelector('.passe__track');
    const filters = view.querySelector('.passe__filters');
    const onFilter = (event) => {
      if (!event.target.matches('input[name="passe-mission-group"]')) return;
      view.querySelectorAll('[data-mission-group]').forEach((group) => {
        group.hidden = group.dataset.missionGroup !== event.target.value;
      });
    };
    filters.addEventListener('change', onFilter);
    const onNav = (event) => {
      const button = event.target.closest('[data-track]');
      if (!button || button.getAttribute('aria-disabled') === 'true') return;
      const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
      track.scrollBy({
        left: Number(button.dataset.track) * (track.clientWidth - view.querySelector('.passe__lane').offsetWidth),
        behavior: still ? 'auto' : 'smooth',
      });
    };
    const [prev, next] = view.querySelectorAll('[data-track]');
    const syncNav = () => {
      prev.setAttribute('aria-disabled', String(track.scrollLeft <= 0));
      next.setAttribute('aria-disabled', String(track.scrollLeft + track.clientWidth >= track.scrollWidth - 1));
    };
    track.addEventListener('scroll', syncNav, { passive: true });
    syncNav();
    view.addEventListener('click', onNav);
    const closeSheets = itemSheets(view, panel, (id) => pass.track.find((r) => r.id === id));
    return () => {
      filters.removeEventListener('change', onFilter);
      view.removeEventListener('click', onNav);
      track.removeEventListener('scroll', syncNav);
      closeSheets();
    };
  },
};
