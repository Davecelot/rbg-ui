import { locker } from '../../data/locker.js';
import { previewStage } from '../avatar.js';
import { bindEquipPicker, equipPicker } from '../equip-picker.js';
import { returnToLocker } from './back.js';

export default {
  id: 'pose-mvp',
  tab: 'vestiario',
  label: 'Pose de MVP',
  states: ['default'],
  render: () => `
    <div class="vestiario">
      ${previewStage(locker.poses.items.find((i) => i.id === locker.poses.equipped))}
      <div class="vestiario__panel">
        ${returnToLocker('pose-mvp')}
        <h2 class="rbg-visually-hidden">Pose de MVP</h2>
        ${equipPicker(locker.poses, 'pose', true)}
      </div>
    </div>`,
  enter: (view, panel) => bindEquipPicker(view, locker.poses, panel),
};
