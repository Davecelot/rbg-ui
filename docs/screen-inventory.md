# RBG screen inventory (source of truth)

This file lists every feature, data field and action that appears in the current RBG hub UI (the wordmark reads `REBUG`). It is based on 38 screenshots in `reference/current-app/NN-HMMSS.png`. Screenshot numbers are cited as `#NN`.

Rules for the redesign:

- You may restructure, merge, reorder or restyle anything here.
- **Do not invent** features, currencies, rewards, numbers, names, tiers or copy that this file does not list.
- If a design needs something that is not listed, show a visible placeholder (for example `[TBD: ...]`) and add a question to "Open questions" for the owner.
- UI copy is Brazilian Portuguese. Strings in backticks are literal and must not be translated or "fixed" without owner approval. Typos are listed under problems.

---

## 1. Global shell

The hub is a modal panel over the host pixel hotel. The hotel chat and toolbar stay visible behind it on every screenshot.

### Header

| Element  | Details                                                                                                                                                                                                                                                                                                                          |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wordmark | `REBUG` in the top-left. The `R` is orange and the rest is cream.                                                                                                                                                                                                                                                                |
| Settings | Gear icon button in the top-right. Opens a popover `RESOLUÇÃO DA JANELA` with three options: `1024 × 576`, `1280 × 720` (selected by default), `1600 × 900` — an option that doesn't fit shows `(não cabe na tela: diminui até caber)`. Source: owner screenshot shared in chat, date omitted (not in `reference/current-app/`). |
| Close    | `×` button in the top-right.                                                                                                                                                                                                                                                                                                     |

### Main tabs (in order)

Each tab has an icon and an uppercase label. The active tab is a filled orange pill.

| #   | Label              | Icon         | Badge                                             | Suggested id |
| --- | ------------------ | ------------ | ------------------------------------------------- | ------------ |
| 1   | `PERFIL`           | person       | none                                              | `perfil`     |
| 2   | `VESTIÁRIO`        | house/locker | none                                              | `vestiario`  |
| 3   | `MEU TIME`         | two people   | none                                              | `meu-time`   |
| 4   | `JOGAR`            | soccer ball  | none                                              | `jogar`      |
| 5   | `RANKING`          | bar chart    | none                                              | `ranking`    |
| 6   | `RCS WEEK`         | trophy       | none                                              | `rcs-week`   |
| 7   | `PASSE DE BATALHA` | star         | `NOVO` (yellow chip; dark when the tab is active) | `passe`      |
| 8   | `LOJA`             | storefront   | `NOVO` (yellow text; dark chip when active)       | `loja`       |

### Announcement banner

- Content: chip `NOVO` · `Chegou o Passe de Batalha` · `Temporada 1` · `termina em 45 dias` · link `Ver o Passe →`
- Seen at the top of Meu Time (#10), Jogar (#21, #22, #24, #25), Ranking (#26, #27), RCS Week (#28) and Loja (#34).
- Not seen on Perfil (#01) or Passe de Batalha (#29). Vestiário screenshots are scrolled past the top, so it is unknown there.
- Action: `Ver o Passe →` presumably opens the Passe tab.

### Persistent bottom action bar

It always shows a small uppercase context label, a bold title on the left and one large CTA on the right. On Jogar's picker, the player selects a mode before `Confirmar`; outside Jogar, the default `Jogar` CTA is only a shortcut to the unselected picker. The RCS Week `Fila` view keeps its own queue action.

| Context label          | Title                            | CTA                  | State                                          | Where seen                                                  |
| ---------------------- | -------------------------------- | -------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `RANQUEADA`            | `Escolha o modo de jogo`         | `JOGAR`              | enabled                                        | #01–#20 (Perfil, Vestiário, Meu Time)                       |
| `MODO ESCOLHIDO`       | `Ranqueada Solo` or `Amistosos`  | `CONFIRMAR`          | enabled                                        | #21 (Jogar mode picker; only after a player choice)         |
| `BUSCANDO NO HOTEL`    | `0 jogadores`                    | `ENCONTRAR PARTIDA`  | enabled; includes position pickers (see Jogar) | #22, #23                                                    |
| `ESCALAÇÃO`            | `6s para ir ao campo`            | `VER ESCALAÇÃO`      | enabled; focuses the lineup                    | owner captures, match found                                 |
| `PARTIDA EM ANDAMENTO` | `Jogando no campo`               | `VER PARTIDA`        | enabled; host handoff placeholder              | owner captures, redirecting to match                        |
| `AMISTOSOS`            | `Clube Alfa · monte a escalação` | `CRIAR AMISTOSO`     | disabled (greyed)                              | #24                                                         |
| `RCS WEEK 1`           | `Inscreva seu clube na edição`   | `ENTRAR NA FILA RCS` | disabled                                       | RCS Week › Fila (locked)                                    |
| `RCS WEEK 1`           | `Inscreva seu clube na edição`   | `VER ESCALAÇÃO`      | enabled                                        | #26–#38 (Ranking, RCS Week, Passe, Loja, Perfil, Vestiário) |

---

## 2. Perfil (`perfil`)

Sub-tabs: `PERFIL` (`perfil-overview`), `HISTÓRICO DE PARTIDAS` (`historico-partidas`), `PARTIDAS DE TIME` (`partidas-time`).

### 2.1 `PERFIL` — overview (#01, #36, #37)

| Screenshot(s) | Element               | Data fields (examples)                                                                                                  | Actions/controls                                                                  | States seen                       |
| ------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| #01, #36      | Ranked card           | label `RANQUEADA · SOLO`; tier badge and progress bar; ranking position                                                 | ↗ icon on Ranking (opens ranking)                                                 | example profile data              |
| #01, #36      | Battle-pass mini card | `PASSE DE BATALHA`; season, level, XP progress, and mission examples                                                    | `Ver passe e recompensas →`                                                       | mission complete (✓), in progress |
| #01, #36, #37 | Avatar stage          | status `● NO LOBBY`; username; tier subtitle rank tier; pixel avatar on a platform; positions `♂ Atacante`, `▦ Goleiro` | `↔ Girar` (rotate avatar; #37 shows the back view); `VESTIÁRIO ↗` button (#36)    | front and back avatar views       |
| #01, #36      | Profile customization | `Personalizar perfil`                                                                                                   | outlined button beside the player name; switches the Perfil view to customization | —                                 |
| #01, #36      | Player identity card  | `IDENTIDADE DO JOGADOR`; tier badge; win-rate and MVP count                                                             | —                                                                                 | —                                 |
| #01, #36      | Stats grid            | wins, losses, draws, goals, assists, and goals-per-game fields                                                          | none                                                                              | —                                 |
| #01, #36      | Next match card       | `SEU PRÓXIMO JOGO`; `Entre em campo`; club fictional club                                                               | `MODOS DE JOGO →`; `Meu time ↗` (#36)                                             | —                                 |

### 2.2 `HISTÓRICO DE PARTIDAS` (#02)

| Screenshot(s) | Element          | Data fields (examples)                                                                                                                                         | Actions/controls                                | States seen                                                        |
| ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| #02           | Match row (list) | result, reason, relative time, duration, position, goals and assists, optional own-goal note, score, fictional opponent, rank delta, and optional autofill tag | none visible (rows are not obviously clickable) | loss (red left border), win (purple left border); the list scrolls |

### 2.3 `PARTIDAS DE TIME` (#03)

| Screenshot(s) | Element         | Data fields | Actions | States seen                             |
| ------------- | --------------- | ----------- | ------- | --------------------------------------- |
| #03           | Team match list | —           | —       | empty: `Nenhuma partida de time ainda.` |

### 2.4 Personalizar perfil — owned items (C16–C19)

Files `reference/current-app/CNN-*.webp`, shared by the owner on date omitted, plus the owner captures from date omitted. The `Personalizar perfil` action replaces the Perfil view with an owned-item view and a `Voltar ao perfil` control. A radio filter switches among `Card`, `Banner`, and `Moldura`, following the Missões filter pattern; `Banner` is selected by default. Owned card, banner and frame items live here and can be equipped. The banner is the lobby/profile background (C23, answer 18).

| Shot | Section                | Content (literal)                                                                                                                                                                                                                               | Actions                                                       | States                                                                                    |
| ---- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| C16  | `CARD`                 | preview: the player's card with `GOL!`, `JOGADOR 01`, caption `Assim aparece quando você marca`; detail `CARD` `RARA` `Card Prata` — `Aparece no placar, para todos, quando você marca um gol, e no seu perfil.`; status `Card Prata equipado.` | `✓ EQUIPADO`; options `Nenhum`, `Card Prata` (tag `EQUIPADO`) | equipped                                                                                  |
| C17  | `BANNER`               | preview: banner with avatar + `Jogador 01`, caption `Assim fica o topo do seu perfil.`; detail `BANNER` `COMUM` `Banner Gramado` — `O fundo do seu perfil, para quem abre.`; `Banner Gramado equipado.`                                         | `✓ EQUIPADO`; options `Nenhum`, `Banner Gramado`              | equipped                                                                                  |
| C18  | `MOLDURA`              | preview `Sem moldura: o perfil fica como antes.`; detail `MOLDURA` `Nenhum` — `Sem moldura equipado.`                                                                                                                                           | `✓ EQUIPADO` on `Nenhum`                                      | empty: `Você ainda não tem nenhum item deste tipo. Libere na trilha do Passe de Batalha.` |
| C19  | Perfil after equipping | the profile background becomes the green pitch (`Banner Gramado`); `IDENTIDADE DO JOGADOR` shows the card (`PRATA IV`, `JOGADOR 01`, rank progress)                                                                                             | —                                                             | —                                                                                         |

Notes: C18 shows `Banner Gramado equipado.` on the Moldura tab — a status-message bug. Rarity labels here are feminine (`RARA`, `COMUM`).

Owner update (2026-11-01): restore equipped banner and card visuals in the Lobby. Confine banner artwork to the character/card field so profile content keeps a readable solid background. Add a presentation choice within the existing profile view, remembered for the viewer. Follow-up: integrate it into the artwork surface as one `Exibir card` toggle (off shows the character, on shows the card). Without an equipped card, show the character and `Equipe um card em Personalizar perfil.`. The card carries the existing player name, rank and PDL; no new stats or rewards.

---

## 3. Vestiário (`vestiario`)

The screen is captured scrolled down. The subtitle `Seu equipamento para a próxima partida.` is visible at the top, so a title above it is likely. The left column always shows the preview and the right column changes.

Views: overview (`vestiario-overview`), `Número` (`numero`), `Chuteira` (`chuteira`), `Pose de MVP` (`pose-mvp`), `Comemoração` (`comemoracao`). The overview's four equipment buttons open each detail view; every detail view has a back button `Vestiário` that returns to its matching button. There are no second-level tabs.

### 3.1 Overview (#04, #38)

| Screenshot(s) | Element                 | Data fields (examples)                                                                                             | Actions/controls                  | States seen                                               |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------- | --------------------------------------------------------- |
| #04, #38      | Preview stage           | tag `VISUAL EQUIPADO`; avatar on a pitch with a night/Halloween scene; caption; `O uniforme será o da sua equipe.` | `Girar avatar` with ↶ / ↷ buttons | —                                                         |
| #04, #38      | Slot card `NÚMERO`      | shirt number                                                                                                       | opens Número                      | —                                                         |
| #04, #38      | Slot card `CHUTEIRA`    | shoe icon; `A do hotel`                                                                                            | opens Chuteira                    | —                                                         |
| #04, #38      | Slot card `POSE DE MVP` | 👑 emoji; `Nenhum` or `MVP no Pódio`; `1 item`                                                                     | opens Pose de MVP                 | none equipped (#04), equipped with a blue underline (#38) |
| #04, #38      | Slot card `COMEMORAÇÃO` | 🎉 emoji; `Nenhum` or `Hang loose`; `1 item`                                                                       | opens Comemoração                 | none (#04), equipped (#38)                                |

### 3.2 Número (#09)

| Screenshot(s) | Element     | Data fields                                                                              | Actions/controls                                              | States seen                  |
| ------------- | ----------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------- |
| #09           | Number grid | numbers `1`–`20` (5×4)                                                                   | select a number                                               | selected (orange fill, `12`) |
| #09           | Save        | —                                                                                        | `SALVAR NÚMERO` (primary); `SALVAR ESTAMPA ATUAL` (secondary) | —                            |
| #09           | Help text   | `Para importar seu visual atual, esteja no lobby. As mudanças valem na próxima partida.` | —                                                             | —                            |

### 3.3 Chuteira (#08)

| Screenshot(s) | Element        | Data fields                                                                                                    | Actions/controls                    | States seen                                           |
| ------------- | -------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| #08           | Preview label  | `PRÉVIA DA CHUTEIRA DE FUTEBOL · 3 CAMADAS`; `Cor principal. O modelo e os detalhes da chuteira são mantidos.` | —                                   | —                                                     |
| #08           | Color chips    | `Branco`, `Preto`, `Azul`, `Verde`, `Vermelho`                                                                 | select a color                      | none selected visibly                                 |
| #08           | Actions        | —                                                                                                              | `SALVAR COR`; `USAR CHUTEIRA ATUAL` | —                                                     |
| #08           | Help and toast | help text as in Número; toast `Preferência de comemoração salva para as próximas partidas.`                    | —                                   | success toast (the wording looks wrong for this view) |

### 3.4 Pose de MVP (#05, #07)

| Screenshot(s) | Element       | Data fields                                                                                                                                                                                                     | Actions/controls                              | States seen                         |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------- |
| #05, #07      | Detail header | `POSE DE MVP` + rarity chip `RARA`; name `Nenhum` / `MVP no Pódio`; description `Sem pose de mvp equipado.` / `A sua tela no fim da partida, para todos, quando você é o MVP.`; status `MVP no Pódio equipado.` | `✓ EQUIPADO` (disabled when already equipped) | none equipped, item equipped        |
| #05, #07      | Item grid     | tiles `Nenhum` (×), `MVP no Pódio` (👑)                                                                                                                                                                         | select a tile                                 | `EQUIPADO` tag on the equipped tile |
| #07           | Preview       | the left stage switches to a podium animation preview (1/2/3 podium, spotlights)                                                                                                                                | —                                             | preview mode                        |

### 3.5 Comemoração (#06)

| Screenshot(s) | Element       | Data fields                                                                                                                                                                                                                             | Actions/controls                                                         | States seen    |
| ------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------- |
| #06           | Goal setting  | `Nos meus gols`; dropdown value `Minha comemoração individual`; help `A escolha vale para as próximas partidas. A coletiva exige a recompensa equipada no seu clube; sem ela, será usada a individual. Apenas uma comemoração por gol.` | select (individual or collective; only the individual option is visible) | —              |
| #06           | Detail header | `COMEMORAÇÃO` `RARA`; `Hang loose`; `Toca em tela cheia, para todos, quando você marca um gol.`; `Hang loose equipado.`                                                                                                                 | `✓ EQUIPADO`                                                             | equipped       |
| #06           | Item grid     | `Nenhum` tile; `Hang loose` tile (🎉)                                                                                                                                                                                                   | select                                                                   | `EQUIPADO` tag |
| #06           | Preview       | the left stage switches to an isometric pitch with the avatar doing the gesture                                                                                                                                                         | —                                                                        | preview mode   |

### 3.6 Vestiário — top and Comemoração (C08, C09)

Files `reference/current-app/CNN-*.webp`, shared by the owner on date omitted. Answers Q14 and Q6.

| Shot | Element              | Content (literal)                                                                                                                                                                                                                                                                                                                                                | Actions                         | States                          |
| ---- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------- |
| C08  | Header               | the announcement banner shows here too; title `Vestiário` (pixel/mono font) with a 🎃 seasonal emoji; subtitle `Seu equipamento para a próxima partida.`; right label `EQUIPAMENTO`                                                                                                                                                                              | —                               | seasonal (Halloween) decoration |
| C08  | Avatar stage         | tag `VISUAL EQUIPADO`; avatar on a pitch scene with goal, moon, pumpkin and ghost decorations                                                                                                                                                                                                                                                                    | rotate buttons (bottom)         | —                               |
| C08  | Equipment grid (2×2) | `NÚMERO` `#12`; `CHUTEIRA` `A do hotel` (shoe icon); a 👑 card (Pose de MVP) and a 🎉 card (Comemoração) — labels below the fold                                                                                                                                                                                                                                 | each card opens its detail view | —                               |
| C09  | Comemoração detail   | `← VESTIÁRIO`, title `Comemoração`; preview scene with pixel text `AEEE!`; field `Nos meus gols` with options `Minha comemoração individual` (selected), `Celebração Coletiva do clube`; help `A escolha vale para as próximas partidas. A coletiva exige a recompensa equipada no seu clube; sem ela, será usada a individual. Apenas uma comemoração por gol.` | dropdown                        | —                               |
| C09  | Equipped celebration | `COMEMORAÇÃO` `RARA` `Hang loose` — `Toca em tela cheia, para todos, quando você marca um gol.`                                                                                                                                                                                                                                                                  | `✓ EQUIPADO`                    | equipped                        |

Owned **poses, celebrations, number and boots** live here (owner).

---

## 4. Meu Time (`meu-time`)

### Club header (#10, shared by all sub-tabs)

| Element   | Data fields (examples)                                                                                                                                | Actions | States      |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------- |
| Club hero | label `CENTRAL DO CLUBE`; crest image; name club name and tag; `Nível 1` `Clube iniciante`; bar `0 / 124 XP · Próxima: Identidade do Clube (nível 5)` | —       | level 0 XP  |
| Meta      | `Capitão` `Jogador 05`; `Elenco` `5 / 5`                                                                                                              | —       | full roster |

Sub-tabs (segmented control): `Elenco e convites` (`elenco`), `Identidade e gestão` (`identidade`), `Personalizar clube` (`personalizar`), `Histórico` (`historico`), `Missões` (`missoes`), `Conquistas` (`conquistas`).

### 4.1 Elenco e convites (#10, #11)

| Screenshot(s) | Element            | Data fields (examples)                                                                                                                                                                                                             | Actions/controls                                           | States seen                                    |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| #10, #11      | Shortcut           | `Partidas do time ficam em Jogar › Amistosos.`                                                                                                                                                                                     | `IR PARA OS AMISTOSOS`                                     | —                                              |
| #11           | Lineup cards (5)   | slot `GOLEIRO`/`ZAGUEIRO`/`MEIA`/`ATACANTE`/`RESERVA`; avatar; name (`Jogador 01`, `Jogador 03`, `Jogador 05` with a captain `C` badge, `Jogador 02`, `Jogador 04`); status `ESPERANDO` / `FORA DO LOBBY` / `OCUPADO` / `NO BANCO` | none visible (no invite control seen despite the tab name) | own card highlighted; other players greyed out |
| #11           | `COMISSÃO TÉCNICA` | `O técnico é um jogador vinculado ao clube, sem ocupar vaga na escalação.`                                                                                                                                                         | —                                                          | empty: `Este time ainda não tem técnico.`      |

### 4.2 Identidade e gestão (#12)

| Screenshot(s) | Element     | Data fields                                                                                                                                                                                                             | Actions/controls       | States seen               |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------------------- |
| #12           | Leave       | —                                                                                                                                                                                                                       | `PEDIR PARA SAIR`      | —                         |
| #12           | `Uniformes` | `Só o capitão grava os uniformes. Na partida de times cada um entra vestido com eles.`; slots `1º UNIFORME`, `2º UNIFORME`, `3º UNIFORME`, `4º UNIFORME`, `GOLEIRO 1`, each with an avatar preview and 2 color swatches | none for a non-captain | filled; empty `Vaga` (3º) |

### 4.3 Personalizar clube (#13)

| Screenshot(s) | Element         | Data fields                                                                           | Actions | States seen                                                                                                            |
| ------------- | --------------- | ------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| #13           | Inventory panel | `SEU INVENTÁRIO`; `Personalizar clube`; `Escolha quais recompensas o clube vai usar.` | —       | empty: ◇ `Seu clube ainda não tem itens para equipar` / `Desbloqueie recompensas no trilho para personalizar o clube.` |

### 4.4 Histórico (#14, #15)

| Screenshot(s) | Element         | Data fields (examples)                                                                                                                                                                                                                                                   | Actions | States seen                 |
| ------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | --------------------------- |
| #14           | Header          | `Histórico do clube`; `10 partidas contabilizadas`                                                                                                                                                                                                                       | —       | —                           |
| #14           | Stat tiles      | `Partidas 10`, `Vitórias 2` (green), `Empates 0`, `Derrotas 8` (red), `Gols marcados 13`, `Gols sofridos 22`, `Aproveitamento 20%`, `Sequência invicta 0`                                                                                                                | —       | —                           |
| #14           | Insight tiles   | `Maior freguesia` fictional club `2 vitórias em 10 jogos`; `Adversário mais difícil` fictional club `8 derrotas em 10 jogos`; `Maior goleada` `2 × 1` fictional club; `Últimos resultados` chips `D V D D D` `Mais recente à esquerda`                                   | —       | —                           |
| #15           | `Partidas` list | `Mais recentes primeiro`; rows use the same pattern as Perfil history: `Derrota`/`Vitória`/`Abandono`; `Amistoso contabilizado` / `Saiu da partida: derrota em dobro`; `há 4 dias · 21 min`; `GK`; `0 G / 0 A`; `1 contra`; `1 x 2` fictional club; right tag `Amistoso` | —       | loss, win, abandon (orange) |

### 4.5 Missões (#16)

| Screenshot(s) | Element     | Data fields (examples)                                                                                                                                           | Actions | States seen |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ----------- |
| #16           | Header      | `DESAFIOS DIÁRIOS`; `Missões do clube`; `Renova à meia-noite UTC · faltam 20h`; counter `0/6`                                                                    | —       | —           |
| #16           | Mission row | ◈ icon; `Disputar 1 amistoso` `+30 XP` `0/1`; `Vencer 1 amistoso` `+40 XP` `0/1`; status `Em andamento`; progress bar (4 more rows below the fold, not captured) | —       | in progress |

### 4.6 Conquistas (#17–#20)

| Screenshot(s) | Element                                          | Data fields (examples)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Actions                                                               | States seen                          |
| ------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------ |
| #17           | Trajectory header                                | `TRAJETÓRIA DO CLUBE`; `Nível 1` `· 0 XP total`; `Próximo desbloqueio: Identidade do Clube · nível 5`; `1/50`                                                                                                                                                                                                                                                                                                                                                                                                                                | —                                                                     | —                                    |
| #17, #18      | `NÍVEIS E CONQUISTAS` — `Trilha de recompensas`  | 8 level cards: lvl `5` `Identidade do Clube` `TÍTULO`; `10` `Apresentação VS` `APRESENTAÇÃO VS`; `15` `Entrada de Clube` `ENTRADA`; `20` `Moldura Especial` `MOLDURA`; `25` `Celebração Coletiva` `COMEMORAÇÃO`; `30` `Entrada Avançada` `ENTRADA`; `40` `Comemoração Especial` `COMEMORAÇÃO`; `50` `Entrada Lendária` `ENTRADA`; track marker `Nível 1 · 0 / 124 XP`                                                                                                                                                                        | `Clique para ver a prévia` (card click opens a preview; not captured) | locked; color tiers blue/purple/gold |
| #18, #19      | `CONQUISTAS ESPECIAIS` — `Recompensas especiais` | `Liberadas por títulos e marcos do clube`; ★ cards with a lock: `Celebração de título` `CAMPEÃO DE COPA`; `Entrada campeã RCS` `CAMPEÃO RCS`; `Entrada campeã de temporada` `1º NA TEMPORADA`; `Entrada temática da temporada` season XP milestone; `Moldura da temporada` season XP milestone; `Título Veteranos` `20 AMISTOSOS OFICIAIS`; `Moldura Dinastia` `2 COPAS OFICIAIS`; `VS Defesa Impecável` `5 JOGOS SEM SOFRER GOLS`; one more card cut off on the right                                                                       | horizontal scroll                                                     | all locked                           |
| #19, #20      | `COLEÇÃO` — `Sala de troféus`                    | `0/5 conquistas`; cards: rarity · status, name, criterion, `Desbloqueia: …`, progress — `RARO · EM PROGRESSO` `Veteranos` `20 amistosos oficiais` `Desbloqueia: Título Veteranos` `0/20`; `LENDÁRIO` `Dinastia` `2 copas oficiais conquistadas` `Moldura Dinastia` `0/2`; `ÉPICO` `Defesa Impecável` `5 partidas oficiais sem sofrer gols` `VS Defesa Impecável` `0/5`; `ÉPICO` `Imparáveis` `10 vitórias oficiais consecutivas` `Celebração Imparáveis` `0/10`; `LENDÁRIO` `Clube Histórico` `Alcance o nível 50` `Entrada Lendária` `1/50` | —                                                                     | in progress                          |

### 4.7 Missões (rest), Conquistas and club rewards (C11–C15)

Files `reference/current-app/CNN-*.webp`, shared by the owner on date omitted. Answers Q8 (missions; special rewards except the 9th+ cards) and Q9.

Club missions (6 total, all `Em andamento`): `Disputar 1 amistoso` `+30 XP` `0/1` (#16); `Vencer 1 amistoso` `+40 XP` `0/1`; `Marcar 2 gols` `+50 XP` `0/2`; `Disputar 2 partidas` `+60 XP` `0/2`; `Não sofrer gol em 1 partida` `+55 XP` `0/1`; `Participar de 1 copa` `+80 XP` `0/1` (C11).

`CONQUISTAS ESPECIAIS` — `Recompensas especiais` — `Liberadas por títulos e marcos do clube` (C13), above it the club level `Nível 1 · 0 / 124 XP`. A horizontal carousel of locked cards (★ on top, padlock), each name + condition:

| Reward                           | Condition                                                                                      |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Celebração de título`           | `CAMPEÃO DE COPA`                                                                              |
| `Entrada campeã RCS`             | `CAMPEÃO RCS`                                                                                  |
| `Entrada campeã de temporada`    | `1º NA TEMPORADA`                                                                              |
| `Entrada temática da temporada`  | season XP milestone                                                                            |
| `Moldura da temporada`           | season XP milestone                                                                            |
| `Título Veteranos`               | `20 AMISTOSOS OFICIAIS`                                                                        |
| `Moldura Dinastia`               | `2 COPAS OFICIAIS`                                                                             |
| `VS Defesa Impecável`            | `5 JOGOS SEM SOFRER GOLS`                                                                      |
| 9th+ (cut off, starts with `1…`) | probably `Celebração Imparáveis` / `Entrada Lendária` from the trophy room — unconfirmed (Q19) |

`COLEÇÃO` — `Sala de troféus` — `0/5 conquistas` (C12), each `rarity · EM PROGRESSO`, name, condition, `Desbloqueia: …`, progress:

| Rarity     | Trophy             | Condition                             | Unlocks                 | Progress |
| ---------- | ------------------ | ------------------------------------- | ----------------------- | -------- |
| `RARO`     | `Veteranos`        | `20 amistosos oficiais`               | `Título Veteranos`      | `0/20`   |
| `LENDÁRIO` | `Dinastia`         | `2 copas oficiais conquistadas`       | `Moldura Dinastia`      | `0/2`    |
| `ÉPICO`    | `Defesa Impecável` | `5 partidas oficiais sem sofrer gols` | `VS Defesa Impecável`   | `0/5`    |
| `ÉPICO`    | `Imparáveis`       | `10 vitórias oficiais consecutivas`   | `Celebração Imparáveis` | `0/10`   |
| `LENDÁRIO` | `Clube Histórico`  | `Alcance o nível 50`                  | `Entrada Lendária`      | `1/50`   |

Club reward previews — a modal per reward (`Clique para ver a prévia`):

| Shot | Header                                  | Content (literal)                                                                                                                                        | Actions              | State             |
| ---- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- | ----------------- |
| C14  | `RECOMPENSA DO CLUBE · TÍTULO`          | `Identidade do Clube`, `Nível 5`; crest with a ★, club name and tag; `Uma estrela junto ao escudo em Meu Time. Passe o mouse sobre ela para ver o selo.` | close                | `Ainda bloqueado` |
| C15  | `RECOMPENSA DO CLUBE · APRESENTAÇÃO VS` | `Apresentação VS`, `Nível 10`; animated preview `APRESENTAÇÃO EQUIPADA` `VS` `VISUAL PADRÃO`                                                             | `Assistir novamente` | `Ainda bloqueado` |

Notes: club rewards are a third user of the item-sheet pattern (preview + unlock condition + state). Trophy rarities are masculine (`RARO`, `ÉPICO`, `LENDÁRIO`).

---

## 5. Jogar (`jogar`)

The Jogar tab has one view. It opens on an unselected picker with only Ranqueada Solo and Amistosos; choosing a mode replaces the picker content in place. Each detail view begins with a top-left `‹ Trocar modo` back control.

### 5.1 Mode picker (#21)

| Screenshot(s) | Element          | Data fields                                                                                                                                                                   | Actions                                           | States seen                                       |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------- |
| #21           | Title            | `ESCOLHA O MODO DE JOGO`                                                                                                                                                      | —                                                 | —                                                 |
| #21           | Mode choices (2) | `RANQUEADA SOLO` · `FUTEBOL 4X4 · INDIVIDUAL` · `0 jogadores buscando`; `AMISTOSOS` · `FUTEBOL 4X4 · TIMES E CONVIDADOS` · `Escalação com aceite obrigatório dos 8 jogadores` | select a mode, then `CONFIRMAR` in the action bar | unselected on entry; selected after player choice |

### 5.2 Ranqueada Solo — queue (#22, #23)

| Screenshot(s) | Element                             | Data fields (examples)                                                                                                                                                                                                                                                                                                                                                                                              | Actions/controls            | States seen                         |
| ------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ----------------------------------- |
| #22           | Queue ring                          | `0/8` `NA SUA FAIXA`; 8 diamond slots; `0/8 na sua faixa de MMR`                                                                                                                                                                                                                                                                                                                                                    | —                           | empty queue                         |
| #23           | Queue info                          | `Ninguém na sua faixa ainda: qualquer posição ajuda a começar.`; `0 buscando no hotel` · `0 partidas formadas nos últimos 10 min`; `Fila de times: 0 times buscando` · `0 times em partida`; explainer `Várias partidas são montadas ao mesmo tempo no hotel, cada uma com jogadores de MMR parecido. Quem está na fila fica em segredo: você só descobre os outros jogadores quando a sua partida for encontrada.` | —                           | —                                   |
| #22, #23      | Position picker (in the action bar) | `PRIMÁRIA`: `GK`, `ZAG`, `MID`, `ATK`, `AUTO`; `SECUNDÁRIA`: `GK`, `ZAG`, `MID`, `ATK`                                                                                                                                                                                                                                                                                                                              | toggle; `ENCONTRAR PARTIDA` | selected: primary ATK, secondary GK |

### 5.3 Match found and redirecting (owner captures, date omitted)

The attached captures add two deep-linkable demo states to Jogar. They do not simulate matchmaking or navigate into the host game.

| State          | Content                                                                                                                                                                                                                                                      | Actions                                                                                                         | Notes                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| `escalacao`    | `Escalação`; static `6s para ir ao campo`; swap instructions; `Nitro da partida`, `Rebug` (1 vote), `Aleatório` (2 votes), tie/no-vote fallback; two 4-player squads with `GK`, `DEF`, `MID`, `ATK`, player names, ranks and `PDL`; `Autofill` on Jogador 09 | `Ver escalação` focuses the squad list; `Trocar (DEF/MID/ATK)` controls announce that swaps are not implemented | Countdown is example content, with no ticking timer |
| `em-andamento` | `Partida em andamento`; `Vocês estão sendo levados ao campo. O placar vale pelos gols: 2 tempos de 10 minutos.`; same squads                                                                                                                                 | `Ver partida` announces that the host handoff is not implemented                                                | Demo state only                                     |

Two teams show players, rank badges, and an autofill marker. Numeric values and identities are omitted; fixtures use fictional data.

### 5.4 Amistosos — lineup builder (#24)

| Screenshot(s) | Element             | Data fields (examples)                                                                                | Actions/controls                 | States seen                |
| ------------- | ------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------- |
| #24           | Header              | crest; `ESCALAÇÃO · 0/4 CONFIRMADOS`; fictional club `[ALFA]`; `0 procurando`                         | `Histórico` link                 | —                          |
| #24           | `SEU CLUBE` members | `Jogador 01` `Online · convidar`; `Jogador 02`, `Jogador 03`, `Jogador 04`, `Jogador 05` `fora do CT` | click an online member to invite | online vs offline (dimmed) |
| #24           | Position slots      | `GOLEIRO`, `ZAGUEIRO`, `MEIA` (more below the fold); `Vaga disponível` `Escolha alguém do quarto`     | `Convidar`                       | open slot                  |
| #24           | Action bar          | —                                                                                                     | `CRIAR AMISTOSO`                 | disabled                   |

### 5.5 Amistosos — lineup and invites (C10)

Files `reference/current-app/CNN-*.webp`, shared by the owner on date omitted. Answers Q7: invites happen here, to members of your own club. The owner has no captain view.

| Element        | Content (literal)                                                                                                                          | Actions                                                 | States        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- | ------------- |
| Header         | `AMISTOSOS`                                                                                                                                | link `Histórico`; top-left `‹ Trocar modo` back control | —             |
| Club           | crest; `ESCALAÇÃO · 0/4 CONFIRMADOS`; fictional club `[ALFA]`; `0 procurando`                                                              | —                                                       | —             |
| `SEU CLUBE`    | member chips: `Jogador 01` `Online · convidar`; `Jogador 02`, `Jogador 03`, `Jogador 04`, `Jogador 05` `fora do CT` (tooltip `fora do CT`) | invite an online member                                 | online / away |
| Position slots | `GOLEIRO` `Vaga disponível` `Escolha alguém do quarto`; `ZAGUEIRO` same; more slots below the fold (4 in total, 4v4)                       | `Convidar` per slot                                     | open slot     |
| Play bar       | `AMISTOSOS` / `Clube Alfa · monte a escalação` / `CRIAR AMISTOSO`                                                                          | disabled until the lineup is complete                   | —             |

Note: a third position vocabulary appears (`GOLEIRO`, `ZAGUEIRO` — full words); see open question 15.

---

## 6. Ranking (`ranking`)

Sub-tabs: `Jogadores` (`jogadores`), `Times` (`times`).

### 6.1 Jogadores (#26)

| Screenshot(s) | Element | Data fields (examples)                                                                                                 | Actions/controls                    | States seen                               |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------- |
| #26           | Header  | player count; current page and total pages                                                                             | `«`, `‹ ANTERIOR`, `PRÓXIMA ›`, `»` | page 1                                    |
| #26           | Table   | columns `#`, `JOGADOR`, `ELO`, `PARTIDAS`; rows show avatar, pass tag, rank, and match totals using fictional examples | —                                   | top-1 row highlighted; avatar frames vary |

### 6.2 Times (#27)

| Screenshot(s) | Element | Data fields (examples)                                                                                                       | Actions       | States seen |
| ------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------- | ----------- |
| #27           | Header  | `TEMPORADA ATUAL`; `Ranking de times`; `Classificação por pontos da temporada. Desempate por XP total.`; club count          | —             | —           |
| #27           | Table   | columns `#`, `CLUBE`, `NÍVEL`, `XP TOTAL`, `PONTOS`, `TÍTULOS`; fictional club row with crest, level, XP, points, and titles | `Ver clube →` | —           |

---

## 7. RCS Week (`rcs-week`) (#28)

| Screenshot(s) | Element            | Data fields                                                                                                                              | Actions/controls             | States seen                                                   |
| ------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------- |
| #28           | Edition header     | RCS logo; `RCS WEEK 1`                                                                                                                   | edition dropdown `Edição #1` | —                                                             |
| #28           | Sub-tabs           | `Visão Geral` (`visao-geral`), `Inscrições` (`inscricoes`), `Jogos` (`jogos`), `TOPs` (`tops`), `Tutorial` (`tutorial`), `Fila` (`fila`) | tab switch                   | five owner-captured; `Fila` is the play panel described below |
| #28           | Provisional leader | `LÍDER PROVISÓRIO`; `A definir`; `O título depende de todos os confrontos e homologação.`                                                | —                            | undecided                                                     |
| #28           | `Classificação`    | `Vitória: 3 pontos · empate: 1 ponto. Os resultados oficiais atualizam a tabela.` (table below the fold, not captured)                   | —                            | —                                                             |

### 7.1 RCS sub-tabs (owner screenshots shared in chat, date omitted — `C1`–`C5`)

Not yet in `reference/current-app/`. The RCS logo's small text reads `REBUG CHAMPIONS SERIES`; the header (logo, `RCS WEEK 1`, `Edição #1` dropdown) is shared by all sub-tabs.

| Shot    | Sub-tab      | Content (literal)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Actions/controls                                                 | States seen             |
| ------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------- |
| C1      | `Inscrições` | Notice: `Inscrições abertas pela administração, fora do calendário. O encerramento será manual.`; count `3 clubes inscritos`                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | —                                                                | open (admin-opened)     |
| C2, C21 | `Jogos`      | Section `Partidas oficiais` — empty: `Nenhuma partida criada nesta edição. Os confrontos são encontrados automaticamente na fila.`; section `Confrontos pendentes (0)` — empty: `Nenhum confronto pendente definido. Aguarde a confirmação dos participantes ou da próxima fase.`                                                                                                                                                                                                                                                                                                                    | —                                                                | empty                   |
| C3      | `TOPs`       | `Aguardando divulgação dos TOPs da edição.`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | —                                                                | pending (not published) |
| C4, C5  | `Tutorial`   | Title `Como participar da RCS Week`; steps `01` `Inscreva seu clube` — `Durante a semana, o responsável confirma a participação.`; `02` `Monte o time e entre na fila` — `Na janela competitiva, escale GOL, ZAG, MEI e ATA. O sistema encontra o rival.`; `03` `Acompanhe a disputa` — `Veja os pontos, os resultados e quem falta enfrentar.`; `DIAS DE PARTIDA` `Sábado, domingo e segunda` `19:00–23:00`; `CONFRONTOS` `0/0 concluídos` `0 pendentes`; section `Edições e histórico` with card `Edição #1` / `Inscrições` (edition status) and disclosure `▸ Competições anteriores preservadas` | disclosure toggle; edition card (presumably selects the edition) | —                       |

The `Fila` view presents the `Jogar RCS Week` panel. Locked: `Seu clube precisa estar inscrito e aprovado na RCS Week para jogar.` with `Ver inscrições da RCS Week` and a disabled `ENTRAR NA FILA RCS` action. Ready: `Clube Alfa, escalação pronta`, the approved lineup, and the existing pending `ENTRAR NA FILA RCS` action.

Notes:

- The four RCS positions `GOL`, `ZAG`, `MEI`, `ATA` confirm the 4v4 format (answer 11). Match history (#02) uses different codes (`GK`, `MID`, `ATK`) — one vocabulary should win (open question 15).
- The play bar on these shots is the default (`RANQUEADA` / `Escolha o modo de jogo` / `JOGAR`).
- Problems seen: the tutorial repeats live data (`CONFRONTOS`) that belongs in Visão Geral; boxed cards everywhere; gold headings as the only hierarchy.

`Visão Geral` below the fold (C20): `Classificação` table with columns `POS`, `Clube`, `PTS`, `J`, `V`, `E`, `D`, `GP`, `GC`, `SG`, `Últimos 5`; then `Hall da Fama RCS Week` table with `Clube`, `Títulos`, `Participações`, `Vitórias`. Both empty — the edition hasn't started (owner).

---

## 8. Passe de Batalha (`passe`)

Sub-tab: `MEU PROGRESSO` (`meu-progresso`). It is the only one visible. Sections stack vertically (#29–#33).

| Screenshot(s) | Element                      | Data fields (examples)                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Actions/controls                                                                                                | States seen                                          |
| ------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| #29           | Hero                         | `REBUG · TEMPORADA 1`; `Passe de Batalha`; `termina em 45 dias`; 3 showcase rewards: `MVP do Dragão` `Nível 50`, `Banner Lenda` `Nível 49`, `Moldura Lendária` `Nível 48`; ribbon `LANÇAMENTO`                                                                                                                                                                                                                                                                              | `OBTER O PASSE`                                                                                                 | pass not owned                                       |
| #29, #30      | Level progress               | level; `Temporada Temporada 1 · Termina em 45 dias (10/12/2026)`; current / next-level XP; total XP; daily progress                                                                                                                                                                                                                                                                                                                                                         | `ATUALIZAR`                                                                                                     | —                                                    |
| #30           | `RECOMPENSAS` notice         | `🔒 As recompensas liberam com o Passe de Batalha da temporada, e ele dá 5 níveis na hora. As marcadas como GRÁTIS são de todos. Para obter o Passe, veja o fim desta aba.`; `Próxima: Moldura Azul (nível 8 · com o Passe)`; `Próxima épica: MVP Super-herói (nível 15 · com o Passe)`                                                                                                                                                                                     | —                                                                                                               | —                                                    |
| #30           | Reward track                 | cards with level, art, name and category: `6` `Banner Estádio` `BANNER`; `7` `MVP no Pódio` `POSE DE MVP` `GRÁTIS` (✓ claimed); `8` `Moldura Azul` `MOLDURA` (current, orange border); `9` `Camisa` `COMEMORAÇÃO`; `10` `Banner Holográfico` `BANNER` `GRÁTIS`; `11` `Card Ouro` `CARD`; `12` `Moldura Prata` `MOLDURA`; `13` `Meditação` `COMEMORAÇÃO`; `14` `Banner Noite` `BANNER`; `15` `MVP Super-herói` `POSE DE MVP` (epic, purple); marker `Nível 7 · 455 / 860 XP` | horizontal scroll                                                                                               | claimed, current, locked (🔒), free, epic            |
| #31           | `MISSÕES DIÁRIAS`            | `Jogue 3 partidas` +100 XP `Completa ✓`; `Vença 2 partidas` +150 `1 / 2`; `Tire nota 7 ou mais 2 vezes` +100 `1 / 2`; `Vença 1 partida` +150 `Completa ✓`; `Faça 2 gols` +120 `0 / 2`; `Dê 2 assistências` +120 `0 / 2`; `Faça 5 desarmes` +120 `Completa ✓`; `Faça 4 defesas` +120 `Completa ✓`; `Jogue 1 partida em autofill ou AUTO` +250 `0 / 1`                                                                                                                        | —                                                                                                               | complete (purple), in progress (orange), not started |
| #31, #32      | `MISSÕES SEMANAIS`           | `Jogue 15 partidas` +400 `3 / 15`; `Vença 8 partidas` +500 `1 / 8`; `Vença 3 partidas seguidas` +400 `Seguidas` `0 / 3`; `Seja MVP 2 vezes` +400 `0 / 2`; `Faça 8 gols` +400; `Dê 6 assistências` +400; `Jogue 3 partidas sem sofrer gol…` +400; `Faça 40 desarmes` +400; `Jogue 5 partidas em autofill ou AUTO` +800 `0 / 5` (some progress values were cut off)                                                                                                           | —                                                                                                               | in progress                                          |
| #32, #33      | `MISSÕES DA TEMPORADA`       | `Jogue 100 partidas` +2000 XP mission progress; `Vença 60 partidas` +2000 XP mission progress                                                                                                                                                                                                                                                                                                                                                                               | —                                                                                                               | in progress                                          |
| #32, #33      | `Comprar o Passe de Batalha` | `🚀 Ganhe 5 níveis na hora ao obter o Passe.`; `Se o botão não abrir, copie o link e abra no navegador:` plus an external URL (workers.dev domain; carries user id, name, season and a token — do not reuse in mocks)                                                                                                                                                                                                                                                       | `OBTER O PASSE`; `Copiar link`; code input placeholder `Já pagou? Digite o código (ex.: PASS-CODE)`; `RESGATAR` | not purchased                                        |
| #33           | `ÚLTIMA PARTIDA`             | XP breakdown: `Partida jogada` +40; `Missão: Jogue 3 partidas` +100; `Missão: Faça 4 defesas` +120; `Total` `+260 XP`                                                                                                                                                                                                                                                                                                                                                       | —                                                                                                               | —                                                    |

### 8.1 Reward detail (owner screenshot shared in chat, date omitted — `C7`)

Opens over the pass track as a modal inside the panel when a reward is clicked. Same preview pattern as the shop's item detail (9.1) — one shared item-detail sheet in the redesign.

| Element | Content (literal)                                                  | Actions/controls |
| ------- | ------------------------------------------------------------------ | ---------------- |
| Title   | thumbnail; `Moldura Azul`; `Nível 8 · Moldura comum`               | close `×`        |
| Preview | avatar inside the blue frame; caption `Assim fica no seu perfil.`  | —                |
| Unlock  | `Libera com o Passe de Batalha, no nível 8` (locked state, no CTA) | —                |

Behind it: the reward track (locked rewards with a padlock: `Banner Estádio` `BANNER`, `MVP no Pódio` `POSE DE MVP`, `Banner Noite` `BANNER`, `MVP Super herói` `POSE DE MVP`), level marker `Nível 7 · 455 / …`, and `MISSÕES DIÁRIAS`: `Jogue 3 partidas` `+100 XP` `Completa ✓`; `Vença 1 partida` `+150 XP` `Completa ✓`; `Faça 2 gols` `+120 XP` `0 / …`; `Faça 4 defesas` `+120 XP` `Completa ✓`; `Jogue 1 partida em autofill ou AUTO` `+25 XP` `0 / 1`.

Notes: new rarity `comum` (common). The item-detail sheet has at least three states: for sale (9.1), locked by pass level (8.1), and owned/equipped (not yet seen).

### 8.2 Reward track (C24)

File `reference/current-app/C24-passe-trilha-recompensas.webp`, shared by the owner on date omitted.

- Header (cut off): total XP; daily progress.
- `RECOMPENSAS` notice: `🔒 As recompensas liberam com o Passe de Batalha da temporada, e ele dá 5 níveis na hora. As marcadas como GRÁTIS são de todos. Para obter o Passe, veja o fim desta aba.`
- Next rewards: `Próxima: Moldura Azul (nível 8 · com o Passe)`; `Próxima épica: MVP Super-herói (nível 15 · com o Passe)`.
- Horizontal track, one locked tile per level with the level number on top: `40` `Neymar` `COMEMORAÇÃO`; `41` `Moldura Cósmica` `MOLDURA`; `42` `Banner Hiperespaço` `BANNER`; `43` `MVP no Trono` `POSE DE MVP`; `44` `CR7` `COMEMORAÇÃO`; `45` `Moldura Dragão` `MOLDURA`; `46` `Banner Galáxia` `BANNER`; `47` `Card Lenda` `CARD`; `48` `Moldura Lendária` `MOLDURA`; `49` `Banner…` `BANNER`. Tiles are colored by rarity.
- `MISSÕES DIÁRIAS` (top row): `Jogue 3 partidas` `+100 XP`; `Vença 2 partidas` `+150 XP`; `Tire nota 7 ou mais 2 vezes` `+100 XP`; `Vença 1 partida` `+150 XP`.

Owner (answer 19): the track has many rewards. The redesign builds **slots by item type**, and the content loads dynamically. Item types seen: `COMEMORAÇÃO`, `MOLDURA`, `BANNER`, `POSE DE MVP`, `CARD` (+ club rewards: `TÍTULO`, `ENTRADA`, `APRESENTAÇÃO VS`). Rewards marked `GRÁTIS` are free for everyone.

Notes: some reward names use real footballers (`Neymar`, `CR7`) — content, not ours to change, but the template must not depend on any name.

---

## 9. Loja (`loja`) (#34, #35)

| Screenshot(s) | Element                     | Data fields (examples)                                                                                                                                                                                                                                                                        | Actions/controls                        | States seen            |
| ------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ---------------------- |
| #34           | Header                      | `Loja de itens`; `Itens novos todo dia às 21h.`; `Vitrine fixada · Vira em 19 h 47 min`                                                                                                                                                                                                       | —                                       | countdown              |
| #34           | `DESTAQUES` (2 large cards) | `LENDÁRIA` `Escuta Aqui` `COMEMORAÇÃO` `R$ 5,49`; `LENDÁRIA` `67` `COMEMORAÇÃO` `R$ 5,49`; 🎉 emoji art                                                                                                                                                                                       | click card (purchase flow not captured) | —                      |
| #35           | `ITENS DO DIA` (6 cards)    | `ÉPICA` `MVP do Cinturão` `POSE DE MVP` `R$ 4,49`; `LENDÁRIA` `MVP Meteoro` `POSE DE MVP` `R$ 5,49`; `LENDÁRIA` `Banner Chuva de ouro` `BANNER` `R$ 3,49`; `RARA` `Banner Vulcão` `BANNER` `R$ 1,99`; `ÉPICA` `Card Vulcânico` `CARD` `R$ 3,49`; `ÉPICA` `Moldura Vulcão` `MOLDURA` `R$ 2,49` | click card                              | border color by rarity |
| #35           | Redeem                      | `Já pagou?`; placeholder `Código do item (ex.: ITEM-CODE)`                                                                                                                                                                                                                                    | `RESGATAR`                              | —                      |
| #35           | Gift                        | `🎁 Entregar presente`; inputs `Nome de quem ganha`, `Código do presente`                                                                                                                                                                                                                     | `ENTREGAR`                              | —                      |

### 9.1 Item detail (owner screenshot shared in chat, date omitted — `C6`)

Opens over the Loja as a modal inside the panel when an item card is clicked.

| Element | Content (literal)                                                                                                       | Actions/controls |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Title   | thumbnail; `Banner Vulcão`; category `Banner`                                                                           | close `×`        |
| Preview | the item applied to the player: banner art with the avatar and `Jogador 01`; caption `Assim fica o topo do seu perfil.` | —                |
| Price   | `R$ 1,99 (€ 1,49 · US$ 1.49)`                                                                                           | —                |
| Buy     | `COMPRAR · R$ 1,99` (opens the external payment page — answer 5)                                                        | primary          |
| Gift    | input placeholder `🎁 Presentear: nome do amigo`                                                                        | `PRESENTEAR`     |

Behind it: `ITENS DO DIA` cards such as `ÉPICA` `MVP do Cinturão` `POSE DE MVP` `R$ 4,49` and `ÉPICA` `Moldura Vulcão` `MOLDURA` `R$ 2,49`; `Já pagou?` with `Código do item (ex.: ITEM-CODE)` + `RESGATAR`; `Entregar presente` with `Nome de quem ganha` + `ENTREGAR`.

Notes: prices show in three currencies (BRL, EUR, USD — note `US$ 1.49` uses a decimal point while the others use a comma). Gifting exists in two places (the detail's `PRESENTEAR` and the page's `Entregar presente`) — open question 17.

C22 — a second for-sale detail: `Escuta Aqui`, `Comemoração`; the preview is the animated celebration on the pitch; `R$ 5,49 (€ 3,99 · US$ 3.99)`; `COMPRAR · R$ 5,49`; the same gift row. Behind: `Vitrine fixada · Vira em 19 h 1 min`. Owned shop items are not shown in the Loja — they appear in Personalizar perfil (2.4) or the Vestiário (3.6) depending on kind (owner).

---

## 10. Recurring entities

**Player:** username, avatar, lobby status, shirt number, positions, rank tier and points, ranking position, win rate, MVPs, match record, goals, assists, goals per game, pass tag, avatar frame, captain badge. Captured identities and values are excluded.

**Club/team:** name, tag, crest, level and title, XP, captain, roster and slots, coach, uniforms, season points, titles, match history, missions, reward track, special rewards, trophy room. Captured identities and values are excluded.

**Rank tiers:** rank labels use a tier and division; PDL measures progress and match deltas. Matchmaking uses `MMR` / `faixa`. Fixtures use fictional values.

**Match (history row):** result (`Vitória`, `Derrota`, `Abandono`), reason (`Rendição`, `Adversário se rendeu`, `Ranqueada`, `Amistoso contabilizado`, `Saiu da partida: derrota em dobro`), relative time + duration, position played, goals/assists (`G`/`A`), own goals (`1 contra`), score (`3 x 0`), opponent club, PDL delta or `Amistoso`, `AUTOFILL` tag.

**Missions:** name, XP reward (`+100 XP`), progress `n / m`, status (`Completa ✓`, `Em andamento`, `Seguidas`), cadence (`MISSÕES DIÁRIAS`, `MISSÕES SEMANAIS`, `MISSÕES DA TEMPORADA`, club `DESAFIOS DIÁRIOS`), reset time (`Renova à meia-noite UTC · faltam 20h`).

**Battle pass:** season, end date, level, current and total XP, rewards, free/epic/claimed/locked flags, purchase benefit, redeem code, top rewards.

**Cosmetic categories:** `POSE DE MVP`, `COMEMORAÇÃO`, `BANNER`, `MOLDURA`, `CARD`, `TÍTULO`, `ENTRADA`, `APRESENTAÇÃO VS`, `CHUTEIRA` (color only), `NÚMERO`, uniform.

**Rarity names:** shop/locker use the feminine form: `RARA`, `ÉPICA`, `LENDÁRIA`. The trophy room uses the masculine form: `RARO`, `ÉPICO`, `LENDÁRIO`. Colors: rare = blue, epic = purple, legendary = gold.

**Shop item:** rarity, name, category, price, art, slot, rotation time, and redemption flow. No real redemption codes are included.

**Avatars:** pixel avatars appear in the profile stage, the locker preview, the roster, uniforms, the ranking (in rounded frames) and pass rewards (Moldura).

---

## 11. Synthetic demo data

Every player and club identity, profile statistic, ranking result, match outcome, score, and progress value in `src/data/` is fictional. Captured account data, user identifiers, real redemption codes, and raw screenshots are excluded from this repository snapshot.

## 12. Current UI problems

- Heavy gradients and glows everywhere: an orange gradient on the active tab and CTA, glowing reward cards, a purple vignette background (#17–#19, #29, #30).
- Emoji used as item art (👑 🎉) in the locker, shop and pass (#04, #05, #34, #35). In the shop, `Escuta Aqui` and `67` show the same 🎉, so the items are indistinguishable.
- Card inside card inside panel: the club header, the stat tiles inside the history panel, mission rows inside the missions card, and the Personalizar empty state in a large bordered box (#10, #13, #16, #17).
- Shop card art overflows its card (`Card Vulcânico` art spills over the border and is truncated to `FO...`) (#34, #35).
- Truncated or clipped text: `Jogue 3 partidas sem sofrer gol…` and `+400 XP` wrap badly; `+250 XP` wraps; reward category `APRESENTAÇÃO VS` and `POSE DE M…` are clipped (#18, #30, #31).
- Typos and duplication: `TTemporada 1` (#01); `Temporada Temporada 1` (#29); daily progress reads oddly (#29).
- Number formatting is inconsistent: total XP (#01) vs total XP (#29); `1 x 4` vs `2 × 1` (#02, #14).
- Wrong-context toast: the Chuteira view shows `Preferência de comemoração salva…` (#08).
- The action bar does not follow the active tab. RCS/`VER ESCALAÇÃO` sticks on Perfil and Loja after visiting Jogar, which is confusing (#26–#38).
- Inconsistent buttons: filled orange, outline orange, dark outline (`USAR CHUTEIRA ATUAL`, `RESGATAR`), brown filled (`SALVAR COR`), purple text links (`‹ Trocar modo`), and disabled CTAs that look nearly identical to enabled ones (#08, #09, #24, #25).
- Inconsistent tab styles: underline sub-tabs (Perfil, Passe), a pill segmented control (Meu Time, Ranking), and boxed buttons (RCS Week) (#01, #10, #26, #28).
- Low contrast: grey-on-purple secondary text, dimmed offline members, locked reward labels and table meta text (#11, #19, #24, #26).
- Locker screens open scrolled, so their title is hidden. The pass purchase is buried at the bottom of a long page with a raw URL exposed (#04, #32).
- Rarity wording is inconsistent in gender (`RARA` vs `RARO`) (#06, #20).
- History rows look clickable but have no affordance. The queue screen has lots of explanatory text with little visual hierarchy (#02, #23).
- `Elenco e convites` shows no invite control (#11).

---

## 13. Open questions

Answered ones are resolved in section 14. Still open: confirm 17 (what `Entregar presente` delivers) and what the ✎ on `IDENTIDADE DO JOGADOR` opens.

1. What does the settings (gear) button open?
2. Should the bottom action bar follow the active tab or the last chosen mode? Which variant belongs on each tab?
3. What is the full rank-tier ladder (Bronze? Diamante?), and how many divisions and PDL per division?
4. What do the RCS Week sub-tabs `Inscrições`, `Jogos`, `TOPs` and `Tutorial` contain? What does the `Classificação` table have?
5. Is the shop purchase flow external (BRL via a web link plus a redeem code), the same as the pass? What happens when a user clicks a shop card?
6. What other options does the `Nos meus gols` dropdown have (collective celebration label)?
7. What do captain-only controls look like (uniform recording, invites, kick)? How does a user invite people in `Elenco e convites`?
8. What are the 4 club missions below the fold (#16) and the full special-reward list (9th card cut off, #19)?
9. What is the club reward preview (`Clique para ver a prévia`) like?
10. ~~What is the purpose of `Personalizar lobby` and the ✎ on `Identidade do jogador`?~~ — unified as `Personalizar perfil`; opens the owned-item view with Card, Banner, and Moldura filters (2.4).
11. Amistosos say "8 jogadores" and "0/4 confirmados" while the club roster is 5/5. How many players does each side need?
12. Are the `PASSE T1` tags and framed avatars in the ranking driven by battle-pass ownership?
13. Is the `RCS WEEK` main tab the same thing as Jogar › RCS Week, or should they be merged?
14. Is the Vestiário header (above `Seu equipamento para a próxima partida.`) a title? It was never captured unscrolled.

15. ~~Position vocabulary~~ — answered (14).
16. ~~RCS logo~~ — answered (14).
17. ~~Gifting~~ — answered (14); confirm whether `Entregar presente` is for credit/money.
18. ~~Personalizar perfil trigger~~ — answered (14).
19. ~~Reward lists~~ — answered (14).
20. Pass content the owner doesn't know yet (date omitted), all loaded at runtime from the game, so the templates don't depend on them: the autofill/AUTO daily mission reads `+250` (#31) and `+25 XP` (C7) — the mock keeps `+250` from the primary capture, and the "missões em aberto valem" total is computed from whatever arrives; the pass price; whether rewards are claimed with a button or land on their own; the item art.

## 14. Owner answers (date omitted)

These override anything above that conflicts with them.

| #   | Question                         | Answer                                                                                                                                                                                                                                                                         |
| --- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Settings (gear)                  | Window resolution presets — see "Header". Keep the three 16:9 sizes; when the chosen size doesn't fit the host window, the panel keeps 16:9 and **reflows** smaller (no transform scaling).                                                                                    |
| 2   | Bottom action bar                | **Global play bar**: Jogar choices are made in the Jogar picker; the default `Jogar` CTA is a shortcut, not a selected mode. The RCS queue action stays on RCS Week › Fila.                                                                                                    |
| 3   | Rank ladder                      | LoL/Valorant-style, football wording: `Ferro`, `Bronze`, `Prata`, `Ouro`, `Platina`, `Esmeralda`, `Diamante` — divisions `IV`–`I`, `100 PDL` per division; then `Craque`, `Lenda`, `Fenômeno` (apex; `Fenômeno` = the top players, no divisions). Data in `src/data/ranks.js`. |
| 5   | Shop purchase                    | Same as the battle pass: card → detail → `Comprar` opens the external payment page (BRL); the item arrives afterwards. Never show the raw URL.                                                                                                                                 |
| 11  | Match size                       | Friendlies are **4v4** (8 players); a 5-player roster has one reserve.                                                                                                                                                                                                         |
| 12  | `PASSE T1` tag + framed avatar   | Marks players who own the Season 1 battle pass.                                                                                                                                                                                                                                |
| 13  | RCS Week tab vs Jogar › RCS Week | **Merged** into the RCS Week tab; its `Fila` view owns the play panel. Jogar offers only Ranqueada Solo and Amistosos, with no mode selected on entry.                                                                                                                         |
| 4   | RCS sub-tabs                     | Captured — see 7.1 (only `Classificação` and the end of `Confrontos pendentes` missing).                                                                                                                                                                                       |
| 6   | Celebration options              | `Minha comemoração individual`, `Celebração Coletiva do clube` (3.6).                                                                                                                                                                                                          |
| 7   | Captain controls / invites       | No captain view available; invites happen in Jogar › Amistosos, to members of your club (5.5).                                                                                                                                                                                 |
| 8   | Hidden missions and rewards      | Captured (4.7), except the 9th+ special-reward cards (Q19).                                                                                                                                                                                                                    |
| 9   | Club reward preview              | A modal per reward with preview, level and `Ainda bloqueado` (4.7).                                                                                                                                                                                                            |
| 10  | Personalizar / ✎ / owned items   | Unified as `Personalizar perfil` (card, banner, frame) holds owned items; poses and celebrations live in the Vestiário. Owned shop items never show in the Loja (2.4, 3.6).                                                                                                    |
| 14  | Vestiário header                 | Captured (3.6).                                                                                                                                                                                                                                                                |
| 4   | RCS tables                       | `Classificação` and `Hall da Fama` captured as headers only — empty until the edition starts (7.1).                                                                                                                                                                            |
| 15  | Position vocabulary              | **`GK`, `DEF`, `MID`, `ATK`** everywhere (replaces `GOL`/`ZAG`/`MEI`/`ATA` and `GOLEIRO`/`ZAGUEIRO`).                                                                                                                                                                          |
| 16  | RCS and other logos              | No vector assets exist. Use what we have (`public/assets/brand/rcs-logo.png`, a 254×240 crop) or leave a sized, labelled slot to fill later.                                                                                                                                   |
| 17  | Two gift controls                | `PRESENTEAR` (item sheet) gifts that item to a friend; `Entregar presente` (Loja page, with a code) is for money/credit — owner thinks; to confirm.                                                                                                                            |
| 18  | `Personalizar lobby`             | The unified `Personalizar perfil` opens with the `Banner` filter selected — lobby things live there (C23).                                                                                                                                                                     |
| 19  | Reward lists                     | Pass, club and special rewards are many; design **slots by item type**, content loads dynamically (8.2).                                                                                                                                                                       |
| 20  | Pass rewards when buying late    | Retroactive: buying the pass unlocks the pass rewards of every level already reached (owner, date omitted).                                                                                                                                                                    |

## 15. Owner interaction clarifications (date omitted)

- **Elo identity:** original football-style SVG crests identify the ten tiers from owner answer 3. Tier colors belong only to the badge. Divisions IV–I stay readable; apex tiers have no division. Perfil and Ranking share the same identifiers.
- **Ranking identity:** each player row reserves a 48×48 head slot, and each club row reserves a 48×48 crest slot. Missing files remain labelled placeholders. Pass-owner tags remain visible. Supplied player/club images are still pending.
- **Avatar rotation:** drag horizontally on the avatar or `Girar` for a complete 360° turn. One stage width equals one turn. Left/right buttons provide 45° steps. Directional frames show the avatar from different sides; absent art shows the placeholder and angle. No flat-image CSS rotation, automatic spin, or inertia.
- **Mode picker:** three equal-width, button-like radio choices in one row. Selection uses a light fill, dark text, checked indicator and `Selecionado`; `Confirmar` then opens the chosen mode.
- **Finding versus joining:** outside Jogar › Ranqueada Solo, `Encontrar partida` opens Jogar's mode picker. Confirming Solo opens position preferences without starting a search. On Solo itself the same global button reads `Entrar na fila` and starts searching; there is no separate in-view start button (owner clarification).
- **Active Solo search:** fill exactly one of eight seats as `Você`; show primary and secondary positions and an elapsed `m:ss` timer from `0:00`. Other seats stay empty until real game data exists. The global play bar shows the active search and `Sair da fila` on every tab. Mode and position changes require leaving first.
- **Queue lifetime:** keep the search through tab changes and panel close/reopen. `Sair da fila` stops the timer and empties the seat, retaining position preferences. A subsequent search starts at zero. Reload clears active search; URL parameters do not restore it. Match arrival remains a manually opened demo state, not a queue simulation.
