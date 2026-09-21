# 🎮 Jogos Bíblicos — Arcade Kids

Mini-jogos bíblicos web para crianças de **3 a 9 anos** (React + TypeScript +
Tailwind CSS + Vite). Roda no **computador, tablet, smartphone e iPhone**.
Projeto de **ministério, gratuito e sem conta de criança**.

Publicado em GitHub Pages: `https://rodrigorgautomacao.github.io/kids/`

## Organização: por faixa etária + tipo bíblico

O catálogo é dividido por **faixa** (Pequeninos 3–4 · Exploradores 5–6 ·
Íntimos de Deus 7–9), com filtro por tipo bíblico (**AT · NT · AT+NT**) — as
faixas ficam centralizadas em `data/games.tsx` (`FAIXAS`) para ajuste fácil.

| Faixa | Jogos (com tipo bíblico) |
|---|---|
| 🌱 **3–4 Pequeninos** | **Encontre a Cena** (AT+NT) · **Pares da Arca** (AT) · **Que Som é Esse?** (AT+NT) · **Quebra-Cabeça Bíblico** (AT+NT) · **Conta na Arca** (AT) · **Ache o Igual** (AT+NT) · **Sim ou Não?** (AT+NT) · **Ache o Escondido** (AT+NT) · **Eu Sou de Deus** (AT+NT) |
| 🧭 **5–6 Exploradores** | **Aventura na Bíblia** (AT+NT) · **A História em Ordem** (AT+NT) · **Mostre o Livro** (AT+NT) · **Quebra-Cabeça Bíblico 3×3** (AT+NT) · **Ligue os Pares** (AT+NT) · **Antigo ou Novo?** (AT+NT) · **Quantos na História?** (AT) · **Qual Não Pertence?** (AT+NT) · **Meninos e Meninas de Deus** (AT+NT) |
| 🙏 **7–9 Íntimos de Deus** | **A Estrada da Luz** (AT+NT) · **Heróis da Bíblia** (AT+NT) · **Linha do Tempo** (AT+NT) · **Caçadores do Versículo** (AT+NT) · **Quem Falou?** (NT) · **Separe por Testamento** (AT+NT) · **Verdadeiro ou Falso?** (AT+NT) · **Complete o Versículo** (AT+NT) · **Sombra do Herói** (AT+NT) · **Meu Propósito** (AT+NT) |

**28 jogos** (9 na faixa 3–4 · 9 na 5–6 · 10 na 7–9), todos classificados por
**faixa etária** e por **tipo bíblico** (AT / NT / AT+NT). Os filtros do Hub usam
esse campo — trocar o tipo de um jogo é uma linha em `data/games.tsx`.

**Toda pergunta e toda opção de resposta têm som** (botão 🔊 ou narração
automática ao escolher), porque nem toda criança sabe ler.

Cada pergunta/estação cita a **referência bíblica** (`Livro cap.vers (VERSÃO)`).
A versão é a da fonte quando atestada; caso contrário, **NAA**
(Nova Almeida Atualizada, SBB).

O progresso fica no `localStorage` do aparelho (estrelas, níveis e recorde por
jogo). **Cada opção de resposta tem um alto-falante 🔊** e, no **modo
pequeninos**, as opções são narradas em sequência — quem ainda não lê joga
sozinho. Cada personagem da Aventura tem **rosto e vestes próprios**. Jogos
novos entram como "Em breve 🔨" até serem implementados (hoje não há nenhum).

Na **Aventura na Bíblia**, ao falar com um personagem a criança escolhe **qual
história quer ver como peça de teatro** (palco com cortinas, cenário SVG,
narração e um quiz que confirma sem punir) e ganha uma **figurinha** ao
terminar. São **48 cenas — 4 por personagem** (`data/scenes.ts`). As figurinhas
ficam no **livrinho** (botão 💮 no Hub) — coleção pura, nada é bloqueado por
falta de figurinha. Há um botão de idioma **PT/EN** para a carcaça da interface
(o conteúdo bíblico segue em PT-BR).

## Rodar localmente

```bash
cd games
bun install        # instala (bun.lock)
bun run dev        # → http://localhost:5173
```

Build de produção e checagens:

```bash
bun run build      # prebuild (bump-sw) + tsc && vite build → games/dist
bun run preview    # serve o build localmente
bun run typecheck  # TypeScript estrito (tsc --noEmit)
bun run test       # vitest (jsdom) — catálogo, voz, figurinhas, progresso
```

> Neste ambiente use **`bun`**: o `npm` do PATH é o do Windows e falha em
> caminhos UNC. O CI também usa **bun** (`oven-sh/setup-bun@v2`).

## Estrutura

```
kids/
├── .github/workflows/
│   ├── deploy.yml                 ← GitHub Actions (bun) → GitHub Pages
│   └── audit.yml                  ← Lighthouse + acessibilidade (semanal/manual)
├── .lighthouserc.json             ← metas de perf/a11y/SEO da auditoria
└── games/                         ← raiz do app Vite
    ├── index.html                 ← metas + preview social + JSON-LD (WebApplication)
    ├── vite.config.ts             ← base: '/kids/' (GitHub Pages)
    ├── vitest.config.ts           ← testes em ambiente jsdom
    ├── tailwind.config.js
    ├── scripts/
    │   ├── gen-icons.mjs          ← gera os PNG do PWA (sem dependências)
    │   └── bump-sw.mjs            ← prebuild: VERSION do SW = hash do commit
    ├── public/
    │   ├── manifest.webmanifest   ← nome, ícones, standalone, tema
    │   ├── sw.js                  ← offline: shell + assets + fontes
    │   ├── sitemap.xml · robots.txt
    │   ├── fonts/                 ← Baloo 2 (woff2, latin + latin-ext)
    │   └── icons/                 ← 180/192/512/maskable (gerados)
    └── src/
        ├── App.tsx                ← alterna Hub ⇄ jogo ativo (+ transição de tela)
        ├── data/games.tsx         ← REGISTRO dos jogos (faixa + tipo + status; ícones inline)
        ├── data/scenes.ts         ← catálogo das 36 cenas-teatro (ref NAA + quiz + figurinha)
        ├── index.css              ← tailwind + @font-face (Baloo 2) + dvh/safe-area
        ├── lib/
        │   ├── audio/             ← efeitos, trilhas adaptativas e narração
        │   │   ├── context.ts     ← Web Audio, buses, ducking, unlock iOS
        │   │   ├── preferences.ts ← mudo de efeitos/música/narração
        │   │   ├── sfx.ts         ← efeitos sintetizados (sem arquivos)
        │   │   ├── music.ts       ← trilhas por cena + camadas de intensidade
        │   │   ├── voice.ts       ← speechSynthesis + speakQueue (narração de opções)
        │   │   └── index.ts       ← re-exports (+ `sfx`, `music`, `voice`)
        │   ├── i18n.ts            ← carcaça PT/EN (conteúdo bíblico fica em PT)
        │   ├── stickers.ts        ← coleção de figurinhas (localStorage)
        │   ├── progress.ts        ← progresso, estrelas, unlocks, recordes
        │   ├── prefs.ts           ← modo pequeninos, 1ª vez, mundo salvo
        │   ├── fx.ts              ← partículas, número voando, screen shake
        │   ├── motion.ts          ← prefers-reduced-motion
        │   ├── minigame.ts        ← shuffle + regra de estrelas dos mini-jogos
        │   ├── device.ts          ← standalone / iPhone / celular em pé
        │   └── confetti.ts        ← confete dosado por aparelho
        └── components/
            ├── GameShell.tsx      ← casca comum (voltar, pausa, som, título)
            ├── LevelHUD.tsx       ← Nível x/N + barra do trecho + "faltam N"
            ├── LevelDone.tsx      ← fim de nível/capítulo + explicação das ⭐
            ├── LevelMap.tsx       ← mapa de trechos/estações (rejogar)
            ├── PauseOverlay.tsx   ← pausa (continuar / recomeçar / sair)
            ├── HandHint.tsx       ← onboarding sem texto (mãozinha animada)
            ├── Hub.tsx            ← home por faixa + filtro + figurinhas + idioma
            ├── CollectionBook.tsx ← livrinho de figurinhas (por personagem)
            ├── SceneStage.tsx     ← teatro de cenas (cortinas, atos, quiz, figurinha)
            ├── InstallHint.tsx    ← "Adicionar à Tela de Início"
            ├── RotateHint.tsx     ← aviso "vire o aparelho" (celular em pé)
            ├── art/               ← arte SVG própria (substitui emoji de elenco)
            │   ├── Hero.tsx       ← herói, com estados idle/walk/happy/sad
            │   ├── Npc.tsx        ← personagem com LOOKS (rosto/vestes por personagem) + motivo no peito
            │   ├── Backdrop.tsx   ← 22 cenários SVG do teatro
            │   ├── Motifs.tsx     ← 12 motivos (arca, peixe, leão, coroa…)
            │   └── StarItem.tsx   ← estrela coletável
            └── games/
                ├── GameEncontreACena.tsx    ← 3–4: dica narrada → toque na figura
                ├── GameParesDaArca.tsx      ← 3–4: memória de pares
                ├── GameQueSomEsse.tsx       ← 3–4: pista sonora → personagem
                ├── GameQuebraCabeca.tsx     ← 3–4: quebra-cabeça 2×2 (usa PuzzleGame)
                ├── GameContaNaArca.tsx      ← 3–4: contagem (usa CountGame)
                ├── GameAcheOIgual.tsx       ← 3–4: achar o igual (usa ChoiceGame)
                ├── GameSimOuNao.tsx         ← 3–4: verdadeiro/falso (ChoiceGame)
                ├── GameAcheOEscondido.tsx   ← 3–4: objeto escondido (HiddenGame)
                ├── GameHistoriaEmOrdem.tsx  ← 5–6: sequência (usa OrderGame)
                ├── GameMostreOLivro.tsx     ← 5–6: qual livro da Bíblia?
                ├── GameQuebraCabecaMedio.tsx← 5–6: quebra-cabeça 3×3 (PuzzleGame)
                ├── GameLigueOsPares.tsx     ← 5–6: associação (ConnectGame)
                ├── GameAntigoOuNovo.tsx     ← 5–6: classificar AT/NT (SortGame)
                ├── GameQuantosNaHistoria.tsx← 5–6: somar/subtrair (CountGame)
                ├── GameQualNaoPertence.tsx  ← 5–6: categorias (ChoiceGame)
                ├── GameLinhaDoTempo.tsx     ← 7–9: ordene eventos (OrderGame)
                ├── GameCacadoresDoVersiculo.tsx ← 7–9: complete o versículo
                ├── GameQuemFalou.tsx        ← 7–9: citações (ChoiceGame)
                ├── GameSeparePorTestamento.tsx ← 7–9: classificar AT/NT (SortGame)
                ├── GameVerdadeiroOuFalso.tsx← 7–9: afirmações (ChoiceGame)
                ├── GameCompleteOVersiculo.tsx ← 7–9: lacuna no versículo (ChoiceGame)
                ├── GameSombraDoHeroi.tsx    ← 7–9: silhuetas (ChoiceGame)
                ├── GameEuSouDeDeus.tsx      ← 3–4: identidade em Deus (ChoiceGame)
                ├── GameMeninosEMeninas.tsx  ← 5–6: criação e valor (ChoiceGame)
                ├── GameMeuProposito.tsx     ← 7–9: propósitos de Deus (ChoiceGame)
                ├── MemoryGame.tsx           ← motor de memória (Pares da Arca)
                ├── OrderGame.tsx            ← motor "toque na ordem"
                ├── ChoiceGame.tsx           ← motor de escolha (grid/alvo/sombra/bool/quote/verse)
                ├── PuzzleGame.tsx           ← motor de quebra-cabeça (troca de peças)
                ├── CountGame.tsx            ← motor de contagem/soma
                ├── HiddenGame.tsx           ← motor de objeto escondido
                ├── ConnectGame.tsx          ← motor de ligar pares
                ├── SortGame.tsx             ← motor de separar em cestos
                ├── GameEstradaDaLuz.tsx
                ├── GameHeroisDaBiblia.tsx
                └── GameAventuraBiblia.tsx ← mundo 2D + menu de histórias + teatro
```

## Como adicionar um novo jogo

1. Escolha a faixa (`3-4 | 5-6 | 7-9`) e o tipo (`at | nt | at-nt`) e crie
   `src/components/games/MeuJogo.tsx` exportando `({ onExit }) => JSX`.
2. Importe em `src/data/games.tsx` e acrescente um objeto à lista `games`
   (`faixa`, `tipo`, `status: 'pronto' | 'em-breve'`, `habilidades`,
   `emBreveMotivo?`, `icon`, `color`, `component`).
3. Pronto — aparece automaticamente na seção da faixa no Hub. As faixas e os
   tipos são centralizados em `FAIXAS`/`TIPOS` no mesmo arquivo.

Regras de conteúdo (referência bíblica obrigatória, tom de graça, versão NAA):
ver o segundo cérebro em `~/.config/opencode/brain-jogos/`.

## Deploy automático

`.github/workflows/deploy.yml` roda em todo push para `main`:
checkout → `setup-bun@v2` → `bun install --frozen-lockfile` → `bun run typecheck`
→ `bun run test` → `bun run build` → `upload-pages-artifact@v3` (`games/dist`)
→ `deploy-pages@v4`.

Há também `.github/workflows/audit.yml` (Lighthouse + acessibilidade, com
`.lighthouserc.json`): roda toda segunda e sob demanda, **sem bloquear o deploy**.

Precisa estar em **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Compatibilidade e acessibilidade

- **Unidades `dvh`** e **safe areas** (`env(safe-area-inset-*)`) para iPhone.
- **Zoom liberado** para baixa visão; gestos são bloqueados só na área de jogo.
- **`prefers-reduced-motion`** desliga animações e confete.
- Sons com botão de mudo no Hub (efeitos, música e narração separados) e um mudo geral dentro de todo jogo.
- Botão **⏸ Pausa** dentro de cada jogo: continuar, recomeçar ou sair. Ao pausar, a música abaixa e a narração para.
- **Mapa/radar**: em cada jogo dá para abrir o mapa e voltar a qualquer trecho/estação já visto (rejogar melhora as estrelas).
- **Modo pequeninos** (Hub): 3 opções grandes em vez de 5 e narração sempre
  ligada — pensado para quem tem 4–6 anos e ainda não lê.
- Toque (≥ 48 px), teclado (setas/WASD + `E`) e D-pad de 64 px na tela.
- Na Aventura também se anda **tocando/clicando no chão** (vai até o ponto,
  com marcador) ou **arrastando** o dedo/mouse; teclado e D-pad cancelam o destino.
- Celular **em pé**: a Aventura pausa e pede para virar o aparelho.
- **PWA instalável / offline** — manifest + service worker (shell e assets).

### Gerar novamente os ícones do PWA

```bash
cd games
bun scripts/gen-icons.mjs public/icons   # ou: npm run icons
```

O script (`scripts/gen-icons.mjs`) desenha e codifica os PNG sem depender de
ImageMagick/PIL — só precisa de Node 18+ (usa `node:zlib`). Ele produz
`apple-touch-icon-180`, `icon-192`, `icon-512` e `icon-maskable-512`.

### Ao publicar uma versão nova

O service worker guarda em cache o shell, os assets e as fontes. Não é mais
preciso trocar a `VERSION` na mão: o `prebuild` (`scripts/bump-sw.mjs`) grava o
**hash do commit** em `public/sw.js` a cada build, então o cache antigo é
invalidado automaticamente quando algo novo é publicado.

## Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · lucide-react · react-confetti
· Vitest 2 + jsdom (testes) · bun (instalação/CI)

## Estado / próximos passos

- ✅ **Fase 0** — correções e fundação (bugs B1–B3, `dvh`/safe area, áudio
  destravado, mudo, reduced-motion, contraste, README, deps mortas).
- ✅ **Fase 1** — mobile + PWA (manifest, service worker, ícones, metas iOS,
  convite de instalação, aviso de orientação, D-pad, confete dosado, câmera
  fora do estado do React).
- ✅ **Fase 2** — áudio e voz: `lib/audio/` (efeitos sintetizados, trilhas
  autorais por cena com camadas adaptativas, narração `speechSynthesis`), botão
  "ouvir" nas perguntas e três botões de som no Hub.
- ✅ **Movimento da Aventura por toque/arraste** (toque no chão anda até o ponto,
  arraste segue o dedo).
- ✅ **Fase 3** — arte e efeitos: tokens de paleta e keyframes, `components/art/`
  (herói com estados, NPC com o motivo da história, 12 motivos, estrela),
  `lib/fx.ts` (partículas, número voando, screen shake), squash/stretch
  (`.ui-press`), transições de tela e estrelas entrando uma a uma.
- ✅ **Fase 4** — gameplay: barra do trecho ("faltam N"), mapa/radar para voltar
  a qualquer trecho, dica do "quase" (a opção errada sai do caminho), estrelas
  explicadas, mundo salvo + retomada, pausa, modo pequeninos (3 opções) e
  **erro com punição única** (sem tripla perda).
- ✅ **Fase 5** — catálogo por **faixa etária (3–4/5–6/7–9) + tipo bíblico
  (AT/NT/AT+NT)**, Hub redesenhado (filtros, seções por faixa, cards "Em
  breve"), **voz nas opções** (chip 🔊 + `speakQueue` no modo pequeninos),
  **rosto/vestes por personagem** (`Npc.look`/`LOOKS`) e **piloto 3–4
  "Encontre a Cena"**. Decisão no brain-jogos (`ADR-003`).
- ✅ **Fases 6–7** — **teatro de cenas** na Aventura: ao falar com o NPC a
  criança escolhe a história e assiste como peça (cortinas, refletores, cenário
  SVG, atos narrados, quiz que confirma sem punir). Catálogo com **36 cenas** em
  `data/scenes.ts` (12 personagens, toda cena com referência NAA) e **22
  cenários** em `components/art/Backdrop.tsx`. O quiz/selo antigo virou o
  caminho "❓ Perguntinha". Decisão no brain-jogos (`ADR-004`).
- ✅ **Fase 8** — **coleção de figurinhas** (`lib/stickers.ts` +
  `CollectionBook.tsx` + botão 💮 no Hub), por personagem, sem bloquear nada.
- ✅ **Fase 9** — **testes e CI**: Vitest + jsdom (5 arquivos, 28 testes),
  CI migrado para **bun** (typecheck + test + build), workflow de
  **auditoria Lighthouse/a11y**, JSON-LD, `sitemap.xml`, `robots.txt` e
  **bump automático da VERSION do service worker**.
- ✅ **Fase 10** — **i18n leve PT/EN** da interface, **fonte Baloo 2
  self-hosted** (woff2, offline) e `sfx.sticker()`.
- ✅ **Fase 11** — **todos os personagens com 4 cenas** (catálogo de **48
  cenas** em `data/scenes.ts`, paridade com o roteiro de Moisés) e os **6 jogos
  "em breve" implementados** nas faixas existentes: Pares da Arca e Que Som é
  Esse? (3–4), A História em Ordem e Mostre o Livro (5–6), Linha do Tempo e
  Caçadores do Versículo (7–9). Novo motor compartilhado `OrderGame.tsx` e
  `lib/minigame.ts`; teste de invariantes do catálogo de jogos.
- ✅ **Fase 12** — **+5 jogos por faixa** (15 novos, total **25**) com mecânicas
  novas: **quebra-cabeça** (troca de peças sobre os cenários), contagem/soma,
  objeto escondido, ligar pares, separar em cestos (AT × NT), achar o igual,
  verdadeiro/falso, quem falou, complete o versículo e sombra do herói. Novos
  motores: `ChoiceGame` (6 variantes), `PuzzleGame`, `CountGame`, `HiddenGame`,
  `ConnectGame`, `SortGame`. Todo jogo é classificado por **faixa + tipo
  (AT/NT/AT+NT)**. O Hub esconde "Em breve" quando não há jogos pendentes.
- ✅ **Fase 13** — **voz melhorada** (escolha automática das melhores vozes
  neurais pt-BR do próprio aparelho + prosódia mais natural; segue grátis, sem
  gravar áudio) e **sistema de níveis** (`lib/levels.ts`): cada nível tem
  estrelas próprias (salvas em `progress`), mapa de níveis 🗺️ e "próximo nível".
  O **Quebra-Cabeça tem 10 níveis** — começa com 4 peças (2×2) e chega a 36
  (6×6). **Todos os jogos têm ≥5 níveis**: os 7 motores (15 jogos), Encontre a
  Cena, Que Som é Esse?, Mostre o Livro, Caçadores, Pares da Arca (4→10 pares),
  A Estrada da Luz e Heróis da Bíblia (6 trechos cada) e Aventura (12 estações).
- ✅ **Fase 14** — **identidade, meninos/meninas e propósitos**: 3 jogos novos —
  **Eu Sou de Deus** (3–4), **Meninos e Meninas de Deus** (5–6) e **Meu
  Propósito** (7–9) — sobre quem somos aos olhos de Deus, o valor que ele dá a
  meninos e meninas, e os propósitos individuais (estudar, trabalhar, casar, ir
  pregar) e da igreja (fazer discípulos, orar, jejuar). Faixas renomeadas
  (Pequeninos · Exploradores · **Íntimos de Deus**) e mascotes novos
  (🌱 🧭 🙏), com **som em toda pergunta e opção**.
- 🟡 **Pendências conhecidas:**
  - **Teste em aparelho real** (iPhone/Android): instalação/offline, FPS da
    Aventura, volume da voz, toque em tela pequena, hit area do chip 🔊.
  - Arte é **SVG inline** em vez de sprites WebP (desvio registrado no segundo
    cérebro) — trocar é substituição localizada em `components/art/`.
  - Cenário estático da Aventura ainda não foi extraído para componente
    memoizado (só faz sentido se o FPS em aparelho real pedir).
  - Revisar o mapeamento tema → versículo de *A Estrada da Luz*.
  - Contraste do rodapé da Estrada (`text-white/50`).
  - Confirmar as faixas (3–4 / 5–6 / 7–9) com o dono — ajuste é só em `FAIXAS`.
- 🟡 Dependências: `vite`/`esbuild` com advisories **de dev server** (não afetam o
  site publicado); atualizar Vite em tarefa dedicada.
