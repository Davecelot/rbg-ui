import { itemArt } from './art.js';
// The player's Vestiário, from docs/screen-inventory.md §3 (#04–#09, #38, C08, C09). Mutated in memory by the screens.
export const locker = {
  numbers: Array.from({ length: 20 }, (_, i) => i + 1),
  boots: {
    model: 'A do hotel',
    color: 'branco',
    colors: [
      { id: 'branco', name: 'Branco' },
      { id: 'preto', name: 'Preto' },
      { id: 'azul', name: 'Azul' },
      { id: 'verde', name: 'Verde' },
      { id: 'vermelho', name: 'Vermelho' },
    ],
  },
  poses: {
    type: 'Pose de MVP',
    equipped: 'mvp-no-podio',
    items: [
      { id: 'nenhum', name: 'Nenhum', description: 'Sem pose de mvp equipado.' },
      {
        id: 'mvp-no-podio',
        name: 'MVP no Pódio',
        rarity: 'Rara',
        description: 'A sua tela no fim da partida, para todos, quando você é o MVP.',
      },
    ],
  },
  celebrations: {
    type: 'Comemoração',
    equipped: 'hang-loose',
    goalMode: 'individual',
    goalModes: [
      { id: 'individual', name: 'Minha comemoração individual' },
      { id: 'coletiva', name: 'Celebração Coletiva do clube' },
    ],
    items: [
      // "Sem comemoração equipada." follows the inventory's pattern for an empty slot ("Sem pose de mvp equipado.").
      { id: 'nenhum', name: 'Nenhum', description: 'Sem comemoração equipada.' },
      {
        id: 'hang-loose',
        name: 'Hang loose',
        rarity: 'Rara',
        description: 'Toca em tela cheia, para todos, quando você marca um gol.',
      },
    ],
  },
};

for (const [group, names] of [
  [locker.poses, ['MVP Capitão', 'MVP Artilheiro', 'MVP da Rodada']],
  [locker.celebrations, ['Na Torcida', 'Passo do Craque', 'Volta Olímpica']],
]) {
  for (const [index, name] of names.entries())
    group.items.push({
      id: `exemplo-${group === locker.poses ? 'pose' : 'gol'}-${index}`,
      name,
      rarity: index === 2 ? 'Lendária' : 'Épica',
      description:
        group === locker.poses ? 'Sua pose ao terminar a partida como MVP.' : 'Sua comemoração ao marcar um gol.',
    });
  group.items.forEach((item, index) => {
    if (item.id !== 'nenhum') item.art = itemArt(group.type, index);
  });
}
