function normaliseBase(baseURL: string): string {
  const withLeadingSlash = baseURL.startsWith("/") ? baseURL : `/${baseURL}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
}

function resolveValue(value: unknown, base: string): unknown {
  if (typeof value === "string") {
    return withAssetBase(value, base);
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveValue(item, base));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        resolveValue(item, base),
      ]),
    );
  }

  return value;
}

const ASSET_PATH_PATTERN = /(?<![\w:.-])\/assets\//g;

export function withAssetBase(url: string, baseURL?: string): string {
  if (!url.includes("/assets/")) {
    return url;
  }

  const base = normaliseBase(baseURL ?? useRuntimeConfig().app.baseURL);

  if (base === "/") {
    return url;
  }

  return url.replace(ASSET_PATH_PATTERN, `${base}assets/`);
}

export function resolveAssetStrings<T>(value: T, baseURL?: string): T {
  const base = normaliseBase(baseURL ?? useRuntimeConfig().app.baseURL);

  return resolveValue(value, base) as T;
}
