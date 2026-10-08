/** Resolve backend-owned media against the configured API, including split-origin deployments. */
export function resolveApiUrls<T>(value: T, apiBase: string): T {
  if (typeof value === 'string' && value.startsWith('/api/media/')) {
    return `${apiBase.replace(/\/$/, '')}/media/${value.slice('/api/media/'.length)}` as T;
  }
  if (Array.isArray(value)) return value.map(item => resolveApiUrls(item, apiBase)) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolveApiUrls(item, apiBase)])) as T;
  }
  return value;
}
