// @ts-check
import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// Sitemap temporarily disabled — re-enable after API stubs are removed or server adapter is added
// import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.hintonstudios.com',
  integrations: [tailwind(), react()]
});