import { Volume2 } from 'lucide-react';
import { sfx, voice } from '../lib/audio';

// Botãozinho 🔊 para ouvir uma pergunta/opção. Nunca fica DENTRO de outro
// button (regra da skill `jogos-game-design` §5): use como irmão, dentro de um
// contêiner `relative`, posicionado com `absolute`.

interface SpeakChipProps {
  /** Texto que será falado (limpo por `cleanForSpeech`). */
  text: string;
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
}

export default function SpeakChip({ text, className = '', size = 'sm', label }: SpeakChipProps) {
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const icon = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        sfx.pop();
        voice.speak(text);
      }}
      aria-label={label ?? `Ouvir: ${text}`}
      className={`ui-press z-10 flex ${box} items-center justify-center rounded-full bg-sky-500 text-white shadow-md ${className}`}
    >
      <Volume2 className={icon} />
    </button>
  );
}
