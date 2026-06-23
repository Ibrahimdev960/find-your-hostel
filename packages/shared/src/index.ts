/**
 * @findyourhostel/shared — platform-agnostic core (no DOM, no React Native).
 * Prefer the granular subpath exports (e.g. "@findyourhostel/shared/features/auth/hooks")
 * for tree-shaking; this root re-exports the stable building blocks.
 */
export * from './lib';
export * from './config';
export * from './theme';
export * from './types';
export * from './utils';
export * from './store';
