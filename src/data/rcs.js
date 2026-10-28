import { clubRanking, playerRanking } from './ranking.js';
import { club } from './club.js';
// RCS Week, from docs/screen-inventory.md §5.4, §7 and §7.1 (#25, #28, C1–C5, C20, C21). The active edition below is a fictional demo; see docs/demo-content.md.
export const rcs = {
  edition: { name: 'RCS Week 1', label: 'Edição #1', status: 'Inscrições' },
  leader: { name: 'A definir', note: 'O título depende de todos os confrontos e homologação.' },
  scoring: 'Vitória: 3 pontos, empate: 1 ponto. Os resultados oficiais atualizam a tabela.',
  standings: [],
  hallOfFame: [],
  confrontations: { done: 0, total: 0, pending: 0 },
  enrolment: {
    notice: 'Inscrições abertas pela administração, fora do calendário. O encerramento será manual.',
    clubs: 3,
  },
  matches: {
    official: [],
    officialEmpty: 'Nenhuma partida criada nesta edição. Os confrontos são encontrados automaticamente na fila.',
    pending: [],
    pendingEmpty: 'Nenhum confronto pendente definido. Aguarde a confirmação dos participantes ou da próxima fase.',
  },
  tops: { pending: 'Aguardando divulgação dos TOPs da edição.' },
  // Step 02 names the positions in the owner's codes (GK/DEF/MID/ATK) instead of the app's GOL/ZAG/MEI/ATA.
  steps: [
    { title: 'Inscreva seu clube', text: 'Durante a semana, o responsável confirma a participação.' },
    {
      title: 'Monte o time e entre na fila',
      text: 'Na janela competitiva, escale GK, DEF, MID e ATK. O sistema encontra o rival.',
    },
    { title: 'Acompanhe a disputa', text: 'Veja os pontos, os resultados e quem falta enfrentar.' },
  ],
  schedule: { days: 'Sábado, domingo e segunda', hours: '19:00 às 23:00' },
  queueGate: 'Seu clube precisa estar inscrito e aprovado na RCS Week para jogar.',
};

const clubs = clubRanking.rows;
const results = [
  [0, 1, 3, 1],
  [2, 3, 2, 0],
  [4, 0, 1, 2],
  [1, 2, 1, 1],
  [3, 4, 0, 2],
  [0, 2, 2, 2],
];
rcs.edition = { name: 'RCS Week 3', label: 'Edição #3', status: 'Em andamento' };
rcs.enrolment.clubs = clubs.length;
rcs.enrolment.notice = 'Inscrições encerradas. Os cinco clubes estão aprovados para esta edição.';
rcs.registrations = clubs.map((team) => ({ ...team, status: 'Aprovado' }));
rcs.matches.official = results.map(([home, away, homeGoals, awayGoals], index) => ({
  home: clubs[home],
  away: clubs[away],
  score: [homeGoals, awayGoals],
  when: `há ${index + 1} h`,
}));
rcs.matches.pending = [
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 4],
].map(([home, away]) => ({
  home: clubs[home],
  away: clubs[away],
  when: 'Próxima janela, 19:00',
}));
rcs.standings = clubs.map((team) => ({
  ...team,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  points: 0,
  form: [],
}));
for (const match of rcs.matches.official) {
  for (const [team, forGoals, againstGoals] of [
    [match.home, ...match.score],
    [match.away, match.score[1], match.score[0]],
  ]) {
    const row = rcs.standings.find((row) => row.name === team.name);
    row.played++;
    row.goalsFor += forGoals;
    row.goalsAgainst += againstGoals;
    const result = forGoals > againstGoals ? 'wins' : forGoals === againstGoals ? 'draws' : 'losses';
    row[result]++;
    row.points += result === 'wins' ? 3 : result === 'draws' ? 1 : 0;
    row.form.unshift(result === 'wins' ? 'V' : result === 'draws' ? 'E' : 'D');
  }
}
rcs.standings.sort(
  (a, b) =>
    b.points - a.points || b.goalsFor - b.goalsAgainst - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor,
);
rcs.leader.name = rcs.standings[0].name;
rcs.confrontations = {
  done: rcs.matches.official.length,
  pending: rcs.matches.pending.length,
  total: results.length + rcs.matches.pending.length,
};
rcs.previous = [
  { label: 'Edição #2', champion: 'Clube Beta', clubIndex: 1 },
  { label: 'Edição #1', champion: 'Clube Gama', clubIndex: 0 },
];
rcs.hallOfFame = [
  { ...clubs[0], titles: 1, appearances: 2, wins: 5 },
  { ...clubs[1], titles: 1, appearances: 2, wins: 4 },
  { ...clubs[2], titles: 0, appearances: 2, wins: 3 },
];
const scorers = ['Atleta10', 'Atleta11', 'Jogador 01', 'Atleta12', 'Atleta13'].map((name, index) => ({
  name,
  headSrc: playerRanking.rows.find((row) => row.name === name).headSrc,
  club: clubs[index].name,
  goals: 0,
  assists: 0,
  mvps: 0,
}));
for (const [home, away, homeGoals, awayGoals] of results) {
  scorers[home].goals += homeGoals;
  scorers[away].goals += awayGoals;
  scorers[home].assists += Math.max(0, homeGoals - 1);
  scorers[away].assists += Math.max(0, awayGoals - 1);
  scorers[homeGoals >= awayGoals ? home : away].mvps++;
}
rcs.tops.rows = scorers;
rcs.lineup = club.lineup.filter((member) => member.slot !== 'RES');
