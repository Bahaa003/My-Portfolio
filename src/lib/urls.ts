export function withBase(path: string): string {
  if (/^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('#')) return path;

  const base = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const basePath = base.slice(0, -1);

  if (path === basePath || path.startsWith(`${basePath}/`)) return path;

  const normalizedPath = path.replace(/^\/+/, '');

  return `${base}${normalizedPath}`;
}
