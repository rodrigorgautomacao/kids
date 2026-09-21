import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import LevelMap from '../LevelMap';
import { StarItem } from '../art';
import { bestScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle } from '../../lib/minigame';
import { chunkLevels, levelMapItems, useLevelState } from '../../lib/levels';
import { isSmallKidsMode } from '../../lib/prefs';
import SpeakChip from '../SpeakChip';

interface Round {
  pista: string;
  options: [string, string, string];
  certo: string;
  ref: string;
  msg: string;
}

const ROUNDS: Round[] = [
  { pista: 'Noé construiu uma arca bem grande.', options: ['Gênesis', 'Jonas', 'Atos'], certo: 'Gênesis', ref: 'Gênesis 6.14 (NAA)', msg: 'Isso! A história de Noé está em Gênesis! 🚢' },
  { pista: 'Moisés abriu o Mar Vermelho.', options: ['Êxodo', 'Lucas', 'Josué'], certo: 'Êxodo', ref: 'Êxodo 14.21 (NAA)', msg: 'Muito bem! Êxodo conta a saída do Egito! 🌊' },
  { pista: 'As muralhas de Jericó caíram.', options: ['Josué', 'Daniel', 'Mateus'], certo: 'Josué', ref: 'Josué 6.20 (NAA)', msg: 'Isso! Josué liderou o povo de Deus! 📯' },
  { pista: 'Davi venceu o gigante Golias.', options: ['1 Samuel', 'Jonas', 'Atos'], certo: '1 Samuel', ref: '1 Samuel 17.50 (NAA)', msg: 'Certo! Davi e Golias estão em 1 Samuel! 🪨' },
  { pista: 'Jonas ficou dentro do grande peixe.', options: ['Jonas', 'Êxodo', 'Lucas'], certo: 'Jonas', ref: 'Jonas 1.17 (NAA)', msg: 'Isso! O livro leva o nome dele! 🐳' },
  { pista: 'Daniel foi protegido na cova dos leões.', options: ['Daniel', 'Gênesis', 'Marcos'], certo: 'Daniel', ref: 'Daniel 6.22 (NAA)', msg: 'Muito bem! Daniel confiou em Deus! 🦁' },
  { pista: 'Jesus nasceu em Belém.', options: ['Lucas', 'Josué', 'Daniel'], certo: 'Lucas', ref: 'Lucas 2.6-7 (NAA)', msg: 'Certo! Lucas conta o nascimento de Jesus! ⭐' },
  { pista: 'Paulo viu uma luz no caminho de Damasco.', options: ['Atos', 'Gênesis', '1 Samuel'], certo: 'Atos', ref: 'Atos 9.3 (NAA)', msg: 'Isso! Atos conta a história da igreja! ✨' },
  { pista: 'Deus criou o céu, a terra e o mar.', options: ['Gênesis', 'Mateus', 'Atos'], certo: 'Gênesis', ref: 'Gênesis 1.1 (NAA)', msg: 'Certo! No começo de tudo está Gênesis! 🌍' },
  { pista: 'Jesus acalmou a tempestade no mar.', options: ['Marcos', 'Gênesis', 'Juízes'], certo: 'Marcos', ref: 'Marcos 4.39 (NAA)', msg: 'Isso! Marcos conta os milagres de Jesus! 🌊' },
];

const GAME_ID = 'mostre-o-livro';
const PTS_ACERTO = 100;
const LEVELS = chunkLevels(ROUNDS, 2);

export default function GameMostreOLivro({ onExit }: { onExit: () => void }) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const ls = useLevelState(GAME_ID, LEVELS);
  const round = ls.round;
  const [order, setOrder] = useState<string[]>([]);
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
    setOrder(shuffle(round.options));
    setPicked(null);
    setWon(false);
    setMsg(null);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ls.phase !== 'playing' || !round) return;
    const t = window.setTimeout(() => voice.speak(round.pista), 400);
    return () => window.clearTimeout(t);
  }, [ls.levelIdx, ls.roundIdx, ls.phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(book: string, ev: { currentTarget: HTMLElement }) {
    if (picked || won || ls.phase !== 'playing' || !round) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(book);

    if (book === round.certo) {
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
      setMsg({ text: 'Quase! Pensa em qual livro conta essa história! ✊', good: false });
      voice.speak('Quase! Tenta de novo!');
      later(() => setPicked(null), 900);
    }
  }

  if (ls.phase === 'done') {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone stars={ls.stars} wrong={ls.wrong} onNext={ls.hasNextLevel ? ls.goNextLevel : undefined} onExit={onExit} onOpenMap={() => ls.setMapOpen(true)} />
        <p className="-mt-1 text-sm font-black text-cyan-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={() => {
            setScore(0);
            ls.replayLevel();
          }}
          className="ui-press rounded-full bg-cyan-400 px-8 py-3 text-lg font-black text-cyan-950 shadow-[0_6px_0_rgba(8,145,178,0.9)]"
        >
          Jogar de novo 🔁
        </button>
        {ls.mapOpen ? (
          <LevelMap title="Níveis" subtitle="Escolha um nível para jogar" items={levelMapItems(GAME_ID, LEVELS, (i) => `Nível ${i + 1}`)} onPick={(id) => ls.goToLevel(LEVELS.findIndex((l) => l.id === id))} onClose={() => ls.setMapOpen(false)} />
        ) : null}
      </div>
    );
  }

  if (!round) return null;

  return (
    <GameShell title="Mostre o Livro" subtitle="De qual livro da Bíblia é essa história?" onExit={onExit} bg="bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-100" titleClass="text-cyan-600">
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
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-cyan-700 shadow">🏆 {Math.max(record, score)}</span>
            ) : null}
            <button type="button" onClick={() => { sfx.pop(); ls.setMapOpen(true); }} className="ui-press rounded-full bg-white/85 px-3 py-2 text-sm font-black text-cyan-700 shadow">🗺️</button>
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-xl font-black text-indigo-900">{round.pista}</p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(round.pista);
            }}
            aria-label="Ouvir a pista de novo"
            className="ui-press absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-cyan-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-3">
          {order.map((book) => (
            <div key={book} className="relative flex">
              <button
                type="button"
                disabled={won}
                onClick={(ev) => handlePick(book, ev)}
                className={`ui-press flex flex-1 flex-col items-center gap-2 rounded-3xl border-4 bg-white px-3 py-6 shadow-lg transition-transform ${
                  picked === book && book === round.certo ? 'animate-pop border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:scale-105'
                } ${smallKids ? 'min-h-40' : 'min-h-32'}`}
              >
                <span className={smallKids ? 'text-6xl' : 'text-5xl'}>📖</span>
                <span className="text-center text-base font-black text-indigo-800">{book}</span>
              </button>
              <SpeakChip text={book} className="absolute right-1.5 top-1.5" />
            </div>
          ))}
        </div>

        {msg ? (
          <p className={`animate-pop rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${msg.good ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
            {msg.text}
            {msg.ref ? <span className="mt-1 block text-xs opacity-80">📖 {msg.ref}</span> : null}
          </p>
        ) : null}

        {ls.mapOpen ? (
          <LevelMap title="Níveis" subtitle="Escolha um nível para jogar" items={levelMapItems(GAME_ID, LEVELS, (i) => `Nível ${i + 1}`)} onPick={(id) => ls.goToLevel(LEVELS.findIndex((l) => l.id === id))} onClose={() => ls.setMapOpen(false)} />
        ) : null}
      </div>
    </GameShell>
  );
}
