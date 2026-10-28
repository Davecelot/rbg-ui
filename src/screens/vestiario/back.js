import { icon } from '../icons.js';

export const returnToLocker = (slot) =>
  `<button type="button" class="rbg-link rbg-back" data-sub-back data-go="vestiario" data-go-sub="vestiario-overview" data-go-focus="#vestiario-slot-${slot}">${icon('chevronLeft', 16)}Vestiário</button>`;
