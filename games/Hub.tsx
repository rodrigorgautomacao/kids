import { games } from '../data/games';

interface HubProps {
  onSelectGame: (id: string) => void;
}

export default function Hub({ onSelectGame }: HubProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-purple-500 to-indigo-600 flex flex-col items-center justify-center p-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-10 text-center drop-shadow-lg">
        Jogos da Lição 🎮
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <button
              key={game.id}
              onClick={() => onSelectGame(game.id)}
              className={`${game.color} rounded-3xl p-8 flex flex-col items-center justify-center gap-4
                shadow-xl active:scale-95 hover:scale-105 transition-transform duration-150
                border-4 border-white/40`}
            >
              <Icon className="w-20 h-20 text-white drop-shadow" />
              <span className="text-2xl font-bold text-white text-center leading-tight">
                {game.title}
              </span>
              <span className="text-sm text-white/90 text-center">{game.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
