import { itemArt } from './art.js';
// The shop, from docs/screen-inventory.md §9 and §9.1 (#34, #35, C6, C22). Items are injected by the game; EUR and USD were captured for two items only.
const item = (id, name, category, rarity, brl, extra = {}) => ({
  id: `loja-${id}`,
  name,
  category,
  art: extra.art ?? itemArt(category, id.length),
  preview: extra.art ?? itemArt(category, id.length),
  rarity,
  state: 'for-sale',
  price: { brl, ...extra.price },
  previewCaption: extra.previewCaption,
});

export const shop = {
  title: 'Loja de itens',
  refresh: 'Itens novos todo dia às 21h.',
  pinned: 'Vitrine fixada, vira em 19 h 47 min',
  featured: [
    item('escuta-aqui', 'Escuta Aqui', 'Comemoração', 'lendária', 'R$ 5,49', {
      art: itemArt('Comemoração', 0),
      price: { eur: '€ 3,99', usd: 'US$ 3.99' },
    }),
    item('67', '67', 'Comemoração', 'lendária', 'R$ 5,49', { art: '/assets/items/comemoracao-67.png' }),
  ],
  daily: [
    item('mvp-cinturao', 'MVP do Cinturão', 'Pose de MVP', 'épica', 'R$ 4,49'),
    item('mvp-meteoro', 'MVP Meteoro', 'Pose de MVP', 'lendária', 'R$ 5,49'),
    item('banner-chuva-de-ouro', 'Banner Chuva de ouro', 'Banner', 'lendária', 'R$ 3,49'),
    item('banner-vulcao', 'Banner Vulcão', 'Banner', 'rara', 'R$ 1,99', {
      price: { eur: '€ 1,49', usd: 'US$ 1.49' },
      previewCaption: 'Assim fica o topo do seu perfil.',
    }),
    item('card-vulcanico', 'Card Vulcânico', 'Card', 'épica', 'R$ 3,49'),
    item('moldura-vulcao', 'Moldura Vulcão', 'Moldura', 'épica', 'R$ 2,49'),
  ],
  redeem: { example: 'ITEM-CODE' },
};
