import { artImage } from '../art.js';
import { shop } from '../../data/shop.js';
import { itemSheets } from '../item-sheet.js';

const all = [...shop.featured, ...shop.daily];
const rarity = (r) => r.charAt(0).toUpperCase() + r.slice(1);

// Featured and daily items share one markup; the section sets the size.
const product = (i) => `
  <li>
    <button type="button" class="loja__item" data-item="${i.id}">
      <span class="rbg-slot loja__art rbg-product-art" data-slot="item" data-rarity="${i.rarity ?? ''}" data-alt="${i.name}">${artImage(i.art, i.name)}</span>
      <span class="loja__name">${i.name}</span>
      <span class="loja__price">${i.price.brl}</span>
      <span class="loja__meta">${i.rarity ? `<span>${rarity(i.rarity)}</span>` : ''}<span>${i.category}</span></span>
    </button>
  </li>`;

export default {
  id: 'itens',
  tab: 'loja',
  label: 'Loja de itens',
  states: ['default'],
  render: () => `
    <header class="loja__head">
      <h2 class="loja__title">${shop.title}</h2>
      <p class="loja__note">${shop.refresh}</p>
    </header>
    <section class="loja__section" aria-labelledby="loja-destaques">
      <div class="loja__section-head">
        <h3 id="loja-destaques" class="loja__section-title">Destaques</h3>
        <p class="loja__note">${shop.pinned}</p>
      </div>
      <ul class="loja__grid loja__grid--featured">${shop.featured.map(product).join('')}</ul>
    </section>
    <section class="loja__section" aria-labelledby="loja-dia">
      <h3 id="loja-dia" class="loja__section-title">Itens do dia</h3>
      <ul class="loja__grid loja__grid--daily">${shop.daily.map(product).join('')}</ul>
    </section>
    <div class="loja__codes">
      <section class="loja__code" aria-labelledby="loja-pagou">
        <h3 id="loja-pagou" class="loja__section-title">Já pagou?</h3>
        <label class="loja__label" for="loja-codigo">Código do item</label>
        <div class="loja__row">
          <input class="rbg-input" id="loja-codigo" type="text" autocomplete="off" placeholder="ex.: ${shop.redeem.example}" />
          <button type="button" class="rbg-link" data-pending="Resgatar">Resgatar</button>
        </div>
      </section>
      <section class="loja__code" aria-labelledby="loja-presente">
        <h3 id="loja-presente" class="loja__section-title">Entregar presente</h3>
        <label class="loja__label" for="loja-quem">Nome de quem ganha</label>
        <input class="rbg-input" id="loja-quem" type="text" autocomplete="off" />
        <label class="loja__label" for="loja-presente-codigo">Código do presente</label>
        <input class="rbg-input" id="loja-presente-codigo" type="text" autocomplete="off" />
        <button type="button" class="rbg-link loja__submit" data-pending="Entregar">Entregar</button>
      </section>
    </div>`,
  enter: (view, panel) => itemSheets(view, panel, (id) => all.find((i) => i.id === id)),
};
