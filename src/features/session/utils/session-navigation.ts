import type { GroupRole } from "../types/session.types";

interface SearchParamReader {
  get(name: string): string | null;
}

const sessionContextKeys = ["scenario", "role"] as const;

export function getMockGroupRole(searchParams: SearchParamReader): GroupRole {
  return searchParams.get("role") === "admin" ? "ADMIN" : "USER";
}

export function withSessionContext(
  href: string,
  searchParams: SearchParamReader,
) {
  const [pathname, query = ""] = href.split("?");
  const nextSearchParams = new URLSearchParams(query);

  sessionContextKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value) nextSearchParams.set(key, value);
  });

  const nextQuery = nextSearchParams.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}
