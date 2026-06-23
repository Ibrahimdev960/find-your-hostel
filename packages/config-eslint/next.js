import base from './index.js';
import globals from 'globals';

/**
 * Next.js flavored config: base + browser globals + React-friendly tweaks.
 * (next/core-web-vitals is layered in per-app via eslint-config-next.)
 */
export default [
  ...base,
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
