import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { Motif, StarItem } from '../art';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle, starsForWrong } from '../../lib/minigame';
import { isSmallKidsMode } from '../../lib/prefs';

// ── Que Som é Esse? (3–4 anos) ───────────────────────────────────────────
// A criança ouve (narração) uma pista sonora e toca no personagem certo.
// O "som" é narrado como onomatopeia + frase curta — sem arquivo de áudio e
// sempre com o texto na tela (áudio nunca é o único canal). Erro não pune.

interface Round {
  som: string; // onomatopeia narrada
  q: string; // pergunta curta
  certo: string; // id do Motif/personagem
  options: [string, string, string];
  ref: string;
  msg: string;
}

const NOMES: Record<string, string> = {
  noe: 'Noé',
  criacao: 'Anjo',
  elias: 'Elias',
  jonas: 'Jonas',
  eliseu: 'Eliseu',
  daniel: 'Daniel',
  natal: 'Maria',
  moises: 'Moisés',
  josue: 'Josué',
  davi: 'Davi',
  salomao: 'Salomão',
  paulo: 'Paulo',
};

const ROUNDS: Round[] = [
  { som: 'Toc, toc, toc! Martelo na madeira!', q: 'Quem está construindo a arca?', certo: 'noe', options: ['noe', 'jonas', 'davi'], ref: 'Gênesis 6.14 (NAA)', msg: 'Noé martelou a arca bem grande! 🚢' },
  { som: 'Glub, glub… um peixe enorme abriu a boca!', q: 'Quem foi engolido pelo peixe?', certo: 'jonas', options: ['jonas', 'paulo', 'eliseu'], ref: 'Jonas 1.17 (NAA)', msg: 'O grande peixe engoliu Jonas! 🐳' },
  { som: 'Grrr! Os leões rugem bem alto!', q: 'Quem ficou na cova dos leões?', certo: 'daniel', options: ['daniel', 'davi', 'noe'], ref: 'Daniel 6.16 (NAA)', msg: 'Deus protegeu Daniel na cova! 🦁' },
  { som: 'Bééé! As ovelhas balem no campo.', q: 'Quem cuidava das ovelhas?', certo: 'davi', options: ['davi', 'elias', 'salomao'], ref: '1 Samuel 16.11 (NAA)', msg: 'Davi cuidava das ovelhas! 🐑' },
  { som: 'Fiuuuu! O vento sopra no deserto.', q: 'Quem foi cuidado no deserto?', certo: 'elias', options: ['elias', 'josue', 'paulo'], ref: '1 Reis 17.4 (NAA)', msg: 'Deus cuidou de Elias no deserto! 🐦' },
  { som: 'Tã-tã-tã-tã! As trombetas soaram!', q: 'Quem tocou as trombetas em Jericó?', certo: 'josue', options: ['josue', 'salomao', 'moises'], ref: 'Josué 6.20 (NAA)', msg: 'As muralhas de Jericó caíram! 📯' },
  { som: 'Shhh… tudo quieto na noite. Nasceu o Salvador!', q: 'Quem recebeu o anjo?', certo: 'natal', options: ['natal', 'moises', 'daniel'], ref: 'Lucas 1.30-31 (NAA)', msg: 'O anjo falou com Maria! ⭐' },
];

const GAME_ID = 'que-som-e-esse';
const PTS_ACERTO = 100;

export default function GameQueSomEsse({ onExit }: { onExit: () => void }) {
  const smallKids = isSmallKidsMode();
  const reducedMotion = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [order, setOrder] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(3);
  const [picked, setPicked] = useState<string | null>(null);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string } | null>(null);
  const wrongRef = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);
  const record = bestScore(GAME_ID);
  const round = ROUNDS[idx];

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  useEffect(() => {
    if (idx >= ROUNDS.length) return;
    setOrder(shuffle(ROUNDS[idx].options));
    setPicked(null);
    setMsg(null);
  }, [idx]);

  // Toca uma "pista" curta e narra a onomatopeia + a pergunta.
  useEffect(() => {
    if (finished || !round) return;
    const t = window.setTimeout(() => {
      sfx.open();
      voice.speak(`${round.som} ${round.q}`);
    }, 400);
    return () => window.clearTimeout(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(id: string, ev: { currentTarget: HTMLElement }) {
    if (picked || won || finished) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(id);

    if (id === round.certo) {
      sfx.correct();
      setWon(true);
      setScore((s) => s + PTS_ACERTO);
      burst(stageRef.current, x, y, { kind: 'spark', count: 18 });
      ring(stageRef.current, x, y, '#facc15', 42);
      flyNumber(stageRef.current, x, y, `+${PTS_ACERTO}`);
      setMsg({ text: round.msg, good: true, ref: round.ref });
      voice.speak(round.msg);

      later(() => {
        if (idx + 1 >= ROUNDS.length) {
          setStars(starsForWrong(wrongRef.current));
          setFinished(true);
          submitScore(GAME_ID, score + PTS_ACERTO);
        } else {
          setIdx((i) => i + 1);
          setWon(false);
        }
      }, 2600);
    } else {
      sfx.wrong();
      wrongRef.current += 1;
      setWrongTotal((w) => w + 1);
      shake(el);
      setMsg({ text: 'Quase! Tenta de novo! ✊', good: false });
      voice.speak('Quase! Tenta de novo!');
      later(() => setPicked(null), 900);
    }
  }

  function handleReplay() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setIdx(0);
    setScore(0);
    setWrongTotal(0);
    wrongRef.current = 0;
    setFinished(false);
    setWon(false);
    setMsg(null);
  }

  if (finished) {
    return (
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-amber-100 via-rose-50 to-sky-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-amber-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-amber-400 px-8 py-3 text-lg font-black text-amber-950 shadow-[0_6px_0_rgba(202,138,4,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  if (!round) return null;

  return (
    <GameShell
      title="Que Som é Esse?"
      subtitle="Ouça o som e toque em quem fez!"
      onExit={onExit}
      bg="bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100"
      titleClass="text-amber-600"
    >
      <div className="relative flex w-full flex-col items-center gap-5 px-4">
        <div className="flex w-full items-center justify-between gap-3">
          <LevelHUD level={1} totalLevels={1} step={idx + 1} steps={ROUNDS.length} />
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
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-4 text-center shadow-xl">
          <p className="text-2xl font-black text-amber-700">🔊 {round.som}</p>
          <p className="mt-1 text-lg font-black text-indigo-900">{round.q}</p>
          <button
            type="button"
            onClick={() => {
              sfx.open();
              voice.speak(`${round.som} ${round.q}`);
            }}
            aria-label="Ouvir o som de novo"
            className="ui-press absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-amber-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-4">
          {order.map((id) => (
            <button
              key={id}
              type="button"
              disabled={won}
              onClick={(ev) => handlePick(id, ev)}
              className={`ui-press flex flex-col items-center gap-3 rounded-3xl border-4 bg-white px-4 py-6 shadow-lg transition-transform ${
                picked === id && id === round.certo
                  ? 'animate-pop border-emerald-400 bg-emerald-50'
                  : 'border-slate-200 hover:scale-105'
              } ${smallKids ? 'min-h-40' : 'min-h-32'}`}
            >
              <Motif id={id} size={smallKids ? 110 : 90} />
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-black text-indigo-700">
                {NOMES[id] ?? id}
              </span>
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
      </div>
    </GameShell>
  );
}
