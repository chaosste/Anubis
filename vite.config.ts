import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Use PORT env var if available (Cloud Run default), otherwise fallback to 8080 for preview
  const port = env.PORT ? parseInt(env.PORT) : 8080;

  return {
    plugins: [react()],
    define: {
      'process.env': env
    },
    server: {
      host: '0.0.0.0',
      port: 3000
    },
    preview: {
      host: '0.0.0.0',
      port: port
    }
  };
});