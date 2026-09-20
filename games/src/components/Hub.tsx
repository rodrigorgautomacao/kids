import { games } from '../data/games';

interface HubProps {
  onSelectGame: (id: string) => void;
}

/**
 * Tela de entrada estilo "fliperama"/Neo Geo: cartuchos coloridos,
 * um toque e o jogo abre. Fácil de estender — novos jogos aparecem
 * automaticamente no grid (basta adicionar em src/data/games.ts).
 */
export default function Hub({ onSelectGame }: HubProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#150b2e]">
      {/* brilhos de fundo (estilo cabinet de fliperama) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-28 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(0deg,transparent,transparent_34px,#fff_34px,#fff_36px)]" />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <header className="text-center">
          <p className="font-mono text-xs tracking-[0.35em] text-fuchsia-300 uppercase">
            Arcade Kids
          </p>
          <h1 className="mt-2 bg-gradient-to-r from-yellow-300 via-pink-400 to-cyan-300 bg-clip-text text-5xl font-black italic text-transparent drop-shadow-[0_4px_0_rgba(0,0,0,0.45)] sm:text-6xl">
            Jogos da Lição
          </h1>
          <p className="mt-3 text-lg text-white/80">
            Escolhe um cartucho e diverte-te! 🎮
          </p>
        </header>

        <div className="grid w-full max-w-3xl grid-cols-1 content-center gap-6 sm:grid-cols-3">
          {games.map((game, index) => {
            const Icon = game.icon;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => onSelectGame(game.id)}
                aria-label={`Jogar ${game.title}`}
                className={`group relative flex flex-col items-center justify-center gap-3 ${game.color} rounded-3xl border-4 border-white/40 p-7 text-center shadow-[0_12px_0_rgba(0,0,0,0.45)] transition-transform duration-150 hover:scale-[1.04] active:scale-95 active:shadow-[0_6px_0_rgba(0,0,0,0.45)]`}
              >
                {/* brilho superior do cartucho */}
                <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 rounded-t-2xl bg-white/20" />
                <span className="absolute top-3 left-4 font-mono text-xs font-bold tracking-widest text-white/80">
                  JOGO {String(index + 1).padStart(2, '0')}
                </span>

                <span className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/40 bg-white/25">
                  <Icon className="h-14 w-14 text-white drop-shadow" />
                </span>

                <span className="text-2xl leading-tight font-extrabold text-white drop-shadow-md">
                  {game.title}
                </span>
                <span className="text-sm font-medium text-white/85">{game.subtitle}</span>

                <span className="mt-1 rounded-full bg-black/30 px-5 py-1.5 text-sm font-extrabold text-white transition-transform group-active:scale-90">
                  ▶ JOGAR
                </span>
              </button>
            );
          })}
        </div>

        <p className="animate-bounce text-lg font-bold text-cyan-200">
          ▼ toca para começar ▼
        </p>
      </main>
    </div>
  );
}