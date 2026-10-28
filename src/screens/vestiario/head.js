// The one heading pattern every Vestiário sub-tab shares: the slot type, then what is equipped in it.
export const slotHead = (type, value) => `
  <div class="vestiario__head">
    <p class="equip__type">${type}</p>
    <h2 class="equip__name"><span class="rbg-visually-hidden">${type}: </span>${value}</h2>
  </div>`;
