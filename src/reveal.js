const unit = [
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'li',
  'tr:not(:has(.rbg-tile))',
  'dl > div',
  'figure',
  'nav',
  'button',
  'a',
  'label',
  'legend',
  'span',
  'input',
  'select',
  'textarea',
  'progress',
  '[data-slot]',
  '.rbg-stage',
  '.rbg-tile',
].join(',');

export function revealContent(view) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const style = getComputedStyle(view);
  const milliseconds = (token) => {
    const value = style.getPropertyValue(token).trim();
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000);
  };
  const duration = milliseconds('--dur-reveal');
  const stagger = milliseconds('--dur-fast');
  const distance = style.getPropertyValue('--space-1').trim();
  const rowGap = parseFloat(style.getPropertyValue('--space-2'));
  const easing = style.getPropertyValue('--ease-out').trim();
  const running = new Map();
  let frame = 0;

  const cancel = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    for (const animation of running.values()) animation.cancel();
    running.clear();
  };

  const reveal = () => {
    frame = 0;
    if (reduced.matches || !view.isConnected) return;
    const bounds = view.getBoundingClientRect();
    const items = [...view.querySelectorAll(unit)]
      .filter(
        (element) =>
          view.contains(element) &&
          !element.closest('[hidden], .rbg-visually-hidden') &&
          !view.contains(element.parentElement.closest(unit)) &&
          !element.contains(document.activeElement),
      )
      .map((element) => ({ element, box: element.getBoundingClientRect() }))
      .filter(
        ({ box }) =>
          box.width > 0 &&
          box.height > 0 &&
          box.bottom > bounds.top &&
          box.top < bounds.bottom &&
          box.right > bounds.left &&
          box.left < bounds.right,
      )
      .sort((a, b) => a.box.top - b.box.top);
    const rows = [];
    for (const item of items) {
      if (!rows.length || item.box.top - rows.at(-1)[0].box.top > rowGap) rows.push([]);
      rows.at(-1).push(item);
    }
    const ordered = rows.flatMap((row) => row.sort((a, b) => a.box.left - b.box.left));
    ordered.forEach(({ element }, index) => {
      running.get(element)?.cancel();
      const animation = element.animate(
        [
          { opacity: 0, transform: `translateY(${distance})` },
          { opacity: 1, transform: 'none' },
        ],
        { duration, delay: (index * stagger) / Math.max(1, ordered.length - 1), easing, fill: 'backwards' },
      );
      running.set(element, animation);
      const release = () => {
        if (running.get(element) === animation) running.delete(element);
      };
      animation.finished.then(release, release);
    });
  };

  const finishTarget = (event) => {
    for (const [element, animation] of running) {
      if (element.contains(event.target)) animation.finish();
    }
  };
  view.addEventListener('focusin', finishTarget);
  view.addEventListener('pointerdown', finishTarget);
  reduced.addEventListener('change', cancel);
  frame = requestAnimationFrame(reveal);
  return () => {
    reduced.removeEventListener('change', cancel);
    view.removeEventListener('focusin', finishTarget);
    view.removeEventListener('pointerdown', finishTarget);
    cancel();
  };
}
