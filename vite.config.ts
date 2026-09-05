import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'BASE_PATH');
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base =
    process.env.BASE_PATH ??
    env.BASE_PATH ??
    (repository && !repository.endsWith('.github.io') ? `/${repository}/` : '/');
  const segments = base.split('/').filter(Boolean);
  return {
    plugins: [react(), tailwindcss()],
    base: segments.length ? `/${segments.join('/')}/` : '/',
  };
});
