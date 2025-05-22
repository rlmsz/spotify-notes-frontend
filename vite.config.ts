import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // This allows access via IP address
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxy
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err);
          });
          // Log only the request URL for simplicity
          proxy.on('proxyReq', (proxyReq) => {
            console.log('Proxying request to:', proxyReq.path);
          });
          // Log the response status code
          proxy.on('proxyRes', (proxyRes) => {
            console.log('Received response with status:', proxyRes.statusCode);
          });
        },
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
