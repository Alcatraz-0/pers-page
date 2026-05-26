import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Use "static" instead of the default "assets" — Cloudflare's edge is
    // currently 500-ing on /assets/* paths for this project.
    assetsDir: 'static',
  },
})
