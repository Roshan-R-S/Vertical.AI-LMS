import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@pages': path.resolve(__dirname, 'src/pages'),
        '@contexts': path.resolve(__dirname, 'src/contexts'),
        '@lib': path.resolve(__dirname, 'src/lib'),
      },
    },
    // Pre-bundle all major dependencies so Vite doesn't discover them lazily
    // on first request — this dramatically reduces cold-start time.
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'motion/react',
        'lucide-react',
        'recharts',
        'xlsx',
        'papaparse',
        'date-fns',
        'clsx',
        'tailwind-merge',
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Warm up the most-used modules so they are transformed before the first
      // browser request — removes the stall on initial page load.
      warmup: {
        clientFiles: [
          './src/main.tsx',
          './src/App.tsx',
          './src/components/Sidebar.tsx',
          './src/components/Topbar.tsx',
          './src/pages/Shared/LeadsPage.tsx',
          './src/pages/Shared/Dashboard.tsx',
          './src/contexts/AuthContext.tsx',
        ],
      },
    },
  };
});
