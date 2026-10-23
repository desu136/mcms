import type { Config } from 'tailwindcss';
import * as path from 'path';

const config: Config = {
  content: [
    path.resolve(__dirname, 'src/renderer/index.html'),
    path.resolve(__dirname, 'src/renderer/src/**/*.{js,ts,jsx,tsx}'),
  ],
  safelist: [
    'grid-cols-1',
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'gap-2',
    'gap-2.5',
    'gap-3',
    'gap-4',
    'gap-5',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e3a8a',
        },
      },
      boxShadow: {
        '2xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};

export default config;
