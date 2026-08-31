import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // чтобы можно было открыть с телефона / из Telegram WebApp в локальной сети
  },
})
