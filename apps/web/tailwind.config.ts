export default {
  theme: {
    extend: {
      keyframes: {
        dot: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.4)' },
        },
        spinGap: {
          '0%': { gap: '0.25rem' },
          '50%': { gap: '1rem' },
          '100%': { gap: '0.25rem' },
        },
      },
      animation: {
        dot: 'dot 1.2s ease-in-out infinite',
        dot2: 'dot 1.2s ease-in-out 0.2s infinite',
        dot3: 'dot 1.2s ease-in-out 0.4s infinite',
        spinGap: 'spinGap 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
