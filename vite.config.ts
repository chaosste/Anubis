import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // CRITICAL: Prioritize system PORT environment variable (Cloud Run)
  // loadEnv does not automatically capture system variables unless they are in .env files.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;

  // Merge critical system variables into the env object for the define block
  // This ensures API_KEY is passed through if it exists in the build environment
  if (process.env.API_KEY) {
    env.API_KEY = process.env.API_KEY;
  }

  return {
    plugins: [react()],
    define: {
      // Expose env vars to the client code.
      // Note: If API_KEY is not available at BUILD time, it will be undefined here.
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