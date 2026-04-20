import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_URL ?? 'https://twcapital.hml.cobransaas.com.br'
  const apiHost = apiTarget.replace(/^https?:\/\//, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5376,
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          headers: { host: apiHost },
        },
        '/oauth': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          headers: { host: apiHost },
        },
      },
    },
  }
})
