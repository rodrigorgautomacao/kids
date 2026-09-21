import { useEffect, useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { Volume2 } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { StarItem } from '../art';
import { bestScore, submitScore } from '../../lib/progress';
import { usePrefersReducedMotion } from '../../lib/motion';
import { confettiGravity, confettiPieces } from '../../lib/confetti';
import { sfx, voice } from '../../lib/audio';
import { burst, flyNumber, ring, shake } from '../../lib/fx';
import { shuffle, starsForWrong } from '../../lib/minigame';
import { isSmallKidsMode } from '../../lib/prefs';

// ── Caçadores do Versículo (7–9 anos) ────────────────────────────────────
// A criança lê um versículo curto com uma palavra faltando e toca na palavra
// certa. Há bônus de rapidez (⚡), mas NUNCA punição por demorar: quem precisa
// de tempo só ganha a base. Erro não pune — a opção errada treme e some.

interface Round {
  antes: string;
  depois: string;
  options: [string, string, string];
  certo: string;
  ref: string;
  msg: string;
}

const ROUNDS: Round[] = [
  { antes: 'O Senhor é meu', depois: '; nada me faltará.', options: ['pastor', 'castelo', 'jardim'], certo: 'pastor', ref: 'Salmos 23.1 (NAA)', msg: 'Isso! Deus cuida de nós como um pastor cuida das ovelhas! 🐑' },
  { antes: 'No princípio, Deus criou os', depois: 'e a terra.', options: ['céus', 'mares', 'animais'], certo: 'céus', ref: 'Gênesis 1.1 (NAA)', msg: 'Muito bem! Deus é o Criador de tudo! 🌍' },
  { antes: 'Tudo posso naquele que me', depois: '.', options: ['fortalece', 'ensina', 'guarda'], certo: 'fortalece', ref: 'Filipenses 4.13 (NAA)', msg: 'Isso! Com Deus, temos força! 💪' },
  { antes: 'O Senhor é a minha', depois: '; não temerei.', options: ['luz', 'força', 'paz'], certo: 'luz', ref: 'Salmos 27.1 (NAA)', msg: 'Certo! Deus ilumina o nosso caminho! 💡' },
  { antes: 'Deixem vir a mim as', depois: '.', options: ['crianças', 'flores', 'estrelas'], certo: 'crianças', ref: 'Marcos 10.14 (NAA)', msg: 'Isso! Jesus ama as crianças! 🧒' },
  { antes: 'Eu sou o caminho, a', depois: 'e a vida.', options: ['verdade', 'nuvem', 'montanha'], certo: 'verdade', ref: 'João 14.6 (NAA)', msg: 'Muito bem! Jesus é o caminho! 🕊️' },
  { antes: 'Alegrem-se sempre no', depois: '.', options: ['Senhor', 'parque', 'mar'], certo: 'Senhor', ref: 'Filipenses 4.4 (NAA)', msg: 'Isso! A alegria vem de Deus! 😊' },
  { antes: 'Amarás o teu próximo como a ti', depois: '.', options: ['mesmo', 'depois', 'sempre'], certo: 'mesmo', ref: 'Marcos 12.31 (NAA)', msg: 'Certo! Amar o próximo é o que Deus pede! 💛' },
];

const GAME_ID = 'cacadores-versiculo';
const PTS_ACERTO = 100;
const PTS_RAPIDO = 50;
const SEGUNDOS_BONUS = 15;

export default function GameCacadoresDoVersiculo({ onExit }: { onExit: () => void }) {
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
  const [msg, setMsg] = useState<{ text: string; good: boolean; ref?: string; bonus?: number } | null>(null);
  const wrongRef = useRef(0);
  const startRef = useRef(Date.now());
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
    startRef.current = Date.now();
  }, [idx]);

  useEffect(() => {
    if (finished || !round) return;
    const t = window.setTimeout(
      () => voice.speak(`${round.antes} … ${round.depois.replace(/^[;,. ]+/, '')}`),
      400,
    );
    return () => window.clearTimeout(t);
  }, [idx, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      voice.stopSpeaking();
    },
    [],
  );

  function handlePick(word: string, ev: { currentTarget: HTMLElement }) {
    if (picked || won || finished) return;
    const el = ev.currentTarget;
    const box = stageRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2 - (box?.left ?? 0);
    const y = r.top + r.height / 2 - (box?.top ?? 0);
    setPicked(word);

    if (word === round.certo) {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const bonus = elapsed < SEGUNDOS_BONUS ? PTS_RAPIDO : 0;
      const ganho = PTS_ACERTO + bonus;
      sfx.correct();
      setWon(true);
      setScore((s) => s + ganho);
      burst(stageRef.current, x, y, { kind: 'spark', count: 18 });
      ring(stageRef.current, x, y, '#facc15', 42);
      flyNumber(stageRef.current, x, y, `+${ganho}`);
      setMsg({ text: round.msg, good: true, ref: round.ref, bonus });
      voice.speak(round.msg);

      later(() => {
        if (idx + 1 >= ROUNDS.length) {
          setStars(starsForWrong(wrongRef.current));
          setFinished(true);
          submitScore(GAME_ID, score + ganho);
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
      setMsg({ text: 'Quase! Leia o versículo de novo e escolha outra palavra. ✊', good: false });
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
      <div className="safe-area-pad relative flex min-h-screen-safe w-full flex-col items-center justify-center gap-5 bg-gradient-to-b from-violet-100 via-indigo-50 to-purple-100 px-6">
        {!reducedMotion ? (
          <Confetti recycle={false} numberOfPieces={confettiPieces()} gravity={confettiGravity()} />
        ) : null}
        <LevelDone
          stars={stars}
          onExit={onExit}
          wrong={wrongTotal}
          headline={stars === 3 ? 'Incrível! ⭐⭐⭐' : stars === 2 ? 'Muito bem! ⭐⭐' : 'Bom esforço! ⭐'}
        />
        <p className="-mt-1 text-sm font-black text-violet-700">Pontuação: {score} ⭐</p>
        <button
          type="button"
          onClick={handleReplay}
          className="ui-press rounded-full bg-violet-400 px-8 py-3 text-lg font-black text-violet-950 shadow-[0_6px_0_rgba(124,58,237,0.9)]"
        >
          Jogar de novo 🔁
        </button>
      </div>
    );
  }

  if (!round) return null;

  const filled = won ? round.certo : '______';

  return (
    <GameShell
      title="Caçadores do Versículo"
      subtitle="Encontre a palavra que falta!"
      onExit={onExit}
      bg="bg-gradient-to-b from-violet-100 via-indigo-50 to-purple-100"
      titleClass="text-violet-600"
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
              <span className="flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-2 text-sm font-black text-violet-700 shadow">
                🏆 {Math.max(record, score)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative w-full rounded-3xl bg-white/95 px-6 py-5 text-center shadow-xl">
          <p className="text-2xl leading-snug font-black text-indigo-900">
            “{round.antes}{' '}
            <span className={won ? 'text-emerald-600' : 'text-violet-500'}>{filled}</span>
            {round.depois}”
          </p>
          <button
            type="button"
            onClick={() => {
              sfx.pop();
              voice.speak(`${round.antes} … ${round.depois.replace(/^[;,. ]+/, '')}`);
            }}
            aria-label="Ouvir o versículo de novo"
            className="ui-press absolute top-2 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 text-white shadow"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <p className="mt-2 text-xs font-bold text-slate-400">⚡ Responda rápido para ganhar bônus!</p>
        </div>

        <div ref={stageRef} className="relative grid w-full grid-cols-3 gap-3">
          {order.map((word) => (
            <button
              key={word}
              type="button"
              disabled={won || picked === word}
              onClick={(ev) => handlePick(word, ev)}
              className={`ui-press rounded-2xl border-4 px-3 py-5 text-lg font-black shadow-lg transition-transform ${
                picked === word && word === round.certo
                  ? 'animate-pop border-emerald-400 bg-emerald-50 text-emerald-800'
                  : picked === word
                    ? 'border-rose-200 bg-rose-50 text-rose-300 line-through'
                    : 'border-slate-200 bg-white text-indigo-800 hover:scale-105'
              } ${smallKids ? 'text-xl' : ''}`}
            >
              {word}
            </button>
          ))}
        </div>

        {msg ? (
          <p
            className={`animate-pop rounded-3xl px-6 py-3 text-center text-base font-extrabold shadow-lg ${
              msg.good ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {msg.bonus ? <span className="mr-1">⚡ +{msg.bonus} bônus!</span> : null}
            {msg.text}
            {msg.ref ? <span className="mt-1 block text-xs opacity-80">📖 {msg.ref}</span> : null}
          </p>
        ) : null}
      </div>
    </GameShell>
  );
}
