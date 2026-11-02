export function withPageTrailingSlash(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return path;
  }

  const url = new URL(path, "http://waymark.local");

  if (url.pathname !== "/" && !url.pathname.endsWith("/")) {
    url.pathname = `${url.pathname}/`;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
