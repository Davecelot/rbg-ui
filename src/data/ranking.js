import { player } from './player.js';
import { headArt, crestArt } from './art.js';
import { club } from './club.js';
// Ranking tab, with fictional demo rows for players and clubs.
export const playerRanking = {
  total: 143,
  page: 1,
  pages: 4,
  rows: [
    {
      position: 1,
      name: 'Jogador 19',
      headSrc: null,
      pass: true,
      tierId: 'fenomeno',
      pdl: 50,
      wins: 38,
      losses: 9,
      draws: 4,
      goals: 41,
    },
    {
      position: 2,
      name: 'Jogador 20',
      headSrc: null,
      pass: false,
      tierId: 'lenda',
      pdl: 42,
      wins: 31,
      losses: 13,
      draws: 2,
      goals: 28,
    },
    {
      position: 3,
      name: 'Jogador 21',
      headSrc: null,
      pass: true,
      tierId: 'craque',
      pdl: 33,
      wins: 27,
      losses: 12,
      draws: 3,
      goals: 24,
    },
    {
      position: 4,
      name: 'Jogador 22',
      headSrc: null,
      pass: false,
      tierId: 'diamante',
      division: 'I',
      pdl: 28,
      wins: 24,
      losses: 10,
      draws: 5,
      goals: 19,
    },
    {
      position: 5,
      name: 'Jogador 23',
      headSrc: null,
      pass: true,
      tierId: 'esmeralda',
      division: 'I',
      pdl: 19,
      wins: 21,
      losses: 14,
      draws: 2,
      goals: 17,
    },
    {
      position: 6,
      name: 'Jogador 13',
      headSrc: null,
      pass: true,
      tierId: 'platina',
      division: 'II',
      pdl: 12,
      wins: 19,
      losses: 11,
      draws: 1,
      goals: 16,
    },
    {
      position: 7,
      name: 'Jogador 14',
      headSrc: null,
      pass: true,
      tierId: 'platina',
      division: 'IV',
      pdl: 36,
      wins: 17,
      losses: 10,
      draws: 2,
      goals: 14,
    },
    {
      position: 8,
      name: 'Jogador 15',
      headSrc: null,
      pass: false,
      tierId: 'ouro',
      division: 'I',
      pdl: 22,
      wins: 16,
      losses: 9,
      draws: 0,
      goals: 13,
    },
    {
      position: 9,
      name: 'Jogador 16',
      headSrc: null,
      pass: true,
      tierId: 'ouro',
      division: 'I',
      pdl: 18,
      wins: 15,
      losses: 11,
      draws: 2,
      goals: 12,
    },
  ],
};

export const clubRanking = {
  total: 5,
  rows: [
    { position: 1, name: 'Clube Gama', tag: 'CG', crestSrc: null, level: 3, xp: 330, points: 13, titles: 0 },
    { position: 2, name: 'Clube Beta', tag: 'CB', crestSrc: null, level: 1, xp: 95, points: 1, titles: 0 },
    { position: 3, name: 'Clube Alfa', tag: 'CA', crestSrc: null, level: 1, xp: 0, points: 0, titles: 0, mine: true },
  ],
};

const names = ['Atleta'];
// Generated rows descend through the player's own example row to Ferro IV.
const ladder = ['ouro', 'prata', 'bronze', 'ferro'].flatMap((tierId) =>
  ['I', 'II', 'III', 'IV'].map((division) => ({ tierId, division })),
);
const scoreOf = ({ tierId, division, pdl }) =>
  (ladder.length - 1 - ladder.findIndex((step) => step.tierId === tierId && step.division === division)) * 100 + pdl;
const ladderAt = (position) => {
  const top = scoreOf({ tierId: 'ouro', division: 'I', pdl: 11 });
  const mine = scoreOf(player.rank);
  const score =
    position < player.rank.position
      ? Math.round(top - ((top - mine) * (position - 9)) / (player.rank.position - 9))
      : Math.round(
          mine - ((mine - 5) * (position - player.rank.position)) / (playerRanking.total - player.rank.position),
        );
  return { ...ladder[ladder.length - 1 - Math.floor(score / 100)], pdl: score % 100 };
};
for (let position = 10; position <= playerRanking.total; position++) {
  playerRanking.rows.push(
    position === player.rank.position
      ? {
          position,
          name: player.name,
          headSrc: player.headSrc,
          tierId: player.rank.tierId,
          division: player.rank.division,
          pdl: player.rank.pdl,
          ...player.record,
          mine: true,
        }
      : {
          position,
          name: `${names[(position - 10) % names.length]}${String(position - 5).padStart(2, '0')}`,
          ...ladderAt(position),
          wins: Math.max(5, 62 - Math.floor(position / 3)),
          losses: 12 + (position % 35),
          draws: position % 5,
          goals: Math.max(2, 74 - Math.floor(position / 2)),
          pass: position % 3 === 0,
        },
  );
}
playerRanking.rows.forEach((row, index) => {
  row.headSrc ??= headArt(index);
});
clubRanking.rows.push(
  { position: 4, name: 'Clube Delta', tag: 'CD', level: 6, xp: 920, points: 7, titles: 1 },
  { position: 5, name: 'Clube Épsilon', tag: 'CE', level: 4, xp: 540, points: 4, titles: 0 },
);
clubRanking.rows.forEach((row, index) => {
  row.crestSrc = crestArt(index);
});
Object.assign(
  clubRanking.rows.find((row) => row.mine),
  { level: club.level, xp: club.totalXp, points: 8, titles: 1 },
);
clubRanking.rows[0].points = 15;
clubRanking.rows[1].points = 11;
