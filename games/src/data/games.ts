import type { ComponentType } from 'react';
import { BookOpen, Scale, Star } from 'lucide-react';
import GameBalanca from '../components/games/GameBalanca';
import GameEstrelas from '../components/games/GameEstrelas';
import GameLivroDaVida from '../components/games/GameLivroDaVida';

export interface GameDefinition {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentType<{ className?: string }>;
  /** Classes Tailwind (literais) do cartucho do Hub */
  color: string;
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
    color: 'bg-gradient-to-b from-amber-300 to-amber-500',
    component: GameBalanca,
  },
  {
    id: 'livro-da-vida',
    title: 'O Livro da Vida',
    subtitle: 'Seu nome guardado para sempre',
    icon: BookOpen,
    color: 'bg-gradient-to-b from-sky-300 to-sky-500',
    component: GameLivroDaVida,
  },
  {
    id: 'conte-as-estrelas',
    title: 'Conte as Estrelas',
    subtitle: 'Cada escolha boa brilha no céu',
    icon: Star,
    color: 'bg-gradient-to-b from-fuchsia-400 to-fuchsia-600',
    component: GameEstrelas,
  },
];