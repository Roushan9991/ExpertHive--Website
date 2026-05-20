import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import expressApp from './api/index.js'

// Custom Vite plugin to mount the Express app in dev mode
const expressBackendPlugin = () => ({
  name: 'express-backend',
  configureServer(server) {
    server.middlewares.use(expressApp);
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), expressBackendPlugin()],
})
