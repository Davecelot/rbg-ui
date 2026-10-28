export const avatarArt = (index = 0) => `/assets/avatars/player-${index % 8}-front.png`;
export const headArt = (index = 0) => `/assets/avatars/head-${index % 8}.png`;
export const crestArt = (index = 0) => `/assets/clubs/club-${index % 5}.png`;

export function itemArt(category = '', index = 0) {
  const kind =
    {
      Banner: 'banner',
      Moldura: 'moldura',
      Card: 'card',
      'Pose de MVP': 'pose',
      Comemoração: 'comemoracao',
      Entrada: 'entrada',
      Título: 'titulo',
      'Apresentação VS': 'vs',
      Chuteira: 'chuteira',
      Uniforme: 'uniforme',
    }[category] ?? 'comemoracao';
  return `/assets/items/${kind}-${index % 8}.png`;
}
