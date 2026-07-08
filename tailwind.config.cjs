/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // Paleta de marca ONE (Human-Tech)
        one: {
          negro: '#000000',
          oscuro: '#1a181d',
          blanco: '#fefeff',
          fucsia: '#e17bd7',
          cian: '#6be1e3',
          dorado: '#e4c76a',
          lavanda: '#a4a8c0',
          gris: '#c6c9d7',
        },
        diplo: {
          azul: '#134e78',
          azuloscuro: '#0c3554',
          naranja: '#f08b3a',
          celeste: '#3bb3ff',
        },
      },
      fontFamily: {
        sans: ['"Exo 2"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        bubble: '85%',
      },
      fontSize: {
        // Cuerpo intermedio (15px) para las burbujas del chat.
        message: ['15px', '1.6'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.4' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
        'bounce-dot': 'bounce-dot 1.2s ease-in-out infinite',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
