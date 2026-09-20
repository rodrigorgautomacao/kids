import { useState } from 'react';
import Hub from './components/Hub';
import { games } from './data/games';

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  const activeGame = games.find((g) => g.id === activeGameId);

  if (activeGame) {
    const GameComponent = activeGame.component;
    return <GameComponent onExit={() => setActiveGameId(null)} />;
  }

  return <Hub onSelectGame={setActiveGameId} />;
}
