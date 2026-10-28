import { avatarArt, crestArt, itemArt } from './art.js';
// The player's club, from docs/screen-inventory.md §4 (#10–#20, C11–C15). Example additions are documented in docs/demo-content.md.
export const club = {
  name: 'Clube Alfa',
  tag: 'ALFA',
  level: 6,
  levelLabel: 'Clube em ascensão',
  xp: 42,
  xpNext: 100,
  totalXp: 450,
  next: { name: 'Entrada de Clube', level: 15 },
  captain: 'Jogador 05',
  roster: { count: 5, max: 5 },
  lineup: [
    { slot: 'GK', name: 'Jogador 01', status: 'Esperando', me: true },
    { slot: 'DEF', name: 'Jogador 03', status: 'Fora do lobby' },
    { slot: 'MID', name: 'Jogador 05', status: 'Fora do lobby', captain: true },
    { slot: 'ATK', name: 'Jogador 02', status: 'Ocupado' },
    { slot: 'RES', name: 'Jogador 04', status: 'No banco' },
  ],
  uniforms: [
    { label: '1º uniforme', filled: true },
    { label: '2º uniforme', filled: true },
    { label: '3º uniforme', filled: false },
    { label: '4º uniforme', filled: true },
    { label: 'Goleiro 1', filled: true },
  ],
  history: {
    matches: 8,
    wins: 5,
    draws: 1,
    losses: 2,
    goalsFor: 17,
    goalsAgainst: 9,
    winRate: 62,
    unbeaten: 3,
    insights: [
      { label: 'Mais vitórias', value: 'Clube Beta', note: '2 vitórias em 4 jogos' },
      { label: 'Mais derrotas', value: 'Clube Gama', note: '3 derrotas em 5 jogos' },
      { label: 'Maior goleada', value: '5 × 1', note: 'Clube Delta' },
    ],
    last: ['V', 'V', 'D', 'V', 'E'],
    rows: [
      {
        result: 'Derrota',
        reason: 'Amistoso contabilizado',
        ago: 'há 4 dias',
        duration: '21 min',
        position: 'GK',
        goals: 0,
        assists: 0,
        note: '1 contra',
        score: [1, 2],
        opponent: 'Clube Alfa',
        type: 'Amistoso',
      },
      {
        result: 'Vitória',
        reason: 'Amistoso contabilizado',
        ago: 'há 4 dias',
        duration: '23 min',
        position: 'GK',
        goals: 0,
        assists: 0,
        score: null,
        opponent: 'Clube Alfa',
        type: 'Amistoso',
      },
      {
        result: 'Abandono',
        reason: 'Saiu da partida: derrota em dobro',
        ago: 'há 4 dias',
        position: 'GK',
        goals: 0,
        assists: 0,
        score: null,
        opponent: 'Clube Alfa',
        type: 'Amistoso',
      },
    ],
  },
  missions: {
    renews: 'Renova à meia-noite UTC',
    left: 'faltam 20 h',
    items: [
      { name: 'Disputar 1 amistoso', xp: 30, done: 0, goal: 1 },
      { name: 'Vencer 1 amistoso', xp: 40, done: 0, goal: 1 },
      { name: 'Marcar 2 gols', xp: 50, done: 0, goal: 2 },
      { name: 'Disputar 2 partidas', xp: 60, done: 0, goal: 2 },
      { name: 'Não sofrer gol em 1 partida', xp: 55, done: 0, goal: 1 },
      { name: 'Participar de 1 copa', xp: 80, done: 0, goal: 1 },
    ],
  },
  trail: [
    {
      level: 5,
      name: 'Identidade do Clube',
      type: 'Título',
      description: 'Uma estrela junto ao escudo em Meu Time. Passe o mouse sobre ela para ver o selo.',
    },
    { level: 10, name: 'Apresentação VS', type: 'Apresentação VS', replay: 'Assistir novamente' },
    { level: 15, name: 'Entrada de Clube', type: 'Entrada' },
    { level: 20, name: 'Moldura Especial', type: 'Moldura' },
    { level: 25, name: 'Celebração Coletiva', type: 'Comemoração' },
    { level: 30, name: 'Entrada Avançada', type: 'Entrada' },
    { level: 40, name: 'Comemoração Especial', type: 'Comemoração' },
    { level: 50, name: 'Entrada Lendária', type: 'Entrada' },
  ],
  special: [
    { name: 'Celebração de título', condition: 'Campeão de copa' },
    { name: 'Entrada campeã RCS', condition: 'Campeão RCS' },
    { name: 'Entrada campeã de temporada', condition: '1º na temporada' },
    { name: 'Entrada temática da temporada', condition: '500 XP sazonal' },
    { name: 'Moldura da temporada', condition: '1.500 XP sazonal' },
    { name: 'Título Veteranos', condition: '20 amistosos oficiais' },
    { name: 'Moldura Dinastia', condition: '2 copas oficiais' },
    { name: 'VS Defesa Impecável', condition: '5 jogos sem sofrer gols' },
  ],
  trophies: [
    {
      rarity: 'Raro',
      name: 'Veteranos',
      criterion: '20 amistosos oficiais',
      unlocks: 'Título Veteranos',
      done: 0,
      goal: 20,
    },
    {
      rarity: 'Lendário',
      name: 'Dinastia',
      criterion: '2 copas oficiais conquistadas',
      unlocks: 'Moldura Dinastia',
      done: 0,
      goal: 2,
    },
    {
      rarity: 'Épico',
      name: 'Defesa Impecável',
      criterion: '5 partidas oficiais sem sofrer gols',
      unlocks: 'VS Defesa Impecável',
      done: 0,
      goal: 5,
    },
    {
      rarity: 'Épico',
      name: 'Imparáveis',
      criterion: '10 vitórias oficiais consecutivas',
      unlocks: 'Celebração Imparáveis',
      done: 0,
      goal: 10,
    },
    {
      rarity: 'Lendário',
      name: 'Clube Histórico',
      criterion: 'Alcance o nível 50',
      unlocks: 'Entrada Lendária',
      done: 1,
      goal: 50,
    },
  ],
};

club.crestSrc = crestArt(2);
const starredCrest = club.crestSrc.replace('.png', '-star.png');
club.coach = { name: 'Treinador 01', avatarSrc: '/assets/demo/citizen-0.png' };
club.lineup.forEach((member, index) => {
  member.avatarSrc = avatarArt(index);
  member.status = member.slot === 'RES' ? 'No banco' : 'Esperando';
});
club.uniforms.forEach((uniform, index) => {
  uniform.filled = true;
  uniform.art = itemArt('Uniforme', index);
});
club.history.rows[0].opponent = 'Clube Beta';
club.history.rows[1].opponent = 'Clube Gama';
club.history.rows[1].score = [2, 1];
club.history.rows[2].opponent = 'Clube Delta';
club.history.rows[2].score = [0, 3];
club.history.rows[2].duration = '8 min';
club.missions.items.forEach((mission, index) => {
  mission.done = [1, 0, 1, 1, 0, 0][index];
});
club.trophies.forEach((trophy, index) => {
  trophy.done = [20, 1, 3, 4, club.level][index];
});
club.trail.forEach((reward, index) => {
  reward.art = index === 0 ? starredCrest : itemArt(reward.type, index);
});
club.special.forEach((reward, index) => {
  reward.type = ['Comemoração', 'Entrada', 'Entrada', 'Entrada', 'Moldura', 'Título', 'Moldura', 'Apresentação VS'][
    index
  ];
  reward.art = itemArt(reward.type, index);
  reward.owned = index === 5;
});
club.customization = {
  type: 'Título do clube',
  equipped: 'identidade',
  items: [
    { id: 'nenhum', name: 'Nenhum', description: 'Sem recompensa do clube equipada.' },
    {
      id: 'identidade',
      name: 'Identidade do Clube',
      description: 'Uma estrela junto ao escudo do clube.',
      art: starredCrest,
    },
    {
      id: 'veteranos',
      name: 'Título Veteranos',
      description: 'Recompensa por 20 amistosos oficiais.',
      art: itemArt('Título', 2),
    },
  ],
};

Object.assign(club.history, {
  matches: 8,
  wins: 5,
  draws: 1,
  losses: 2,
  goalsFor: 17,
  goalsAgainst: 9,
  winRate: 62,
  unbeaten: 0,
});
club.history.insights[0].note = '2 vitórias em 4 jogos';
club.history.insights[1].note = '3 derrotas em 5 jogos';
club.history.insights[2] = { label: 'Maior goleada', value: '5 × 1', note: 'Clube Delta' };

club.presentation = {
  type: 'Apresentação VS',
  equipped: 'apresentacao',
  items: [
    { id: 'nenhum', name: 'Nenhum', description: 'Sem apresentação equipada.' },
    {
      id: 'apresentacao',
      name: 'Apresentação VS',
      description: 'A apresentação do clube antes da partida.',
      art: itemArt('Apresentação VS', 1),
    },
  ],
};
club.uniforms.forEach((uniform, index) => {
  uniform.colors = ['Verde e branco', 'Azul e branco', 'Amarelo e branco', 'Vermelho e branco', 'Roxo e branco'][index];
});
