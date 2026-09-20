import type { ComponentType } from 'react';
import { BookHeart, Crown } from 'lucide-react';
import GameEstradaDaLuz from '../components/games/GameEstradaDaLuz';
import GameHeroisDaBiblia from '../components/games/GameHeroisDaBiblia';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  /** Sinopse do capítulo: a lição do jogo (fazer o certo → recompensa em Deus) */
  sinopse: string;
  /** Quantos níveis o capítulo tem (padrão: MAX_LEVELS_PER_GAME = 10) */
  totalLevels?: number;
  icon: ComponentType<{ className?: string }>;
  /** Classes Tailwind (literais) do cartucho no Hub da saga */
  color: string;
  component: ComponentType<{ onExit: () => void }>;
}

// Para adicionar um novo capítulo à jornada:
// 1. Crie o componente em src/components/games/NovoJogo.tsx (props: { onExit: () => void })
// 2. Importe-o aqui e adicione um novo objeto no array abaixo.
// Nenhuma outra alteração é necessária no Hub ou no App.
// A ordem do array é a ordem dos capítulos da jornada!
export const games: GameDefinition[] = [
  {
    id: 'estrada-da-luz',
    title: 'A Estrada da Luz',
    subtitle: 'Faça o certo e caminhe até Deus',
    sinopse:
      'Cada resposta certa te caminha até a Luz. Errar acende o fogo do inferno — mas Deus sempre espera você voltar!',
    icon: Crown,
    color: 'bg-gradient-to-b from-indigo-700 via-blue-600 to-sky-500',
    totalLevels: 3,
    component: GameEstradaDaLuz,
  },
  {
    id: 'herois-da-biblia',
    title: 'Heróis da Bíblia',
    subtitle: 'Personagens, histórias e livros da Bíblia',
    sinopse:
      'Conheça Noé, Abraão, Moisés, Davi, Eliseu e muitos outros heróis — e descubra em qual livro da Bíblia cada história está!',
    icon: BookHeart,
    color: 'bg-gradient-to-b from-emerald-700 via-teal-600 to-amber-500',
    totalLevels: 3,
    component: GameHeroisDaBiblia,
  },
];