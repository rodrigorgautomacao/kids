/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      /**
       * Tokens de paleta (skill `jogos-visual` §8): papéis semânticos em vez de
       * cores soltas espalhadas pelos componentes. Escalas pequenas de propósito
       * — cada tom existe para um uso concreto.
       */
      colors: {
        /** Fundos e céus */
        ceu: {
          noite: '#150b2e',
          fundo: '#0b1220',
          escuro: '#0c4a6e',
          claro: '#bae6fd',
          brilho: '#38bdf8',
        },
        /** Recompensa (estrela, ponto, luz) */
        luz: {
          suave: '#fef3c7',
          claro: '#fde047',
          forte: '#f59e0b',
          texto: '#78350f',
        },
        /** Erro/esfriamento — azul-acinzentado, nunca preto (tom de graça) */
        sombra: {
          suave: '#cbd5e1',
          medio: '#64748b',
          escuro: '#334155',
          fundo: '#1e293b',
        },
        /** Chão, madeira, pedra, areia */
        terra: {
          areia: '#fcd34d',
          madeira: '#b45309',
          pedra: '#94a3b8',
          mata: '#15803d',
          capim: '#86efac',
        },
        /** Rios e mares */
        agua: {
          claro: '#7dd3fc',
          medio: '#38bdf8',
          fundo: '#1d4ed8',
          profundo: '#1e3a8a',
        },
        /** Acerto/vitória */
        vitoria: {
          claro: '#a7f3d0',
          medio: '#34d399',
          escuro: '#065f46',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        /** Screen shake contido: ≤ 6 px e ≤ 250 ms (skill `jogos-visual` §5) */
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-6px) rotate(-0.6deg)' },
          '40%': { transform: 'translateX(5px) rotate(0.5deg)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(2px)' },
        },
        pop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.12)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow-gold': {
          '0%, 100%': {
            boxShadow: '0 0 12px rgba(253,224,71,0.5), 0 0 40px rgba(253,224,71,0.30)',
          },
          '50%': {
            boxShadow: '0 0 28px rgba(253,224,71,0.95), 0 0 90px rgba(253,224,71,0.60)',
          },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(0.9)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' },
        },
        drift: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-18px) translateX(10px)' },
          '66%': { transform: 'translateY(-8px) translateX(-8px)' },
        },
        /** Estrela entrando uma a uma na tela final (com atraso por índice) */
        'star-in': {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: '0' },
          '70%': { transform: 'scale(1.3) rotate(8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        // NOTA: a transição de tela NÃO fica aqui. Ela vive em `index.css`
        // (`.screen-in`/`.screen-out`) de propósito, **sem `fill-mode`**: um
        // `transform` persistente no wrapper de tela transformaria os
        // `position: fixed` internos (confete, véu de escuridão) em `absolute`.
        /** Mãozinha do onboarding, apontando o primeiro toque (sem texto) */
        'hand-tap': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '35%': { transform: 'translate(-8px, -12px) scale(0.92)' },
          '55%': { transform: 'translate(0, 0) scale(1.04)' },
        },
        /** Respiração/andar do personagem (aplicada por estado) */
        'hero-bob': {
          '0%, 100%': { transform: 'translateY(0) scaleY(1)' },
          '50%': { transform: 'translateY(-2px) scaleY(1.03)' },
        },
        'hero-sway': {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '25%': { transform: 'translateY(-3px) rotate(0deg)' },
          '50%': { transform: 'translateY(0) rotate(2deg)' },
          '75%': { transform: 'translateY(-3px) rotate(0deg)' },
        },
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        shake: 'shake 0.25s ease-in-out',
        pop: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'glow-gold': 'glow-gold 1.3s ease-in-out infinite',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
        'star-in': 'star-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'hand-tap': 'hand-tap 1.1s ease-in-out infinite',
        'hero-bob': 'hero-bob 1.6s ease-in-out infinite',
        'hero-sway': 'hero-sway 0.42s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
