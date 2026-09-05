import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import typegpu from 'unplugin-typegpu/vite';

const site = process.env.SITE_URL || 'https://goprogabriel.github.io';
const rawBase = process.env.BASE_PATH || '';
const base = rawBase ? `/${rawBase.replace(/^\/+|\/+$/g, '')}` : '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap()],
  vite: { plugins: [typegpu()] },
  build: { format: 'directory' }
});
