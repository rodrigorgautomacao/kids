# 🎮 Jogos da Lição — Arcade Kids

Mini-jogos bíblicos web para crianças de **4 a 9 anos** (React + TypeScript +
Tailwind CSS + Vite). Roda no **computador, tablet, smartphone e iPhone**.
Projeto de **ministério, gratuito e sem conta de criança**.

Publicado em GitHub Pages: `https://rodrigorgautomacao.github.io/kids/`

## Jogos disponíveis

| # | Capítulo | Mecânica | Níveis |
|---|----------|----------|--------|
| 01 | **A Estrada da Luz** | Quiz de escolhas: fazer o certo aproxima da Luz | 3 trechos × 10 perguntas |
| 02 | **Heróis da Bíblia** | Quiz de personagens e livros, com 3 vidas por trecho | 3 trechos × 10 perguntas |
| 03 | **Aventura na Bíblia** | Mundo 2D: andar, conversar com os heróis, coletar estrelas e responder | 12 estações |

Cada pergunta/estação cita a **referência bíblica** (`Livro cap.vers (VERSÃO)`).
A versão é a da fonte quando atestada; caso contrário, **NAA**
(Nova Almeida Atualizada, SBB).

O Hub tem visual de fliperama: cada capítulo é um "cartucho". O progresso fica
no `localStorage` do aparelho (estrelas, níveis e recorde por capítulo).

## Rodar localmente

```bash
cd games
bun install        # ou: npm ci
bun run dev        # → http://localhost:5173
```

Build de produção e checagens:

```bash
bun run build      # tsc && vite build → games/dist
bun run preview    # serve o build localmente
bun run typecheck  # TypeScript estrito (tsc --noEmit)
```

> Neste ambiente use **`bun`**: o `npm` do PATH é o do Windows e falha em
> caminhos UNC. No CI (Linux) o `npm ci` normal funciona.

## Estrutura

```
kids/
├── .github/workflows/deploy.yml   ← GitHub Actions → GitHub Pages
└── games/                         ← raiz do app Vite
    ├── index.html
    ├── vite.config.ts             ← base: '/kids/' (GitHub Pages)
    ├── tailwind.config.js
    ├── scripts/gen-icons.mjs      ← gera os PNG do PWA (sem dependências)
    ├── public/
    │   ├── manifest.webmanifest   ← nome, ícones, standalone, tema
    │   ├── sw.js                  ← offline: shell + assets
    │   └── icons/                 ← 180/192/512/maskable (gerados)
    └── src/
        ├── App.tsx                ← alterna Hub ⇄ jogo ativo (+ transição de tela)
        ├── data/games.ts          ← REGISTRO dos capítulos (adicione aqui!)
        ├── index.css              ← tailwind + dvh/safe-area/ui-press/reduced-motion
        ├── lib/
        │   ├── audio/             ← efeitos, trilhas adaptativas e narração
        │   │   ├── context.ts     ← Web Audio, buses, ducking, unlock iOS
        │   │   ├── preferences.ts ← mudo de efeitos/música/narração
        │   │   ├── sfx.ts         ← efeitos sintetizados (sem arquivos)
        │   │   ├── music.ts       ← trilhas por cena + camadas de intensidade
        │   │   ├── voice.ts       ← speechSynthesis (narração)
        │   │   └── index.ts       ← re-exports (+ `sfx`, `music`, `voice`)
        │   ├── progress.ts        ← progresso, estrelas, unlocks, recordes
        │   ├── prefs.ts           ← modo pequeninos, 1ª vez, mundo salvo
        │   ├── fx.ts              ← partículas, número voando, screen shake
        │   ├── motion.ts          ← prefers-reduced-motion
        │   ├── device.ts          ← standalone / iPhone / celular em pé
        │   └── confetti.ts        ← confete dosado por aparelho
        └── components/
            ├── GameShell.tsx      ← casca comum (voltar, pausa, som, título)
            ├── LevelHUD.tsx       ← Nível x/N + barra do trecho + "faltam N"
            ├── LevelDone.tsx      ← fim de nível/capítulo + explicação das ⭐
            ├── LevelMap.tsx       ← mapa de trechos/estações (rejogar)
            ├── PauseOverlay.tsx   ← pausa (continuar / recomeçar / sair)
            ├── HandHint.tsx       ← onboarding sem texto (mãozinha animada)
            ├── Hub.tsx            ← tela de entrada arcade
            ├── InstallHint.tsx    ← "Adicionar à Tela de Início"
            ├── RotateHint.tsx     ← aviso "vire o aparelho" (celular em pé)
            ├── art/               ← arte SVG própria (substitui emoji de elenco)
            │   ├── Hero.tsx       ← herói, com estados idle/walk/happy/sad
            │   ├── Npc.tsx        ← personagem com o motivo da história no peito
            │   ├── Motifs.tsx     ← 12 motivos (arca, peixe, leão, coroa…)
            │   └── StarItem.tsx   ← estrela coletável
            └── games/
                ├── GameEstradaDaLuz.tsx
                ├── GameHeroisDaBiblia.tsx
                └── GameAventuraBiblia.tsx
```

## Como adicionar um novo capítulo

1. Crie `src/components/games/MeuJogo.tsx` exportando `({ onExit }) => JSX`.
2. Importe em `src/data/games.ts` e acrescente um objeto ao array `games`
   (`id`, `title`, `subtitle`, `sinopse`, `icon`, `color`, `totalLevels`, `component`).
3. Pronto — aparece automaticamente no Hub. **A ordem do array = ordem da jornada.**

Regras de conteúdo (referência bíblica obrigatória, tom de graça, versão NAA):
ver o segundo cérebro em `~/.config/opencode/brain-jogos/`.

## Deploy automático

`.github/workflows/deploy.yml` roda em todo push para `main`:
checkout → `setup-node@v4` (Node 20) → `npm ci` → `npm run build` →
`upload-pages-artifact@v3` (`games/dist`) → `deploy-pages@v4`.

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

O service worker guarda em cache o shell e os assets. Se você mudar algo que
precise invalidar cache antigo, **troque o `VERSION` em `public/sw.js`**
(ex.: `kids-v1` → `kids-v2`).

## Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · lucide-react · react-confetti

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
- 🟡 **Pendências conhecidas:**
  - **Teste em aparelho real** (iPhone/Android): instalação/offline, FPS da
    Aventura, volume da voz, toque em tela pequena.
  - Arte é **SVG inline** em vez de sprites WebP (desvio registrado no segundo
    cérebro) — trocar é substituição localizada em `components/art/`.
  - Cenário estático da Aventura ainda não foi extraído para componente
    memoizado (só faz sentido se o FPS em aparelho real pedir).
  - Revisar o mapeamento tema → versículo de *A Estrada da Luz*.
  - Contraste do rodapé da Estrada (`text-white/50`).
- 🟡 Dependências: `vite`/`esbuild` com advisories **de dev server** (não afetam o
  site publicado); atualizar Vite em tarefa dedicada.
