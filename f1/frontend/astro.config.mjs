import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// SITE_URL and SITE_BASE are set by the GitHub Pages workflow, where the site is
// served from a sub-path (https://<user>.github.io/F1-2024). Locally it is served from "/".
export default defineConfig({
  site: process.env.SITE_URL,
  base: process.env.SITE_BASE || '/',
  integrations: [react(), tailwind()],
  server: {
    port: 4321,
    host: true
  }
});
