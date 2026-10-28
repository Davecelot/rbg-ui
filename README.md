# RBG — rediseño del panel

Rediseño de UI/UX del panel de **RBG**, el hub de fútbol que se abre
dentro del hotel pixel-art. El tamaño máximo del panel depende de la ventana
de cada jugador: el jugador elige una de tres resoluciones 16:9 en la
configuración, y si no entra en la ventana, el panel se reacomoda más chico.

- **Dirección:** premium y deportivo. Disciplina Nike (monocromo, plano,
  un solo CTA en píldora, tipografía con confianza) × los escudos RBG
  (negro, blanco y un verde cancha) × cultura futbolera × el pixel art como
  única "fotografía".
- **Stack:** HTML, CSS y JavaScript sin frameworks. Vite solo para
  desarrollo, Playwright para probar.
- **Idiomas:** la interfaz va en portugués de Brasil; la documentación para
  agentes, en inglés; este README, en español.

## Cómo correrlo

```bash
nvm use
npm install
npx playwright install chromium
npm run dev
```

Abrí <http://localhost:5173>: vas a ver el panel montado sobre un fondo
que simula el hotel. Con `Esc` se cierra y con el botón de abajo a la
izquierda se vuelve a abrir. Para ir directo a una pantalla:
`/?tab=ranking&sub=jogadores`.

```bash
npm test                          # las tres resoluciones y la ventana chica
WALKTHROUGH=1 npm test -- walkthrough   # capturas de cada pantalla
```

## Dónde está cada cosa

- `AGENTS.md`: el índice para los agentes (reglas, skills, agentes).
- `.agents/`: las diez skills, nueve reglas y dos procedimientos de revisión
  compartidos por Claude Code, Codex y ChatGPT Work local. `CLAUDE.md` y
  `.claude/` conservan la compatibilidad con Claude.
- `docs/screen-inventory.md`: todo lo que muestra la app actual. Es la
  lista de lo que se puede mostrar; no se inventan funciones.
- `docs/creative-brief.md`: el porqué del rediseño.
- `reference/current-app/`: las 38 capturas de la app actual.
- `.ai/DECISIONS.md`: decisiones tomadas y pendientes.

## Usar los agentes

Abrí esta carpeta en Claude Code, Codex o ChatGPT Work local. Codex carga
`AGENTS.md` y las skills de `.agents/skills/`; Claude usa los mismos archivos
mediante enlaces simbólicos. En Work, si no aparecen las instrucciones o
skills, usá el mensaje inicial de [la guía de configuración](docs/agent-setup.md).

Los hooks de Hammock y movimiento usan un motor compartido. En Codex,
revisá y confiá los hooks del proyecto desde `/hooks` antes de usarlos.
Los cambios de hooks requieren una nueva revisión. En Work con orquestación
en la nube, ejecutá los controles manuales de la guía: los hooks locales
no están disponibles. Mody es opcional.

```bash
npm run test:harness   # descubrimiento, rutas y comportamiento de hooks
```

El estado de cada sesión queda separado e ignorado por git. Todo el trabajo
sigue siendo local en `main`, sin publicar ni cambiar configuración global.
Los resultados y límites de la verificación están en
[el registro de verificación](docs/harness-verification.md).

## Pendiente de tu parte

- Guardar los dos escudos en `public/assets/brand/` como
  `rbg-badge.png` (plano) y `rbg-badge-pixel.png` (pixel art).
- Responder las preguntas abiertas al final de `docs/screen-inventory.md`.
- Elegir tipografías (hay candidatas en `.ai/DECISIONS.md`).
