import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Hub from './components/Hub';
import AttractScreen from './components/arcade/AttractScreen';
import { games } from './data/games';
import {
  ARCADE_MODE,
  ATTRACT_AFTER_MS,
  RETURN_AFTER_MS,
  useIdle,
  useWakeLock,
} from './lib/arcade';
import {
  isMusicMuted,
  isVoiceMuted,
  music,
  sfx,
  subscribeSoundPrefs,
  unlockAudio,
  voice,
} from './lib/audio';

/** Abre um jogo direto por link (`?jogo=a-grande-jornada`) — útil no evento. */
function gameFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search);
    const id = q.get('jogo') ?? q.get('game');
    return id && games.some((g) => g.id === id && g.status === 'pronto') ? id : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(() => gameFromUrl());
  // Modo Sala de Jogos: abre no letreiro de atração e volta para ele sozinho.
  const [attract, setAttract] = useState(() => ARCADE_MODE && !gameFromUrl());
  // Quiosque: a tela não apaga no meio da fila do FestKids.
  useWakeLock(ARCADE_MODE);

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
    // No quiosque, abrir jogo é "inserir a ficha" — o som que o salão conhece.
    if (ARCADE_MODE) sfx.coin();
    else sfx.swoosh();
    setActiveGameId(id);
  }, []);

  const closeGame = useCallback(() => {
    voice.stopSpeaking();
    sfx.swoosh();
    setActiveGameId(null);
  }, []);

  // Quiosque: sem toque por 75 s no menu → letreiro chama de novo.
  useIdle(ATTRACT_AFTER_MS, () => setAttract(true), ARCADE_MODE && !activeGameId);
  // Sem toque por 4 min DENTRO do jogo → devolve ao menu (a criança foi embora).
  useIdle(RETURN_AFTER_MS, closeGame, ARCADE_MODE && Boolean(activeGameId));

  const startPlaying = useCallback(() => {
    // Primeiro gesto do quiosque: destrava o áudio antes do "start".
    unlockAudio();
    sfx.start();
    setAttract(false);
  }, []);

  const activeGame = games.find((g) => g.id === activeGameId);
  const GameComponent = activeGame?.component ?? null;
  // Jogos marcados como `lazy` no catálogo (os de leitura) não entram no bundle
  // inicial: só quem abre o jogo baixa a tela. `React.lazy` é memoizado por
  // módulo, então abrir de novo não refaz o download.
  const LazyComponent = activeGame?.lazy ? lazy(activeGame.lazy) : null;

  if (GameComponent !== null || LazyComponent !== null) {
    // key força a remontagem do jogo a cada entrada → estado sempre limpo.
    // O wrapper dá a transição de entrada (sem `fill-mode`, para não virar um
    // containing block dos elementos `fixed` do jogo).
    return (
      <div key={activeGameId} className="screen-in">
        {LazyComponent ? (
          <Suspense
            fallback={
              // Fallback com a mesma altura da tela e sem texto piscando: a
              // criança não deve ver "carregando" no lugar do jogo.
              <div className="flex min-h-screen-safe w-full items-center justify-center bg-amber-50" />
            }
          >
            <LazyComponent onExit={closeGame} />
          </Suspense>
        ) : GameComponent ? (
          <GameComponent onExit={closeGame} />
        ) : null}
      </div>
    );
  }

  if (attract) {
    return (
      <div className="screen-in">
        <AttractScreen onStart={startPlaying} />
      </div>
    );
  }

  return (
    <div className="screen-in">
      <Hub onSelectGame={openGame} />
    </div>
  );
}
