import { useMemo } from "react";
import type { CategoryRow } from "../../lib/markers";
import type { DoneFilter, Filters } from "../../state/filters";

interface FiltersPanelProps {
  categories: CategoryRow[];
  filters: Filters;
  onChange: (next: Filters) => void;
}

const DONE_OPTIONS: Array<[DoneFilter, string]> = [
  ["all", "All"],
  ["todo", "To do"],
  ["done", "Done"],
];

export function FiltersPanel({
  categories,
  filters,
  onChange,
}: FiltersPanelProps) {
  const roots = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  );
  const childrenOf = useMemo(() => {
    const map = new Map<number, CategoryRow[]>();
    for (const c of categories) {
      if (c.parentId === null) continue;
      map.set(c.parentId, [...(map.get(c.parentId) ?? []), c]);
    }
    return map;
  }, [categories]);

  const enabled =
    filters.categoryIds === null ? null : new Set(filters.categoryIds);
  const isOn = (id: number) => enabled === null || enabled.has(id);

  const updateIds = (mutate: (set: Set<number>) => void) => {
    const set = new Set(enabled ?? categories.map((c) => c.id));
    mutate(set);
    const all = set.size === categories.length;
    onChange({ ...filters, categoryIds: all ? null : [...set] });
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        placeholder="Search by name…"
        className="rounded border border-outline bg-surface px-3 py-2 text-sm"
      />
      <div className="flex gap-1 text-sm">
        {DONE_OPTIONS.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onChange({ ...filters, done: value })}
            className={
              "rounded px-3 py-1 " +
              (filters.done === value
                ? "bg-primary text-on-primary"
                : "bg-surface-variant text-on-surface-variant")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {roots.map((root) => {
          const children = childrenOf.get(root.id) ?? [];
          const ids = [root.id, ...children.map((c) => c.id)];
          const onCount = ids.filter(isOn).length;
          const allOn = onCount === ids.length;
          return (
            <li key={root.id}>
              <label className="flex items-center gap-2 font-medium">
                <input
                  type="checkbox"
                  checked={allOn}
                  ref={(el) => {
                    if (el) el.indeterminate = onCount > 0 && !allOn;
                  }}
                  onChange={() =>
                    updateIds((set) =>
                      ids.forEach((id) =>
                        allOn ? set.delete(id) : set.add(id),
                      ),
                    )
                  }
                />
                {root.name}
              </label>
              {children.length > 0 && (
                <ul className="ml-5 grid grid-cols-2 gap-x-2">
                  {children.map((c) => (
                    <li key={c.id}>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isOn(c.id)}
                          onChange={() =>
                            updateIds((set) =>
                              isOn(c.id) ? set.delete(c.id) : set.add(c.id),
                            )
                          }
                        />
                        <span className="truncate">{c.name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
