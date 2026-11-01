import { artImage, artUrl, bindArt } from './art.js';
import { player } from '../data/player.js';
import { icon } from './icons.js';

const stageBar = (named, actions = '') => `
    <div class="rbg-stage__bar">
      <p class="rbg-stage__id"><span class="rbg-stage__kit"><span class="rbg-visually-hidden">Camisa </span>${named ? '#' : ''}${player.number}</span>${named ? ` <span class="rbg-stage__name">${player.name}</span>` : ''}</p>
      <div class="rbg-stage__actions">${actions}</div>
    </div>`;

export const avatarStage = ({ actions = '', named = false, backdrop = '' } = {}) => `
  <div class="rbg-stage">
    ${backdrop ? `<div class="rbg-stage__portrait">${backdrop}` : ''}
    <div class="rbg-slot rbg-stage__sprite" data-slot="avatar" data-alt="Avatar de ${player.name}">${artImage(player.avatarFrames?.[0]?.src, `Avatar de ${player.name}`, 192)}</div>
    ${backdrop ? '</div>' : ''}
    <div class="rbg-stage__rotation" role="group" aria-label="Girar avatar">
      <button type="button" class="rbg-icon-button" data-turn-step="-45" aria-label="Girar avatar para a esquerda">${icon('chevronLeft')}</button>
      <span class="rbg-stage__drag" data-turn>Girar <output data-angle aria-live="off">0°</output></span>
      <button type="button" class="rbg-icon-button" data-turn-step="45" aria-label="Girar avatar para a direita">${icon('chevronRight')}</button>
    </div>
    ${stageBar(named, actions)}
  </div>`;

const stageArt = (item) =>
  item?.art
    ? artImage(item.art, item.name, 192)
    : artImage(player.avatarFrames?.[0]?.src, `Avatar de ${player.name}`, 192);

export const previewStage = (item) => `
  <div class="rbg-stage" data-preview>
    <div class="rbg-slot rbg-stage__sprite" data-slot="item">${stageArt(item)}</div>
    ${stageBar(true)}
  </div>`;

export function showPreview(view, item) {
  const sprite = view.querySelector('.rbg-stage[data-preview] .rbg-stage__sprite');
  if (!sprite) return () => {};
  sprite.innerHTML = stageArt(item);
  return bindArt(sprite);
}

export function bindTurn(view) {
  const stage = view.querySelector('.rbg-stage');
  const sprite = stage.querySelector('.rbg-stage__sprite');
  const output = stage.querySelector('[data-angle]');
  const dragTargets = [sprite, stage.querySelector('[data-turn]')];
  const frames = (player.avatarFrames ?? []).filter(
    (frame) => frame && Number.isFinite(frame.angle) && /^\/assets\/[\w/.-]+$/.test(frame.src),
  );
  let angle = 0;
  let drag = null;
  let image = null;
  const wrap = (value) => ((value % 360) + 360) % 360;
  const distance = (frame) => Math.abs(wrap(frame.angle - angle + 180) - 180);
  const missing = () => {
    image = null;
    sprite.textContent = '[avatar indisponível]';
  };
  const update = (value) => {
    angle = wrap(value);
    sprite.dataset.angle = String(Math.round(angle) % 360);
    output.textContent = `${Math.round(angle) % 360}°`;
    if (!frames.length) return missing();
    const nearest = frames.reduce((best, frame) => (distance(frame) < distance(best) ? frame : best));
    if (!image) {
      image = document.createElement('img');
      image.width = 192;
      image.height = 192;
      image.alt = `Avatar de ${player.name}`;
      image.draggable = false;
      image.addEventListener('error', missing, { once: true });
      sprite.replaceChildren(image);
    }
    const src = artUrl(nearest.src);
    if (image.getAttribute('src') !== src) image.src = src;
  };
  const down = (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, angle, target: event.currentTarget };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event) => {
    if (drag?.id !== event.pointerId) return;
    update(drag.angle + ((event.clientX - drag.x) / stage.getBoundingClientRect().width) * 360);
  };
  const end = (event) => {
    if (drag?.id !== event.pointerId) return;
    const { target, id } = drag;
    drag = null;
    if (target.hasPointerCapture(id)) target.releasePointerCapture(id);
  };
  const step = (event) => {
    const button = event.target.closest('[data-turn-step]');
    if (button) update(angle + Number(button.dataset.turnStep));
  };
  const events = { pointerdown: down, pointermove: move, pointerup: end, pointercancel: end, lostpointercapture: end };
  for (const target of dragTargets) {
    for (const [name, listener] of Object.entries(events)) target.addEventListener(name, listener);
  }
  stage.addEventListener('click', step);
  update(0);
  return () => {
    if (drag) end({ pointerId: drag.id });
    for (const target of dragTargets) {
      for (const [name, listener] of Object.entries(events)) target.removeEventListener(name, listener);
    }
    stage.removeEventListener('click', step);
    image?.removeEventListener('error', missing);
  };
}
