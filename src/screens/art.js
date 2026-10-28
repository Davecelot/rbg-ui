export function artImage(src, alt, size = 64) {
  return /^\/assets\/[\w/.-]+$/.test(src ?? '')
    ? `<img class="rbg-art" src="${src}" width="${size}" height="${size}" alt="${alt}" />`
    : `<span class="rbg-art__missing">[${alt}]</span>`;
}

export function bindArt(view) {
  const controller = new AbortController();
  for (const image of view.querySelectorAll('img.rbg-art')) {
    const missing = () => {
      const fallback = document.createElement('span');
      fallback.className = 'rbg-art__missing';
      fallback.textContent = `[${image.alt || 'imagem indisponível'}]`;
      image.replaceWith(fallback);
    };
    image.addEventListener('error', missing, { once: true, signal: controller.signal });
    if (image.complete && !image.naturalWidth) missing();
  }
  return () => controller.abort();
}
