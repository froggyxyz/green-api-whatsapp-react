import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const greenApiHost = env.GREEN_API_HOST || 'https://api.green-api.com'

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/green-api': {
          target: greenApiHost,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/green-api/, ''),
        },
      },
    },
  }
})