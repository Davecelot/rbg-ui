import { headArt } from './art.js';
// Synthetic profile data used to exercise the panel screens.
export const player = {
  name: 'Jogador 01',
  headSrc: headArt(0),
  avatarFrames: [
    { angle: 0, src: '/assets/avatars/player-0-front.png' },
    { angle: 90, src: '/assets/avatars/player-0-right.png' },
    { angle: 180, src: '/assets/avatars/player-0-back.png' },
    { angle: 270, src: '/assets/avatars/player-0-left.png' },
  ],
  number: 10,
  status: 'No lobby',
  positions: ['ATK', 'GK'],
  rank: { tierId: 'prata', division: 'IV', pdl: 24, pdlMax: 100, position: 42 },
  winRate: 64,
  mvps: 3,
  record: { wins: 18, losses: 9, draws: 2, goals: 15, assists: 6, goalsPerGame: '0,5' },
  pass: {
    season: 'Temporada 1',
    level: 12,
    xp: 320,
    xpNext: 1000,
    xpTotal: 8320,
    missions: [
      { name: 'Jogue 3 partidas', xp: 100, done: 3, goal: 3 },
      { name: 'Vença 2 partidas', xp: 150, done: 1, goal: 2 },
    ],
  },
  club: { name: 'Clube Alfa', tag: 'ALFA' },
};
