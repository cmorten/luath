export const RE_HTTP_URL = /^https?:\/\//;

export function isHttpUrl(str: string) {
  return RE_HTTP_URL.test(str);
}
