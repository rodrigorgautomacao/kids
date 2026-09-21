import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { Motif, StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { chunkLevels, levelMapItems, useLevelState } from '../../lib/levels';
import { isSmallKidsMode } from '../../lib/prefs';

interface Tile {
  id: string;
  label: string;
}

interface Round {
  dica: string;
  tiles: [Tile, Tile, Tile];
  certo: string;
  ref: string;
  msg: string;
}

const ROUNDS: Round[] = [
  { dica: 'Toque na arca grande do Noé!', tiles: [{ id: 'noe', label: 'Arca' }, { id: 'jonas', label: 'Peixe' }, { id: 'natal', label: 'Estrela' }], certo: 'noe', ref: 'Gênesis 6.14 (NAA)', msg: 'A arca salvou Noé e os animais! 🚢' },
  { dica: 'Onde está o grande peixe do Jonas?', tiles: [{ id: 'natal', label: 'Estrela' }, { id: 'jonas', label: 'Peixe' }, { id: 'elias', label: 'Fogo' }], certo: 'jonas', ref: 'Jonas 2.1 (NAA)', msg: 'Jonas ficou 3 dias dentro do peixe e depois foi solto! 🐟' },
  { dica: 'Toque na estrela do natal!', tiles: [{ id: 'natal', label: 'Estrela' }, { id: 'noe', label: 'Arca' }, { id: 'davi', label: 'Cajado' }], certo: 'natal', ref: 'Mateus 2.2 (NAA)', msg: 'A estrela guiou os reis até Jesus! ⭐' },
  { dica: 'Onde está o grande cajado de Davi?', tiles: [{ id: 'davi', label: 'Cajado' }, { id: 'moises', label: 'Bastão' }, { id: 'paulo', label: 'Livro' }], certo: 'davi', ref: '1 Samuel 17.40 (NAA)', msg: 'Davi usou um cajado e cinco pedras para vencer o Gigante Golias! 🪨' },
  { dica: 'Toque no bastão que abriu o mar!', tiles: [{ id: 'moises', label: 'Bastão' }, { id: 'davi', label: 'Cajado' }, { id: 'eliseu', label: 'Vassoura' }], certo: 'moises', ref: 'Êxodo 14.21 (NAA)', msg: 'Moisés ergueu o bastão e o mar se abriu! 🌊' },
  { dica: 'Onde está o fogo do céu do Elias?', tiles: [{ id: 'elias', label: 'Fogo' }, { id: 'eliseu', label: 'Vassoura' }, { id: 'paulo', label: 'Livro' }], certo: 'elias', ref: '1 Reis 18.38 (NAA)', msg: 'O fogo desceu do céu e provou que Deus é Deus! 🔥' },
  { dica: 'Toque na vassoura do Eliseu!', tiles: [{ id: 'eliseu', label: 'Vassoura' }, { id: 'elias', label: 'Fogo' }, { id: 'natal', label: 'Estrela' }], certo: 'eliseu', ref: '2 Reis 2.13 (NAA)', msg: 'Eliseu recebeu o manto de Elias e fez muitos milagres! ✨' },
  { dica: 'Onde está o livro de Paulo?', tiles: [{ id: 'paulo', label: 'Livro' }, { id: 'moises', label: 'Bastão' }, { id: 'davi', label: 'Cajado' }], certo: 'paulo', ref: 'Efésios 2.8 (NAA)', msg: 'Paulo escreveu cartas cheias de amor para as igrejas! 📖' },
  { dica: 'Toque no peixe grande do Jonas de novo!', tiles: [{ id: 'paulo', label: 'Livro' }, { id: 'jonas', label: 'Peixe' }, { id: 'eliseu', label: 'Vassoura' }], certo: 'jonas', ref: 'Jonas 1.17 (NAA)', msg: 'Jonas aprendeu que Deus nunca desiste de nós! 💛' },
  { dica: 'Toque no leão de Daniel!', tiles: [{ id: 'daniel', label: 'Leão' }, { id: 'davi', label: 'Cajado' }, { id: 'noe', label: 'Arca' }], certo: 'daniel', ref: 'Daniel 6.16 (NAA)', msg: 'Deus protegeu Daniel na cova dos leões! 🦁' },
];

const GAME_ID = 'encontre-a-cena';
const PTS_ACERTO = 100;
const LEVELS = chunkLevels(ROUNDS, 2);

export default function GameEncontreACena({ onExit }: { onExit: () => void }) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(GAME_ID, LEVELS);
  const round = ls.round;
  const [tileOrder, setTileOrder] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(GAME_ID);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (!round) return;
    setTileOrder(shuffle(round.tiles));
    setPicked(null);
    setWon(false);
    setMsg(null);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !round) return;
    const t = window.setTimeout(() => voice.speak(round.dica), 400);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !smallKids || !round) return;
    const t = window.setTimeout(() => {
      voice.speakQueue(round.tiles.map((t) => t.label));
    }, Math.min(3500, Math.max(2200, round.dica.length * 32)));
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase, smallKids]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(tile: Tile, ev: { currentTarget: HTMLElement }) {
    if (picked || won || ls.phase !== 'playing' || !round) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(tile.id);

    if (tile.id === round.certo) {
      sfx.correct();
      setWon(true);
      setScore((s) => s + PTS_ACERTO);
      burst(stageRef.current, x, y, { kind: 'spark', count: 18 });
      ring(stageRef.current, x, y, '#facc15', 42);
      flyNumber(stageRef.current, x, y, `+${PTS_ACERTO}`);
      setMsg({ text: round.msg, good: true, ref: round.ref });
      voice.speak(round.msg);
      later(() => {
        ls.completeRound();
        setWon(false);
      }, 2500);
    } else {
      sfx.wrong();
      ls.addWrong();
      shake(el);
      setMsg({ text: 'Quase! Tenta de novo! ✊', good: false });
      voice.speak('Quase! Tenta de novo!');
      later(() => setPicked(null), 900);
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-100 via-rose-50 to-sky-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={ls.stars}
          wrong={ls.wrong}
          onNext={ls.hasNextLevel ? ls.goNextLevel : undefined}
          onExit={onExit}
          onOpenMap={() => ls.setMapOpen(true)}
        />
        <p className="-mt-1 text-sm font-black text-amber-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
        >
          Jogar de novo 🔁
        </button>
        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(GAME_ID, LEVELS, (i) => `Nível ${i + 1}`)}
            onPick={(id) => ls.goToLevel(LEVELS.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    );
  }

  if (!round) return null;

  return (
    <GameShell
      title="Encontre a Cena"
      subtitle="Ouça a dica e toque na figura certa!"
      onExit={onExit}
      bg="bg-gradient-to-b from-amber-100 via-rose-50 to-sky-200"
      titleClass="text-amber-600"
    >
      <div className="relative flex w-full flex-col items-center gap-5 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={ls.levelIdx + 1} totalLevels={LEVELS.length} step={ls.roundIdx + 1} steps={ls.level.rounds.length} />
          <div className="flex items-center gap-2">
            {score > 0 ? (
              <span className="ui-press flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-sm font-black text-amber-900 shadow">
                <StarItem size={18} /> {score}
              </span>
            ) : null}
            {record > 0 ? (
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-amber-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                sfx.pop();
                ls.setMapOpen(true);
              }}
              className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-amber-700 shadow"
            >
              🗺️
            </button>
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-xl font-black text-indigo-900">{round.dica}</p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(round.dica);
            }}
            aria-label="Ouvir dica de novo"
            className="ui-press absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-sky-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-4">
          {tileOrder.map((tile) => (
            <button
              key={tile.id}
              type="button"
              disabled={won}
              onClick={(ev) => handlePick(tile, ev)}
              className={`ui-press flex flex-col items-center gap-3 rounded-3xl border-4 bg-white px-4 py-6 shadow-lg transition-transform ${
                picked === tile.id && tile.id === round.certo
                  ? 'animate-pop border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:scale-105'
              } ${smallKids ? 'min-h-40' : 'min-h-32'}`}
            >
              <div className="flex items-center justify-center">
                <Motif id={tile.id} size={smallKids ? 110 : 90} />
              </div>
              {smallKids ? (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">{tile.label}</span>
              ) : null}
            </button>
          ))}
        </div>

        {msg ? (
          <p
            className={`animate-pop rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {msg.text}
            {msg.ref ? <span className="mt-1 block text-xs opacity-80">📖 {msg.ref}</span> : null}
          </p>
        ) : null}

        {ls.mapOpen ? (
          <LevelMap
            title="Níveis"
            subtitle="Escolha um nível para jogar"
            items={levelMapItems(GAME_ID, LEVELS, (i) => `Nível ${i + 1}`)}
            onPick={(id) => ls.goToLevel(LEVELS.findIndex((l) => l.id === id))}
            onClose={() => ls.setMapOpen(false)}
          />
        ) : null}
      </div>
    </GameShell>
  );
}
