// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';

export default defineConfig({
  output: 'server',
  adapter: netlify(),
  integrations: [
    tailwind(),
    react(),
    keystatic()
  ],
});