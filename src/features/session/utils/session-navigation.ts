import type { GroupRole } from "../types/session.types";
import {
  preserveSearchParams,
  type SearchParamReader,
} from "@/shared/lib/navigation/preserveSearchParams";

const sessionContextKeys = ["scenario", "role"] as const;

export function getMockGroupRole(searchParams: SearchParamReader): GroupRole {
  return searchParams.get("role") === "admin" ? "ADMIN" : "USER";
}

export function withSessionContext(
  href: string,
  searchParams: SearchParamReader,
) {
  return preserveSearchParams(href, searchParams, sessionContextKeys);
}
