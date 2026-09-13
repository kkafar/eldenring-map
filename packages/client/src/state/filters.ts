import { useLocalStorageState } from "./useLocalStorageState";

export type DoneFilter = "all" | "done" | "todo";

export interface Filters {
  // null = every category enabled.
  categoryIds: number[] | null;
  done: DoneFilter;
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  categoryIds: null,
  done: "all",
  query: "",
};

function parseFilters(raw: unknown): Filters | undefined {
  if (typeof raw !== "object" || raw === null) return undefined;
  const r = raw as Partial<Filters>;
  const categoryIds =
    r.categoryIds === null || r.categoryIds === undefined
      ? null
      : Array.isArray(r.categoryIds)
        ? r.categoryIds.filter((id): id is number => Number.isInteger(id))
        : null;
  const done = r.done === "done" || r.done === "todo" ? r.done : "all";
  return { categoryIds, done, query: "" };
}

export function useFilters() {
  return useLocalStorageState<Filters>(
    "mapFilters",
    DEFAULT_FILTERS,
    parseFilters,
  );
}
