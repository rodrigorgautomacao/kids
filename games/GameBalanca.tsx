import { ArrowLeft } from 'lucide-react';

interface GameProps {
  onExit: () => void;
}

// TODO (opencode): implementar @dnd-kit/core com blocos cinzentos + coração brilhante,
// estado de equilíbrio da balança, react-confetti ao acertar, e botão "Jogar Novamente".
export default function GameBalanca({ onExit }: GameProps) {
  return (
    <div className="min-h-screen w-full bg-amber-100 flex flex-col items-center justify-center p-6">
      <button
        onClick={onExit}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md font-bold text-amber-600"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>
      <h2 className="text-3xl font-bold text-amber-700">A Balança das Escolhas</h2>
      <p className="text-amber-600 mt-2">Jogo em construção…</p>
    </div>
  );
}
