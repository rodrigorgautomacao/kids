import { useState } from 'react';
import Hub from './components/Hub';
import { games } from './data/games';

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const activeGame = games.find((g) => g.id === activeGameId);

  if (activeGame) {
    const GameComponent = activeGame.component;
    // key força a remontagem do jogo a cada entrada → estado sempre limpo
    return <GameComponent key={activeGame.id} onExit={() => setActiveGameId(null)} />;
  }

  return <Hub onSelectGame={setActiveGameId} />;
}