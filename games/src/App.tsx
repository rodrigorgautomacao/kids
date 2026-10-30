import { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import Hub from './components/Hub';
import AttractScreen from './components/arcade/AttractScreen';
import AgeSelectScreen from './components/arcade/AgeSelectScreen';
import { games, type Faixa } from './data/games';
import { ehFaixa } from './lib/faixa';
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

/**
 * Telas da sala: `#inicio` (letreiro) → `#idade` → `#jogos/3-4`.
 *
 * A rota mora no hash de propósito: voltar pelo botão do navegador funciona,
 * o link da fila do evento continua valendo e nada de router novo no bundle.
 */
type Route =
  | { screen: 'welcome' }
  | { screen: 'idade' }
  | { screen: 'jogos'; faixa: Faixa };

function parseRoute(hash: string): Route {
  const parts = hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((part) => part.toLowerCase());
  if (parts[0] === 'idade') return { screen: 'idade' };
  if (parts[0] === 'jogos' && ehFaixa(parts[1])) return { screen: 'jogos', faixa: parts[1] };
  return { screen: 'welcome' };
}

function currentHash(): string {
  return typeof window === 'undefined' ? '' : window.location.hash;
}

function navigate(hash: string) {
  if (typeof window === 'undefined') return;
  if (window.location.hash === hash) return;
  window.location.hash = hash;
}

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(() => gameFromUrl());
  const [route, setRoute] = useState<Route>(() => parseRoute(currentHash()));
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

  // Voltar/avançar do navegador, e todo link de campanha, passam por aqui.
  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(currentHash()));
      // Trocar de tela com um jogo aberto significa que saíram dele.
      setActiveGameId(null);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
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
    // Volta para a faixa em que a criança estava (#jogos/5-6), não para o topo.
    setActiveGameId(null);
  }, []);

  // Quiosque: sem toque por 75 s no menu → o letreiro chama de novo.
  useIdle(
    ATTRACT_AFTER_MS,
    () => navigate('#inicio'),
    ARCADE_MODE && !activeGameId && route.screen !== 'welcome',
  );
  // Sem toque por 4 min DENTRO do jogo → devolve ao menu (a criança foi embora).
  useIdle(RETURN_AFTER_MS, closeGame, ARCADE_MODE && Boolean(activeGameId));

  const startPlaying = useCallback(() => {
    // Primeiro gesto do quiosque: destrava o áudio antes do "start".
    unlockAudio();
    sfx.start();
    navigate('#idade');
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

  if (route.screen === 'welcome') {
    return (
      <div key="inicio" className="screen-in">
        <AttractScreen onStart={startPlaying} />
      </div>
    );
  }

  if (route.screen === 'idade') {
    return (
      <div key="idade" className="screen-in">
        <AgeSelectScreen
          onSelect={(faixa) => navigate(`#jogos/${faixa}`)}
          onBack={() => navigate('#inicio')}
        />
      </div>
    );
  }

  return (
    <div key={`jogos-${route.faixa}`} className="screen-in">
      <Hub
        faixa={route.faixa}
        onSelectGame={openGame}
        onBack={() => navigate('#idade')}
      />
    </div>
  );
}
