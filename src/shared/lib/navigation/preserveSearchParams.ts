export interface SearchParamReader {
  get(name: string): string | null;
}

export function preserveSearchParams(
  href: string,
  searchParams: SearchParamReader,
  keys: readonly string[],
) {
  const [pathname, query = ""] = href.split("?");
  const nextSearchParams = new URLSearchParams(query);

  keys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) nextSearchParams.set(key, value);
  });

  const nextQuery = nextSearchParams.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}
