import { itemArt } from './art.js';

const item = (id, name, type, description, rarity, profilePreview, artIndex = 0) => ({
  id,
  name,
  type,
  description,
  ...(rarity ? { rarity } : {}),
  ...(profilePreview ? { profilePreview } : {}),
  ...(id !== 'nenhum' ? { art: itemArt(type, artIndex) } : {}),
});

export const profileCustomization = {
  card: {
    type: 'Card',
    equipped: 'card-prata',
    items: [
      item('nenhum', 'Nenhum', 'Card', 'Sem card equipado.'),
      item(
        'card-prata',
        'Card Prata',
        'Card',
        'Aparece no placar, para todos, quando você marca um gol, e no seu perfil.',
        'Rara',
        'card',
      ),
      item(
        'card-ouro',
        'Card Ouro',
        'Card',
        'Aparece no placar, para todos, quando você marca um gol, e no seu perfil.',
        undefined,
        'card',
        7,
      ),
      item(
        'card-lenda',
        'Card Lenda',
        'Card',
        'Aparece no placar, para todos, quando você marca um gol, e no seu perfil.',
        undefined,
        'card',
        6,
      ),
    ],
  },
  banner: {
    type: 'Banner',
    equipped: 'banner-gramado',
    items: [
      item('nenhum', 'Nenhum', 'Banner', 'Sem banner equipado.'),
      item('banner-gramado', 'Banner Gramado', 'Banner', 'O fundo do seu perfil, para quem abre.', 'Comum', 'banner'),
      item(
        'banner-estadio',
        'Banner Estádio',
        'Banner',
        'O fundo do seu perfil, para quem abre.',
        undefined,
        'banner',
        2,
      ),
      item('banner-noite', 'Banner Noite', 'Banner', 'O fundo do seu perfil, para quem abre.', undefined, 'banner', 7),
    ],
  },
  moldura: {
    type: 'Moldura',
    equipped: 'nenhum',
    items: [item('nenhum', 'Nenhum', 'Moldura', 'Sem moldura: o perfil fica como antes.')],
    empty: 'Você ainda não tem nenhum item deste tipo. Libere na trilha do Passe de Batalha.',
  },
};
