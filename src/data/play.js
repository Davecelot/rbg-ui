// Jogar, from docs/screen-inventory.md §5 (#21–#25, C10). Owner answers: 4v4, codes GK/DEF/MID/ATK.
export const play = {
  modes: [
    { id: 'solo', name: 'Ranqueada Solo', format: 'Futebol 4x4, individual', note: '0 jogadores buscando' },
    {
      id: 'amistosos',
      name: 'Amistosos',
      format: 'Futebol 4x4, times e convidados',
      note: 'Escalação com aceite obrigatório dos 8 jogadores',
    },
  ],
  queue: {
    inBand: 5,
    size: 8,
    searching: 24,
    formedLast10: 3,
    teamsSearching: 6,
    teamsPlaying: 4,
    primary: 'ATK',
    secondary: 'GK',
    primaryOptions: ['GK', 'DEF', 'MID', 'ATK', 'AUTO'],
    secondaryOptions: ['GK', 'DEF', 'MID', 'ATK'],
  },
  friendly: {
    confirmed: 3,
    lineupSize: 4,
    searching: 2,
    members: [
      { name: 'Jogador 01', online: true },
      { name: 'Jogador 02', online: true },
      { name: 'Jogador 03', online: true },
      { name: 'Jogador 04', online: false },
      { name: 'Jogador 05', online: true },
    ],
    slots: [
      { code: 'GK', name: 'Jogador 01', confirmed: true },
      { code: 'DEF', name: 'Jogador 03', confirmed: true },
      { code: 'MID', name: 'Jogador 05', confirmed: false },
      { code: 'ATK', name: 'Jogador 02', confirmed: true },
    ],
  },
};
