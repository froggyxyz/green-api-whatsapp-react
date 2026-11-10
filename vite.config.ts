import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/green-api': {
        target: 'https://7107.api.greenapi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/green-api/, ''),
      },
    },
  },
})