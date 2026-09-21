import { useCallback, useEffect, useState } from 'react';
import Hub from './components/Hub';
import { games } from './data/games';
import {
  isMusicMuted,
  isVoiceMuted,
  music,
  sfx,
  subscribeSoundPrefs,
  unlockAudio,
  voice,
} from './lib/audio';

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // iOS/Safari só libera áudio (e a síntese de voz) dentro de um gesto do
  // usuário. Destravamos no primeiro toque/clique/tecla e revalidamos quando a
  // aba volta ao foco; ao esconder, pausamos tudo para não tocar em segundo plano.
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      voice.primeVoice();
      music.sync();
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    const onVisibility = () => {
      if (document.hidden) {
        music.pause();
        voice.stopSpeaking();
      } else {
        unlockAudio();
        music.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Uma trilha por tela: menu ≠ jogo.
  useEffect(() => {
    music.play(activeGameId ? 'game' : 'hub');
  }, [activeGameId]);

  // Reflexo imediato das preferências: desmutar música/voz volta a tocar na hora.
  useEffect(
    () =>
      subscribeSoundPrefs(() => {
        if (isMusicMuted()) music.pause();
        else music.sync();
        if (isVoiceMuted()) voice.stopSpeaking();
      }),
    [],
  );

  // Tick discreto em qualquer botão do app. Como isto roda depois do handler do
  // React, o clique que desliga o som já sai silencioso.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('button')) sfx.click();
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const openGame = useCallback((id: string) => {
    sfx.swoosh();
    setActiveGameId(id);
  }, []);

  const closeGame = useCallback(() => {
    voice.stopSpeaking();
    sfx.swoosh();
    setActiveGameId(null);
  }, []);

  const activeGame = games.find((g) => g.id === activeGameId);

  if (activeGame) {
    const GameComponent = activeGame.component;
    // key força a remontagem do jogo a cada entrada → estado sempre limpo.
    // O wrapper dá a transição de entrada (sem `fill-mode`, para não virar um
    // containing block dos elementos `fixed` do jogo).
    return (
      <div key={activeGame.id} className="screen-in">
        <GameComponent onExit={closeGame} />
      </div>
    );
  }

  return (
    <div className="screen-in">
      <Hub onSelectGame={openGame} />
    </div>
  );
}
