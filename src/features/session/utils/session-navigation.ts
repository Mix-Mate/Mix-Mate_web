import {
  preserveSearchParams,
  type SearchParamReader,
} from "@/shared/lib/navigation/preserveSearchParams";

const sessionContextKeys = ["scenario"] as const;

export function withSessionContext(
  href: string,
  searchParams: SearchParamReader,
) {
  return preserveSearchParams(href, searchParams, sessionContextKeys);
}
