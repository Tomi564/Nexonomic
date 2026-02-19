// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify'; // <--- Nueva línea

export default defineConfig({
  // 'server' permite que el panel de Keystatic funcione en vivo
  output: 'server', 
  adapter: netlify(), // <--- Nueva línea
  integrations: [
    tailwind(), 
    react(), 
    keystatic()
  ],
});