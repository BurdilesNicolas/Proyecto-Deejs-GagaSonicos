import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import spotifyApi from './api/spotify.js'

function localSpotifyApi() {
  return {
    name: 'local-spotify-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = new URL(req.url, 'http://localhost').pathname
        if (pathname !== '/api/spotify') return next()
        return spotifyApi(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const key of ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), localSpotifyApi()],
  }
})
