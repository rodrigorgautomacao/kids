import { ComponentType } from 'react';
import { Scale, BookOpen } from 'lucide-react';
import GameBalanca from '../components/games/GameBalanca';
import GameLivroDaVida from '../components/games/GameLivroDaVida';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  color: string; // classes Tailwind de fundo do "cartucho" no Hub
  component: ComponentType<{ onExit: () => void }>;
}

// Para adicionar um novo jogo no futuro:
// 1. Crie o componente em src/components/games/NovoJogo.tsx (props: { onExit: () => void })
// 2. Importe-o aqui e adicione um novo objeto no array abaixo.
// Nenhuma outra alteração é necessária no Hub ou no App.
export const games: GameDefinition[] = [
  {
    id: 'balanca',
    title: 'A Balança das Escolhas',
    subtitle: 'Deus sempre faz o que é certo',
    icon: Scale,
    color: 'bg-amber-400',
    component: GameBalanca,
  },
  {
    id: 'livro-da-vida',
    title: 'O Livro da Vida',
    subtitle: 'Seu nome guardado para sempre',
    icon: BookOpen,
    color: 'bg-sky-400',
    component: GameLivroDaVida,
  },
];
