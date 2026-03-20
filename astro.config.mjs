// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://nexonomic.netlify.app',
  output: 'server',
  adapter: netlify(),
  integrations: [
    tailwind(),
    react(),
    sitemap(),
    keystatic()
  ],
});