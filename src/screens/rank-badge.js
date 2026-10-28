import { tiers } from '../data/ranks.js';

const shields = [
  'M18 12h28v24L32 49 18 36Z',
  'M14 10h36v25L40 45l-8 6-8-6-10-10Z',
  'M12 12 32 7l20 5v22L42 46 32 53 22 46 12 34Z',
  'M12 9h12l8-5 8 5h12v23L42 46 32 54 22 46 12 32Z',
  'M10 15 20 6l12 4L44 6l10 9-4 20-18 20-18-20Z',
  'M10 10 24 6l8 5 8-5 14 4-3 25-19 20-19-20Z',
  'M8 18 20 4l12 5 12-5 12 14-7 20-17 18-17-18Z',
  'M8 12 18 5l14 5 14-5 10 7-4 25-20 19-20-19Z',
  'M8 17 16 4l8 7 8-8 8 8 8-7 8 13-5 21-19 18-19-18Z',
  'M6 17 15 3l9 8 8-10 8 10 9-8 9 14-7 23-19 17-19-17Z',
];

export const rankName = (id, division = '') =>
  [
    id === 'unranked' ? 'Sem classificação' : (tiers.find((tier) => tier.id === id)?.name ?? 'Elo não informado'),
    division,
  ]
    .filter(Boolean)
    .join(' ');

export function rankBadge(id, division = '') {
  const tierIndex = tiers.findIndex((tier) => tier.id === id);
  const unranked = id === 'unranked';
  if (tierIndex < 0 && !unranked) return '';
  const index = unranked ? 0 : tierIndex;
  const apex = index >= 7;
  const echelon = apex ? 'apex' : index >= 5 ? 'upper' : 'base';
  const insigniaOffset = index >= 5 ? -3 : -5;
  return `<span class="rbg-rank-badge" data-tier="${id}" data-echelon="${echelon}" aria-hidden="true">
    <svg viewBox="0 0 64 64" width="48" height="48" focusable="false">
      <g class="rbg-rank-badge__crest">
        <path d="${shields[index]}" fill="currentColor" fill-opacity=".18" stroke="currentColor" stroke-width="${apex ? 2.75 : 2.25}" stroke-linejoin="round"/>
        <g transform="translate(0 ${insigniaOffset})">
          ${index >= 5 ? '<path d="M20 17h24l-3 7H23Z" fill="currentColor" fill-opacity=".72"/>' : ''}
          <path d="M22 25h20v16H22zM22 33h20M32 25v16M22 29h4v8h-4m20-8h-4v8h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
          <circle cx="32" cy="33" r="3.5" fill="none" stroke="currentColor" stroke-width="1.6"/>
          ${apex ? '<path d="m16 23-7-4 3 8-5 4 10 4m31-12 7-4-3 8 5 4-10 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/>' : ''}
          ${index === 9 ? '<path d="M25 16h14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"/>' : ''}
        </g>
      </g>
    </svg>
    ${division && !apex && !unranked ? `<span class="rbg-rank-badge__division">${division}</span>` : ''}
  </span>`;
}
