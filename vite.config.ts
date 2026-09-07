import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import typegpu from 'unplugin-typegpu/vite';
import { resolve } from 'node:path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'BASE_PATH');
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.BASE_PATH ??
    env.BASE_PATH ??
    (repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/');
  const segments = base.split('/').filter(Boolean);
  return {
    plugins: [react(), tailwindcss(), typegpu()],
    base: segments.length ? `/${segments.join('/')}/` : '/',
    build: {
      rollupOptions: {
        input: {
          desktop: resolve(import.meta.dirname, 'index.html'),
          light: resolve(import.meta.dirname, 'projects/LetThereBeLight/index.html'),
        },
      },
    },
  };
});
