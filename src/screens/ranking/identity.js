import { artUrl } from '../art.js';

export function identitySlot(src, type, name, passOwner = false) {
  const label = type === 'avatar' ? 'Avatar' : 'Escudo';
  const asset = /^\/assets\/[\w/.-]+$/.test(src ?? '');
  return `<span class="ranking__identity rbg-slot${passOwner ? ' ranking__identity--pass' : ''}" data-slot="${type}" data-alt="${label} de ${name}">
    ${asset ? `<img src="${artUrl(src)}" width="48" height="48" alt="${label} de ${name}" />` : `[${label.toLowerCase()}]`}
  </span>`;
}

export function bindIdentitySlots(view) {
  const controller = new AbortController();
  for (const image of view.querySelectorAll('.ranking__identity img')) {
    const missing = () => {
      const slot = image.parentElement;
      slot.textContent = slot.dataset.slot === 'avatar' ? '[avatar]' : '[escudo]';
    };
    image.addEventListener('error', missing, { once: true, signal: controller.signal });
    if (image.complete && image.naturalWidth === 0) missing();
  }
  return () => controller.abort();
}
