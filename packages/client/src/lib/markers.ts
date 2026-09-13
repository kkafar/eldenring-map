import type { Filters } from "../state/filters";

export interface CategoryRow {
  id: number;
  parentId: number | null;
  name: string;
  icon: string | null;
  doneVerb: string;
}

export interface MarkerRow {
  id: number;
  name: string;
  categoryId: number;
  subcategoryId: number | null;
  x: number;
  y: number;
  icon: string | null;
}

export const FALLBACK_ICON = "marker-generic-06-diamond.png";

export function iconFor(
  m: MarkerRow,
  categoryById: Map<number, CategoryRow>,
): string {
  return (
    m.icon ??
    (m.subcategoryId ? categoryById.get(m.subcategoryId)?.icon : null) ??
    categoryById.get(m.categoryId)?.icon ??
    FALLBACK_ICON
  );
}

export function categoryPath(
  m: MarkerRow,
  categoryById: Map<number, CategoryRow>,
): string {
  return [
    categoryById.get(m.categoryId)?.name,
    categoryById.get(m.subcategoryId ?? -1)?.name,
  ]
    .filter(Boolean)
    .join(" › ");
}

// null means "nothing filtered out", which lets the layer skip the check entirely.
export function computeVisibleIds(
  markers: readonly MarkerRow[],
  filters: Filters,
  doneIds: ReadonlySet<number>,
): Set<number> | null {
  const query = filters.query.trim().toLowerCase();
  const enabled =
    filters.categoryIds === null ? null : new Set(filters.categoryIds);
  if (!query && filters.done === "all" && enabled === null) return null;
  const visible = new Set<number>();
  for (const m of markers) {
    if (enabled && !enabled.has(m.subcategoryId ?? m.categoryId)) continue;
    if (filters.done === "done" && !doneIds.has(m.id)) continue;
    if (filters.done === "todo" && doneIds.has(m.id)) continue;
    if (query && !m.name.toLowerCase().includes(query)) continue;
    visible.add(m.id);
  }
  return visible;
}
