// Owner's ladder, 2026-10-26 (docs/screen-inventory.md › Owner answers, 3).
const divisions = ['IV', 'III', 'II', 'I'];

export const pdlPerDivision = 100;

export const tiers = [
  { id: 'ferro', name: 'Ferro', divisions },
  { id: 'bronze', name: 'Bronze', divisions },
  { id: 'prata', name: 'Prata', divisions },
  { id: 'ouro', name: 'Ouro', divisions },
  { id: 'platina', name: 'Platina', divisions },
  { id: 'esmeralda', name: 'Esmeralda', divisions },
  { id: 'diamante', name: 'Diamante', divisions },
  { id: 'craque', name: 'Craque', divisions: [] },
  { id: 'lenda', name: 'Lenda', divisions: [] },
  { id: 'fenomeno', name: 'Fenômeno', divisions: [] },
];
