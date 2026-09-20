import { useRef, useState } from 'react';
import Confetti from 'react-confetti';
import { BookOpen } from 'lucide-react';
import GameShell from '../GameShell';
import LevelHUD from '../LevelHUD';
import LevelDone from '../LevelDone';
import { completeLevel, loadLevels, nextUnfinishedLevel } from '../../lib/progress';
import { playCorrect, playWin, playWrong, playPop } from '../../lib/sound';

interface GameProps {
  onExit: () => void;
}

interface WordLevel {
  word: string;
  sentence: string; // use ___ para o espaço da palavra
}

const WORDS: WordLevel[] = [
  { word: 'AMOR', sentence: 'Deus é ___' },
  { word: 'LUZ', sentence: 'A ___ guia o caminho' },
  { word: 'DEUS', sentence: 'Amo ___ acima de tudo' },
  { word: 'PERDÃO', sentence: '___ é o presente de Deus' },
  { word: 'VERDADE', sentence: 'A ___ liberta' },
  { word: 'PAZ', sentence: 'Que a ___ esteja com você' },
  { word: 'FÉ', sentence: 'A ___ em Deus orienta' },
  { word: 'ESPERANÇA', sentence: 'A ___ não decepciona' },
  { word: 'CAMINHO', sentence: 'Jesus é o ___' },
  { word: 'SABEDORIA', sentence: 'O começo de tudo é a ___' },
];

/** Chips de letras embaralhadas (uma por ocorrência da letra) */
interface Chip {
  key: string;
  char: string;
  used: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeChips(word: string): Chip[] {
  return shuffle(
    word.split('').map((char, i) => ({ key: `${char}-${i}`, char, used: false })),
  );
}

export default function GameLivroDaVida({ onExit }: GameProps) {
  const [level, setLevel] = useState(() =>
    nextUnfinishedLevel(loadLevels(), 'livro-da-vida', WORDS.length),
  );
  const [chips, setChips] = useState<Chip[]>(() => makeChips(WORDS[0].word));
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState(0);
  const [shakingChip, setShakingChip] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const recorded = useRef<Set<number>>(new Set());

  const current = WORDS[level - 1];
  const letters = current.word.split('');
  const isLast = level === WORDS.length;

  function starsFrom(errCount: number): number {
    return errCount === 0 ? 3 : errCount <= 3 ? 2 : 1;
  }

  function pickChip(key: string) {
    if (finished) return;
    const chip = chips.find((c) => c.key === key);
    if (!chip || chip.used) return;

    const expected = letters[progress];
    if (chip.char === expected) {
      playCorrect();
      setChips((prev) =>
        prev.map((c) => (c.key === key ? { ...c, used: true } : c)),
      );
      const nextProgress = progress + 1;
      setProgress(nextProgress);
      if (nextProgress >= letters.length) {
        finishLevel();
      } else {
        playPop();
      }
    } else {
      playWrong();
      setErrors((e) => e + 1);
      setShakingChip(key);
      window.setTimeout(() => setShakingChip(null), 500);
    }
  }

  function finishLevel() {
    const stars = starsFrom(errors);
    if (!recorded.current.has(level)) {
      recorded.current.add(level);
      completeLevel('livro-da-vida', level, stars);
      if (isLast) playWin();
    }
    setFinished(true);
  }

  function nextLevel() {
    const next = level + 1;
    setLevel(next);
    setChips(makeChips(WORDS[next].word));
    setProgress(0);
    setErrors(0);
    setShakingChip(null);
    setFinished(false);
  }

  return (
    <GameShell
      title="O Livro da Vida"
      subtitle="10 níveis · Soletre as palavras da lição e leia a frase!"
      onExit={onExit}
      bg="bg-gradient-to-b from-indigo-950 via-violet-900 to-indigo-900"
      titleClass="text-yellow-300"
    >
      {finished ? <Confetti recycle={false} numberOfPieces={220} gravity={0.16} /> : null}

      <div aria-live="polite" className="sr-only">
        {finished
          ? 'Nível concluído!'
          : `${progress} de ${letters.length} letras da palavra ${current.word}`}
      </div>

      <div className="relative flex w-full flex-1 flex-col items-center gap-6 px-4 pb-8">
        <LevelHUD level={level} totalLevels={WORDS.length} />

        {/* frase com espaço */}
        <div className="w-full max-w-lg rounded-3xl bg-white/10 px-6 py-4 text-center shadow-xl backdrop-blur-sm">
          <p className="text-xl font-bold text-white/90 sm:text-2xl">
            {current.sentence.split('___').length === 2 ? (
              <>
                {current.sentence.split('___')[0]}
                <span className="rounded-lg bg-yellow-300/90 px-2 font-black text-indigo-900">
                  {letters
                    .map((ch, i) =>
                      i < progress ? (
                        ch
                      ) : (
                        <span key={i} className="text-indigo-300/60">
                          _
                        </span>
                      ),
                    )
                    .join('')}
                </span>
                {current.sentence.split('___')[1]}
              </>
            ) : (
              current.sentence
            )}
          </p>
        </div>

        {/* casas das letras */}
        <div className="flex items-center gap-2">
          {letters.map((ch, i) => {
            const revealed = i < progress;
            return (
              <span
                key={i}
                className={`flex h-14 w-11 items-center justify-center rounded-xl border-2 text-3xl font-black shadow-lg transition-all duration-300 ${
                  revealed
                    ? 'scale-105 border-amber-400 bg-amber-100 text-amber-600'
                    : 'border-amber-100/40 bg-white/5 text-transparent'
                }`}
              >
                {revealed ? ch : '·'}
              </span>
            );
          })}
        </div>

        {/* chips de letras */}
        <div className="flex max-w-lg flex-wrap items-center justify-center gap-3">
          {chips.map((chip) => {
            const expected = letters[progress];
            const isExpected = chip.char === expected;
            return (
              <button
                key={chip.key}
                type="button"
                onClick={() => pickChip(chip.key)}
                disabled={chip.used || finished}
                aria-label={`Letra ${chip.char}`}
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border-4 text-3xl font-black shadow-lg transition-all duration-200 active:scale-90 ${
                  chip.used
                    ? 'scale-90 border-white/10 bg-white/5 text-transparent'
                    : isExpected
                      ? 'animate-float border-yellow-300 bg-gradient-to-b from-yellow-200 to-amber-300 text-amber-800'
                      : 'border-indigo-200 bg-white/90 text-indigo-700'
                } ${shakingChip === chip.key ? 'animate-shake' : ''}`}
              >
                {chip.used ? '·' : chip.char}
              </button>
            );
          })}
        </div>

        {/* placar de erros */}
        <span
          className={`rounded-full px-5 py-1.5 text-sm font-black shadow ${
            errors === 0
              ? 'bg-emerald-400 text-emerald-950'
              : 'bg-rose-500 text-white'
          }`}
        >
          {errors === 0 ? '✨ Soletração perfeita!' : `💥 ${errors} toque${errors > 1 ? 's' : ''} errado${errors > 1 ? 's' : ''}`}
        </span>

        {/* conclusão */}
        {finished ? (
          <div className="-mt-2 flex flex-col items-center">
            <LevelDone
              stars={starsFrom(errors)}
              onNext={isLast ? undefined : nextLevel}
              onExit={onExit}
              lesson={
                isLast
                  ? 'Seu nome está guardado no Livro da Vida de Deus! 📖'
                  : undefined
              }
            />
          </div>
        ) : null}
      </div>

      <span className="flex items-center justify-center gap-1 pb-6 text-xs font-bold text-white/50">
        <BookOpen className="h-4 w-4 text-yellow-300" /> toque nas letras na ordem da palavra
      </span>
    </GameShell>
  );
}