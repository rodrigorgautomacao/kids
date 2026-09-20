/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(-2deg)' },
          '50%': { transform: 'translateY(-14px) rotate(2deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-10px) rotate(-2deg)' },
          '40%': { transform: 'translateX(10px) rotate(2deg)' },
          '60%': { transform: 'translateX(-7px)' },
          '80%': { transform: 'translateX(7px)' },
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
      },
      animation: {
        float: 'float 3.5s ease-in-out infinite',
        'float-slow': 'float 5s ease-in-out infinite',
        shake: 'shake 0.5s ease-in-out',
        pop: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'glow-gold': 'glow-gold 1.3s ease-in-out infinite',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        drift: 'drift 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};