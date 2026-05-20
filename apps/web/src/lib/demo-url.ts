const LOCAL_LAB_ORIGIN = 'http://localhost:8787';
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1']);

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function isLoopbackOrigin(origin: string): boolean {
  try {
    return LOOPBACK_HOSTS.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

function configuredLabOrigin(): string | undefined {
  const envOrigin = import.meta.env.PUBLIC_WEBREX_LAB_ORIGIN?.trim();
  if (envOrigin) {
    const normalized = trimTrailingSlash(envOrigin);
    return import.meta.env.PROD && isLoopbackOrigin(normalized) ? undefined : normalized;
  }
  return import.meta.env.DEV ? LOCAL_LAB_ORIGIN : undefined;
}

function pathFromUrl(url: URL): string {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function resolveDemoUrl(externalSite: string | undefined): string | undefined {
  if (!externalSite) return undefined;

  const labOrigin = configuredLabOrigin();

  if (externalSite.startsWith('/')) {
    return labOrigin ? `${labOrigin}${externalSite}` : externalSite;
  }

  try {
    const url = new URL(externalSite);
    if (LOOPBACK_HOSTS.has(url.hostname)) {
      const demoPath = pathFromUrl(url);
      return labOrigin ? `${labOrigin}${demoPath}` : demoPath;
    }
  } catch {
    return externalSite;
  }

  return externalSite;
}
