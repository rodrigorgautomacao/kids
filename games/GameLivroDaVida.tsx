import { ArrowLeft } from 'lucide-react';

interface GameProps {
  onExit: () => void;
}

// TODO (opencode): implementar letras flutuantes tocáveis, formação de "AMOR"/"VIDA",
// animação do livro brilhando, estrelinhas/confetes e botão "Jogar Novamente".
export default function GameLivroDaVida({ onExit }: GameProps) {
  return (
    <div className="min-h-screen w-full bg-sky-100 flex flex-col items-center justify-center p-6">
      <button
        onClick={onExit}
        className="absolute top-4 left-4 flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md font-bold text-sky-600"
      >
        <ArrowLeft className="w-5 h-5" /> Voltar
      </button>
      <h2 className="text-3xl font-bold text-sky-700">O Livro da Vida</h2>
      <p className="text-sky-600 mt-2">Jogo em construção…</p>
    </div>
  );
}
