import { useMemo } from "react";
import {
  categoryPath,
  iconFor,
  type CategoryRow,
  type MarkerRow,
} from "../../lib/markers";

interface MarkerListProps {
  markers: MarkerRow[];
  categoryById: Map<number, CategoryRow>;
  visibleIds: ReadonlySet<number> | null;
  doneIds: ReadonlySet<number>;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const MAX_ROWS = 300;

export function MarkerList({
  markers,
  categoryById,
  visibleIds,
  doneIds,
  selectedId,
  onSelect,
}: MarkerListProps) {
  const rows = useMemo(
    () =>
      markers
        .filter((m) => !visibleIds || visibleIds.has(m.id))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [markers, visibleIds],
  );

  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="opacity-70">
        {rows.length} markers
        {rows.length > MAX_ROWS ? `, showing the first ${MAX_ROWS}` : ""}
      </p>
      <ul className="flex flex-col">
        {rows.slice(0, MAX_ROWS).map((m) => {
          const done = doneIds.has(m.id);
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className={
                  "flex w-full items-center gap-2 rounded px-2 py-1 text-left hover:bg-surface-variant " +
                  (m.id === selectedId
                    ? "bg-primary-container text-on-primary-container"
                    : "")
                }
              >
                <img
                  src={`/icons/${iconFor(m, categoryById)}`}
                  alt=""
                  className="h-5 w-5 object-contain"
                />
                <span
                  className={
                    "min-w-0 flex-1 truncate " +
                    (done ? "line-through opacity-60" : "")
                  }
                >
                  {m.name}
                </span>
                <span className="shrink-0 text-xs opacity-60">
                  {categoryPath(m, categoryById)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
