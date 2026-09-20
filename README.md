# 🎮 Jogos da Lição — Arcade Kids

Mini-jogos web interativos para crianças de 4 a 6 anos (React + TypeScript + Tailwind CSS + Vite), pensados para tablets e telemóveis.

Ligado em **GitHub Pages**: `https://rodrigorgautomacao.github.io/kids/`

## Jogos disponíveis

| # | Jogo | Mecânica |
|---|------|----------|
| 01 | **A Balança das Escolhas** | Arrastar o coração brilhante para a balança (drag-and-drop touch) |
| 02 | **O Livro da Vida** | Tocar nas letras flutuantes A·M·O·R para completar a palavra |
| 03 | **Conte as Estrelas** | Tocar e contar 5 estrelas para acendê-las no céu |

O Hub tem um visual estilo fliperama/Neo Geo: cada jogo é um "cartucho" colorido, um toque e ele abre.

## Estrutura

```
kids/
├── .github/workflows/deploy.yml   ← pipeline GitHub Actions → gh-pages
└── games/                         ← raiz do app Vite
    ├── index.html
    ├── vite.config.ts             ← base: '/kids/' (GitHub Pages)
    ├── tailwind.config.js
    └── src/
        ├── App.tsx                ← roteamento simples Hub ⇄ jogos
        ├── data/games.ts          ← registo de jogos (adiciona aqui!)
        └── components/
            ├── GameShell.tsx      ← casca comum (voltar + título)
            ├── Hub.tsx            ← tela de entrada arcade
            └── games/
                ├── GameBalanca.tsx
                ├── GameLivroDaVida.tsx
                └── GameEstrelas.tsx
```

## Rodar localmente

```bash
cd games
npm install        # ou pnpm install
npm run dev        # → http://localhost:5173
```

Build de produção:

```bash
npm run build      # gera games/dist
npm run preview    # serve o build localmente
npm run typecheck  # TypeScript estrito
```

## Como adicionar um novo jogo

Depois de criar o componente com os ficheiros e a UI, basta:

1. Crie `src/components/games/MeuJogo.tsx` exportando `({ onExit }) => JSX`.
2. Importe-o em `src/data/games.ts` e acrescente um objeto ao array `games`
   (id, título, subtítulo, ícone Lucide e cor do cartucho).
3. Pronto — o jogo aparece automaticamente no Hub. Nada mais muda.

## Deploy automático (GitHub Pages)

A pipeline `.github/workflows/deploy.yml` roda em todo `push` para `main`:
checkout → `setup-node@v4` (Node 20) → `npm ci` → `vite build` →
`upload-pages-artifact@v3` (artefato `games/dist`) → `deploy-pages@v4`.

**Passo único manual (só na primeira vez):**

1. No GitHub: **Settings → Pages → Build and deployment → Source**.
2. Selecione **"GitHub Actions"** (em vez de "Deploy from a branch").
3. A URL passa a ser `https://rodrigorgautomacao.github.io/kids/`.

Se o Pages já estiver ativo vindos de uma branch, basta trocar para
"GitHub Actions" — o deploy roda a cada push novo (ou manualmente em
**Actions → Deploy to GitHub Pages → Run workflow**).

## Stack

React 18 · TypeScript 5 · Vite 5 · Tailwind CSS 3 · @dnd-kit/core (touch drag)
· react-confetti · lucide-react