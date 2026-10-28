import { itemArt } from './art.js';

const item = (id, name, type, description, rarity, profilePreview) => ({
  id,
  name,
  type,
  description,
  ...(rarity ? { rarity } : {}),
  ...(profilePreview ? { profilePreview } : {}),
  ...(id !== 'nenhum' ? { art: itemArt(type, type === 'Card' ? 0 : type === 'Banner' ? 0 : 1) } : {}),
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
    ],
  },
  banner: {
    type: 'Banner',
    equipped: 'banner-gramado',
    items: [
      item('nenhum', 'Nenhum', 'Banner', 'Sem banner equipado.'),
      item('banner-gramado', 'Banner Gramado', 'Banner', 'O fundo do seu perfil, para quem abre.', 'Comum', 'banner'),
    ],
  },
  moldura: {
    type: 'Moldura',
    equipped: 'nenhum',
    items: [item('nenhum', 'Nenhum', 'Moldura', 'Sem moldura: o perfil fica como antes.')],
    empty: 'Você ainda não tem nenhum item deste tipo. Libere na trilha do Passe de Batalha.',
  },
};
