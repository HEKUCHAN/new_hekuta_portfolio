// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import partytown from '@astrojs/partytown';

// https://astro.build/config
export default defineConfig({
  site: 'http://hekuta.net',
  vite: {
    ssr: {
      noExternal: ['react-icons']
    },
    plugins: [tailwindcss()]
  },

  integrations: [react(), partytown(), partytown({ config: { forward: ['dataLayer.push'] } })],
});