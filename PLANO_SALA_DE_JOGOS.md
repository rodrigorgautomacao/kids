# Sala de Jogos · FestKids — plano e upgrade de fliperama

> **Evento:** sábado, 31/10/2026 · sala de jogos digitais do FestKids
> **App:** `https://rodrigorgautomacao.github.io/kids/`
> **Modo do evento:** `?arcade=1` (liga o quiosque de fliperama)
> **Status:** implementado e validado no gate (`typecheck` + **152 testes** + `build`)

---

## 1. O que mudou (resumo)

O app inteiro passou a parecer **um fliperama**, não uma página com adesivos:

| Antes | Agora |
|---|---|
| Home clara, estilo "app escolar" | **Lobby de fliperama**: gabinete escuro, letreiro neon, lâmpadas piscando, piso de ladrilho |
| Cards brancos | **Cartuchos** escuros com tipo bíblico curto, estrelas, recorde 🏆 e botão `JOGAR ▶` de arcade |
| Jogo em tela cheia sem moldura | **Gabinete**: marquee em cima, tela CRT (scanlines + vinheta) e **deck de controles embaixo** |
| Botão "Voltar" no canto superior (longe do dedo) | **Deck inferior** com `◀ Voltar`, `⏸ Pausa` e `🔊 Som` em todos os 31 jogos |
| Abria direto no catálogo | **Attract mode**: letreiro "TOQUE PARA JOGAR" com ficha e mascotes |
| Gate de instalação do PWA antes de jogar | No modo sala **nunca** pede instalação — o tablet do evento abre o jogo na hora |
| Filtro voltava para 3–4 anos | Faixa e tipo escolhidos **ficam salvos** entre partidas |
| Tablet apagava na fila | **Screen Wake Lock** segura a tela acesa (quando o navegador permite) |
| Ninguém voltava ao menu | **Retorno automático**: 75 s no lobby → letreiro; 4 min no jogo → menu |

### Jogabilidade (o que a criança sente)

- **Ficha e start**: som de moeda ao abrir o jogo e "start" ao começar a sessão.
- **"Jogo surpresa" 🎲**: sorteia um jogo do filtro atual — perfeito para fila.
- **Recorde no cartucho**: 🏆 aparece quando o jogo já pontuou, incentivando repetir.
- **Alvos de toque**: controles do gabinete com **44–48 px**; filtros e cards grandes.
- **Conteúdo centralizado** na tela (sem aquele vazio embaixo) e rolagem interna
  quando o conteúdo é maior que o gabinete.
- **Texto não fica embaixo do botão de som** nos jogos de pergunta (padding à direita).
- **Cartões de resposta cabem em telefone**: as 3 opções do “Encontre a Cena”
  (e o texto do progresso) não são mais cortadas em 390 px de largura.
- **Tela cheia** no modo sala (botão `⛶`) para esconder a barra do navegador.
- **Link direto**: `?jogo=a-grande-jornada` abre um jogo específico (útil para
  deixar o tablet já no jogo campeão).

---

## 2. Como ligar e desligar o modo sala

| O que fazer | URL |
|---|---|
| **Ligar** o fliperama (fica salvo no tablet) | `.../kids/?arcade=1` |
| Atalhos aceitos | `?sala`, `?festkids`, `?quiosque`, `?kiosk` |
| **Desligar** e voltar ao app normal | `.../kids/?arcade=0` |
| Abrir um jogo direto | `.../kids/?arcade=1&jogo=<id>` |
| Sair pelo próprio app | rodapé → **3 toques** em “Sala de Jogos · FestKids” |

> O modo fica gravado em `localStorage`. Por isso o `?arcade=0` é a saída limpa
> depois do evento.

IDs úteis para link direto:
`a-grande-jornada`, `aventura-biblia`, `encontre-a-cena`, `pares-da-arca`,
`estrada-da-luz`, `herois-da-biblia`, `devocional-da-semana`, `estudo-da-semana`.

---

## 3. Passo a passo para montar no sábado

1. **Antes de sair de casa** (com internet): abra o app no tablet, deixe carregar
   por ~30 s para o service worker guardar tudo, e teste em **modo avião**. O
   primeiro load precisa de rede; depois o PWA abre offline.
2. Abra `.../kids/?arcade=1`.
3. Toque em **⛶** (tela cheia) e gire o tablet para **paisagem**.
4. Confira: volume no máximo, **Não Perturbe** ligado, brilho alto, carregador
   conectado.
5. Deixe o tablet no letreiro. A tela não apaga enquanto o navegador permitir
   (Wake Lock); se o aparelho tiver bloqueio de tela agressivo, aumente o tempo
   em Ajustes.
6. Cada criança pode ir direto ao **JOGO SURPRESA** ou escolher o cartucho.

### Checklist de 30 segundos por tablet

- [ ] Abriu no letreiro “TOQUE PARA JOGAR”
- [ ] Tocou → viu o lobby com os cartuchos
- [ ] Abriu um jogo → viu marquee, tela e deck embaixo
- [ ] `Voltar` volta ao lobby **mantendo a faixa escolhida**
- [ ] Som de ficha ao abrir o jogo
- [ ] Sem pedido de instalação no meio da partida
- [ ] Depois de ~75 s parado, voltou ao letreiro

---

## 4. Roteiro de teste rápido (10 min, antes do evento)

1. **3–4 anos:** abra `Encontre a Cena`. Toque na figura certa; erre de propósito
   (o erro é gentil).
2. **5–6 anos:** abra `Aventura na Bíblia`. Ande pelo chão tocando; confira o
   deck embaixo sem cobrir o mapa.
3. **7–9 anos:** abra `A Grande Jornada`. Pule, acenda a luz (🙏), pause pelo
   deck e volte.
4. **Leitura:** abra `Devocional da Semana`; role até o fim e volte.
5. Deixe parado no lobby por 75 s e confirme o letreiro.

---

## 5. Onde está cada coisa (mapa técnico)

```
games/src/
├── index.css                     ← tokens do gabinete (marquee, CRT, deck, botões)
├── tailwind.config.js            ← paleta `arcade` + animações da ficha/halo
├── App.tsx                       ← attract + retorno por inatividade + link ?jogo=
├── lib/arcade.ts                 ← modo sala, idle, wake lock
├── lib/prefs.ts                  ← filtros de faixa/tipo salvos
├── lib/audio/sfx.ts              ← sfx.coin() e sfx.start()
├── components/arcade/
│   ├── ArcadeMarquee.tsx         ← letreiro com lâmpadas (lobby e jogo)
│   └── AttractScreen.tsx         ← “TOQUE PARA JOGAR”
├── components/Hub.tsx            ← lobby: cartuchos, filtros, surpresa, 3 toques
└── components/GameShell.tsx      ← gabinete de TODOS os jogos
```

### Decisões de engenharia (para não regredir)

- **Nada de `transform`/`filter` persistente** no contêiner do jogo: os
  `position: fixed` internos (confete, véu) passariam a se posicionar por ele.
  Por isso a transição de tela continua sem `fill-mode`.
- **`h-screen-safe` no gabinete** (não `min-h`): marquee e deck ficam sempre
  visíveis; o conteúdo rola por dentro (`.arcade-content`).
- **`justify-content: safe center`**: centraliza o jogo quando sobra espaço e
  volta ao topo quando falta — sem cortar o começo.
- **Modo sala nunca mostra o gate de instalação** (`installable` desligado).
- **Attract/retorno só no modo sala**; o uso normal em casa não muda de fluxo.
- **`prefers-reduced-motion`** desliga lâmpadas, pulos e transições (regra global
  que já existia).

---

## 6. Limitações conhecidas / próximos passos

- **Instalação offline é manual**: o PWA não tem cache de 100% do áudio de uma
  vez; abra os jogos que serão usados antes do evento para aquecer o cache.
- **Wake Lock** depende do navegador; em iPad antigo pode não segurar a tela.
- **Sem placar entre crianças**: o progresso é do aparelho (localStorage), não
  há ranking nominal — decisão de LGPD/minimização mantida.
- **Bundle**: main ~175 kB gzip (+5 kB); o modo sala é CSS/JS pequeno.
- **Próximo passo natural**: transformar o resultado em `ADR-013` no
  `brain-jogos` (feito) e, se o evento pedir, criar um “modo campeonato” com
  fila e tempo por partida.

---

## 7. Validação executada

```bash
cd games
bun run typecheck   # ok
bunx vitest run     # 17 arquivos / 152 testes
bun run build       # ok (dist/ gerado)
```

Screenshots de referência gerados em navegador headless (lobby, attract,
plataforma, aventura, leitura e mobile).
