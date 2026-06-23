/**
 * Platform-agnostic toast abstraction.
 *
 * Shared code (e.g. mutation hooks) calls `toast.success(...)` without knowing whether
 * it runs on web (react-hot-toast) or mobile (react-native-toast-message). Each app
 * injects its implementation once via `setToastAdapter()`.
 */
export type ToastAdapter = {
  success: (message: string) => void;
  error: (message: string) => void;
  info?: (message: string) => void;
};

const noop = () => {};

let adapter: ToastAdapter = {
  success: noop,
  error: noop,
  info: noop,
};

export function setToastAdapter(impl: ToastAdapter): void {
  adapter = { info: impl.success, ...impl };
}

export const toast = {
  success: (message: string) => adapter.success(message),
  error: (message: string) => adapter.error(message),
  info: (message: string) => (adapter.info ?? adapter.success)(message),
};
