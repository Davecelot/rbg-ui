import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/screens/perfil.css';
import './styles/screens/ranking.css';
import './styles/screens/vestiario.css';
import './styles/screens/jogar.css';
import './styles/screens/meu-time.css';
import './styles/screens/rcs-week.css';
import './styles/screens/passe.css';
import './styles/screens/loja.css';
import { mountPanel } from './src/panel.js';
import { modes } from './src/data/modes.js';
import { defaultSize, sizes } from './src/data/sizes.js';
import { tabs } from './src/screens/index.js';

mountPanel(document.getElementById('rbg'), {
  tabs,
  modes,
  sizes,
  defaultSize,
  launcher: document.querySelector('[data-host-launcher]'),
});
