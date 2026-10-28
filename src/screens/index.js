import perfilOverview from './perfil/perfil-overview.js';
import historicoPartidas from './perfil/historico-partidas.js';
import partidasTime from './perfil/partidas-time.js';
import rankingJogadores from './ranking/jogadores.js';
import rankingTimes from './ranking/times.js';
import vestiarioEquipamento from './vestiario/equipamento.js';
import vestiarioNumero from './vestiario/numero.js';
import vestiarioChuteira from './vestiario/chuteira.js';
import vestiarioPose from './vestiario/pose-mvp.js';
import vestiarioComemoracao from './vestiario/comemoracao.js';
import jogarModo from './jogar/modo.js';
import timeElenco from './meu-time/elenco.js';
import timeIdentidade from './meu-time/identidade.js';
import timePersonalizar from './meu-time/personalizar.js';
import timeHistorico from './meu-time/historico.js';
import timeMissoes from './meu-time/missoes.js';
import timeConquistas from './meu-time/conquistas.js';
import rcsVisao from './rcs-week/visao-geral.js';
import rcsInscricoes from './rcs-week/inscricoes.js';
import rcsJogos from './rcs-week/jogos.js';
import rcsTops from './rcs-week/tops.js';
import rcsTutorial from './rcs-week/tutorial.js';
import rcsFila from './rcs-week/fila.js';
import passeProgresso from './passe/meu-progresso.js';
import lojaItens from './loja/itens.js';

export const tabs = [
  {
    id: 'perfil',
    label: 'Perfil',
    subs: [perfilOverview, historicoPartidas, partidasTime],
  },
  {
    id: 'vestiario',
    label: 'Vestiário',
    showSubtabs: false,
    subs: [vestiarioEquipamento, vestiarioNumero, vestiarioChuteira, vestiarioPose, vestiarioComemoracao],
  },
  {
    id: 'meu-time',
    label: 'Meu Time',
    subs: [timeElenco, timeIdentidade, timePersonalizar, timeHistorico, timeMissoes, timeConquistas],
  },
  {
    id: 'jogar',
    label: 'Jogar',
    subs: [jogarModo],
  },
  {
    id: 'ranking',
    label: 'Ranking',
    subs: [rankingJogadores, rankingTimes],
  },
  {
    id: 'rcs-week',
    label: 'RCS Week',
    subs: [rcsVisao, rcsInscricoes, rcsJogos, rcsTops, rcsTutorial, rcsFila],
  },
  {
    id: 'passe',
    label: 'Passe de Batalha',
    badge: 'Novo',
    subs: [passeProgresso],
  },
  {
    id: 'loja',
    label: 'Loja',
    badge: 'Novo',
    subs: [lojaItens],
  },
];
