import { itemArt } from './art.js';
// The battle pass, from docs/screen-inventory.md §8, §8.1 and §8.2 (#29–#33, C7, C24). Uncaptured levels use example rewards; see docs/demo-content.md.
const reward = (level, name, category, extra = {}) => ({
  id: `passe-${level}`,
  level,
  name,
  category,
  unlock: { source: 'pass', level },
  ...extra,
});

export const pass = {
  season: 'Temporada 1',
  endsIn: 'termina em 45 dias',
  endsOn: '10/12/2026',
  ribbon: 'Lançamento',
  level: 7,
  xp: 455,
  xpNext: 860,
  notice:
    'As recompensas liberam com o Passe de Batalha da temporada, e ele dá 5 níveis na hora. As marcadas como grátis são de todos.',
  next: { name: 'Moldura Azul', level: 8 },
  nextEpic: { name: 'MVP Super-herói', level: 15 },
  track: [
    reward(6, 'Banner Estádio', 'Banner'),
    reward(7, 'MVP no Pódio', 'Pose de MVP', { free: true, claimed: true }),
    reward(8, 'Moldura Azul', 'Moldura', { rarity: 'comum', next: true, previewCaption: 'Assim fica no seu perfil.' }),
    reward(9, 'Camisa', 'Comemoração'),
    reward(10, 'Banner Holográfico', 'Banner', { free: true }),
    reward(11, 'Card Ouro', 'Card'),
    reward(12, 'Moldura Prata', 'Moldura'),
    reward(13, 'Meditação', 'Comemoração'),
    reward(14, 'Banner Noite', 'Banner'),
    reward(15, 'MVP Super-herói', 'Pose de MVP', { rarity: 'épica' }),
    reward(40, 'Neymar', 'Comemoração'),
    reward(41, 'Moldura Cósmica', 'Moldura'),
    reward(42, 'Banner Hiperespaço', 'Banner'),
    reward(43, 'MVP no Trono', 'Pose de MVP'),
    reward(44, 'CR7', 'Comemoração'),
    reward(45, 'Moldura Dragão', 'Moldura'),
    reward(46, 'Banner Galáxia', 'Banner'),
    reward(47, 'Card Lenda', 'Card'),
    reward(48, 'Moldura Lendária', 'Moldura'),
    reward(49, 'Banner Lenda', 'Banner'),
    reward(50, 'MVP do Dragão', 'Pose de MVP'),
  ],
  levels: 50,
  missions: [
    {
      id: 'diarias',
      title: 'Missões diárias',
      items: [
        { name: 'Jogue 3 partidas', xp: 100, done: 1, goal: 1 },
        { name: 'Vença 2 partidas', xp: 150, done: 1, goal: 2 },
        { name: 'Tire nota 7 ou mais 2 vezes', xp: 100, done: 1, goal: 2 },
        { name: 'Vença 1 partida', xp: 150, done: 1, goal: 1 },
        { name: 'Faça 2 gols', xp: 120, done: 0, goal: 2 },
        { name: 'Dê 2 assistências', xp: 120, done: 0, goal: 2 },
        { name: 'Faça 5 desarmes', xp: 120, done: 1, goal: 1 },
        { name: 'Faça 4 defesas', xp: 120, done: 1, goal: 1 },
        { name: 'Jogue 1 partida em autofill ou AUTO', xp: 250, done: 0, goal: 1 },
      ],
    },
    {
      id: 'semanais',
      title: 'Missões semanais',
      items: [
        { name: 'Jogue 15 partidas', xp: 400, done: 3, goal: 15 },
        { name: 'Vença 8 partidas', xp: 500, done: 1, goal: 8 },
        { name: 'Vença 3 partidas seguidas', tag: 'Seguidas', xp: 400, done: 0, goal: 3 },
        { name: 'Seja MVP 2 vezes', xp: 400, done: 0, goal: 2 },
        { name: 'Faça 8 gols', xp: 400 },
        { name: 'Dê 6 assistências', xp: 400 },
        { name: 'Jogue 3 partidas sem sofrer gol', cut: true, xp: 400 },
        { name: 'Faça 40 desarmes', xp: 400 },
        { name: 'Jogue 5 partidas em autofill ou AUTO', xp: 800, done: 0, goal: 5 },
      ],
    },
    {
      id: 'temporada',
      title: 'Missões da temporada',
      items: [
        { name: 'Jogue 100 partidas', xp: 2000, done: 19, goal: 100 },
        { name: 'Vença 60 partidas', xp: 2000, done: 7, goal: 60 },
      ],
    },
  ],
  buy: {
    perk: 'Ganhe 5 níveis na hora.',
    linkHelp: 'Se o botão não abrir, copie o link e abra no navegador.',
    codeExample: 'PASS-CODE',
  },
};

const categories = ['Banner', 'Comemoração', 'Card', 'Moldura', 'Pose de MVP'];
const themes = ['Arquibancada', 'Linha de fundo', 'Clássico', 'Matchday', 'Prorrogação', 'Camisa 10'];
for (let level = 1; level <= pass.levels; level++) {
  if (!pass.track.some((reward) => reward.level === level)) {
    const category = categories[(level - 1) % categories.length];
    pass.track.push(
      reward(level, `${category} ${themes[Math.floor(level / 5) % themes.length]}`, category, {
        free: level % 5 === 0,
        claimed: level < pass.level && level % 5 === 0,
        rarity: level % 10 === 0 ? 'épica' : 'comum',
      }),
    );
  }
}
pass.track.sort((a, b) => a.level - b.level);
pass.track.forEach((reward) => {
  reward.art = itemArt(reward.category, reward.name === 'Moldura Azul' ? 1 : reward.level);
  reward.preview = reward.art;
});
for (const group of pass.missions)
  for (const mission of group.items) {
    if (mission.goal === undefined) {
      mission.goal = Number(mission.name.match(/\d+/)?.[0] ?? 1);
      mission.done = Math.floor(mission.goal / 3);
    }
    delete mission.cut;
  }
pass.missions[0].items[0].goal = 3;
pass.missions[0].items[0].done = 3;
