import { useNavigate } from "@tanstack/react-router";

interface MapSwitcherProps {
  maps: ReadonlyArray<{ id: string; name: string }>;
  mapId: string;
}

export function MapSwitcher({ maps, mapId }: MapSwitcherProps) {
  const navigate = useNavigate();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="opacity-70">Map</span>
      <select
        value={mapId}
        onChange={(e) =>
          void navigate({
            to: "/map/$mapId",
            params: { mapId: e.target.value },
          })
        }
        className="rounded border border-outline bg-surface px-2 py-1"
      >
        {maps.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </label>
  );
}
