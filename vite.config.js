import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/pages/**', 'src/components/**'],
      exclude: [
        'node_modules/',
        'src/test/',
        'src/main.jsx',
        'src/App.jsx',
        'vite.config.js',
        'src/pages/CoinTossPrototype.jsx',
        'src/pages/DiceRollPrototype.jsx',
        'src/pages/OAuthCallback.jsx',
        'src/pages/EditProfilePage.jsx',
        'src/pages/SchedulingSessionPage.jsx',
      ],
    },
  },
})