import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import type * as L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { trpc } from "../api";
import type { LayerMarker } from "../components/map/CanvasMarkerLayer";
import { GameMap } from "../components/map/GameMap";
import { toLatLng, type Px } from "../components/map/pixelCrs";
import { EditMarker } from "../components/panel/EditMarker";
import { FiltersPanel } from "../components/panel/Filters";
import { MapSwitcher } from "../components/panel/MapSwitcher";
import { MarkerDetails } from "../components/panel/MarkerDetails";
import { MarkerForm } from "../components/panel/MarkerForm";
import { MarkerList } from "../components/panel/MarkerList";
import { ProfileSwitcher } from "../components/panel/ProfileSwitcher";
import { computeVisibleIds, iconFor } from "../lib/markers";
import { useActiveProfile } from "../state/activeProfile";
import { useFilters } from "../state/filters";

interface MapSearch {
  marker?: number;
}

type Tab = "markers" | "details";
type Placing = { mode: "create" } | { mode: "move"; id: number } | null;

const EMPTY_IDS: ReadonlySet<number> = new Set();
const FLY_TO_MIN_ZOOM = 5;

export const Route = createFileRoute("/map/$mapId")({
  validateSearch: (search: Record<string, unknown>): MapSearch => {
    const raw = search.marker;
    const id =
      typeof raw === "number"
        ? raw
        : typeof raw === "string"
          ? Number(raw)
          : NaN;
    return Number.isInteger(id) && id > 0 ? { marker: id } : {};
  },
  loader: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.maps.list.queryOptions(),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.maps.get.queryOptions({ id: params.mapId }),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.markers.list.queryOptions(
          { mapId: params.mapId },
          { staleTime: Infinity },
        ),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.categories.list.queryOptions(),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.profiles.list.queryOptions(),
      ),
    ]);
  },
  component: MapPage,
});

function MapPage() {
  const { mapId } = Route.useParams();
  const { marker: selectedId = null } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const mapRef = useRef<L.Map | null>(null);

  const { data: maps } = useSuspenseQuery(trpc.maps.list.queryOptions());
  const { data: map } = useSuspenseQuery(
    trpc.maps.get.queryOptions({ id: mapId }),
  );
  const { data: markers } = useSuspenseQuery(
    trpc.markers.list.queryOptions({ mapId }, { staleTime: Infinity }),
  );
  const { data: categories } = useSuspenseQuery(
    trpc.categories.list.queryOptions(),
  );
  const { data: profiles } = useSuspenseQuery(
    trpc.profiles.list.queryOptions(),
  );
  const [profileId, setProfileId] = useActiveProfile(profiles);
  const { data: progress } = useQuery(
    trpc.progress.list.queryOptions(
      { profileId: profileId ?? 0 },
      { enabled: profileId !== null },
    ),
  );
  const { data: notes } = useQuery(
    trpc.notes.list.queryOptions(
      { profileId: profileId ?? 0 },
      { enabled: profileId !== null },
    ),
  );

  const [filters, setFilters] = useFilters();
  const [tab, setTab] = useState<Tab>("markers");
  const [placing, setPlacing] = useState<Placing>(null);
  const [draft, setDraft] = useState<Px | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  useEffect(() => {
    if (selectedId !== null) setTab("details");
    setEditingId(null);
  }, [selectedId]);
  useEffect(() => {
    if (!placing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPlacing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [placing]);

  const invalidateMarkers = () =>
    queryClient.invalidateQueries(trpc.markers.list.pathFilter());
  const createMarker = useMutation(
    trpc.markers.create.mutationOptions({
      onSuccess: async (created) => {
        await invalidateMarkers();
        setDraft(null);
        select(created.id);
      },
    }),
  );
  const moveMarker = useMutation(
    trpc.markers.update.mutationOptions({
      onSuccess: async (moved) => {
        await Promise.all([
          invalidateMarkers(),
          queryClient.invalidateQueries(
            trpc.markers.get.queryFilter({ id: moved.id }),
          ),
        ]);
      },
    }),
  );

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );
  const doneIds = useMemo<ReadonlySet<number>>(
    () => (progress ? new Set(progress.map((p) => p.markerId)) : EMPTY_IDS),
    [progress],
  );
  const noteByMarker = useMemo(
    () => new Map((notes ?? []).map((n) => [n.markerId, n.body])),
    [notes],
  );
  const visibleIds = useMemo(
    () => computeVisibleIds(markers, filters, doneIds),
    [markers, filters, doneIds],
  );
  const layerMarkers = useMemo<LayerMarker[]>(
    () =>
      markers.map((m) => ({
        id: m.id,
        x: m.x,
        y: m.y,
        name: m.name,
        icon: iconFor(m, categoryById),
      })),
    [markers, categoryById],
  );

  const select = (id: number | null) =>
    void navigate({ search: (prev) => ({ ...prev, marker: id ?? undefined }) });
  const flyTo = (id: number) => {
    const m = markers.find((row) => row.id === id);
    const leafletMap = mapRef.current;
    if (!m || !leafletMap) return;
    leafletMap.flyTo(
      toLatLng(m),
      Math.max(leafletMap.getZoom(), FLY_TO_MIN_ZOOM),
      {
        duration: 0.6,
      },
    );
  };
  const onMapClick = (p: Px) => {
    if (!placing) return;
    if (placing.mode === "create") {
      setDraft(p);
      setEditingId(null);
    } else {
      moveMarker.mutate({ id: placing.id, x: p.x, y: p.y });
    }
    setPlacing(null);
  };

  const panel = draft ? (
    <MarkerForm
      title="New marker"
      categories={categories}
      position={draft}
      submitting={createMarker.isPending}
      error={createMarker.error?.message}
      onSubmit={(values) =>
        createMarker.mutate({
          mapId,
          categoryId: values.categoryId!,
          subcategoryId: values.subcategoryId,
          name: values.name,
          description: values.description,
          image: values.image,
          x: draft.x,
          y: draft.y,
        })
      }
      onCancel={() => setDraft(null)}
    />
  ) : editingId !== null ? (
    <EditMarker
      id={editingId}
      categories={categories}
      onDone={() => setEditingId(null)}
    />
  ) : tab === "markers" ? (
    <div className="flex flex-col gap-4">
      <FiltersPanel
        categories={categories}
        filters={filters}
        onChange={setFilters}
      />
      <MarkerList
        markers={markers}
        categoryById={categoryById}
        visibleIds={visibleIds}
        doneIds={doneIds}
        selectedId={selectedId}
        onSelect={(id) => {
          select(id);
          setTab("details");
          flyTo(id);
        }}
      />
    </div>
  ) : selectedId === null ? (
    <p className="opacity-70">
      Click a marker on the map or pick one from the list.
    </p>
  ) : (
    <MarkerDetails
      key={selectedId}
      id={selectedId}
      profileId={profileId}
      categoryById={categoryById}
      done={doneIds.has(selectedId)}
      note={noteByMarker.get(selectedId) ?? ""}
      onShowOnMap={() => flyTo(selectedId)}
      onEdit={() => setEditingId(selectedId)}
      onMove={() => setPlacing({ mode: "move", id: selectedId })}
      onDeleted={() => select(null)}
    />
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface text-on-surface">
      <div className="relative min-w-0 flex-1">
        <GameMap
          key={mapId}
          map={map}
          mapRef={mapRef}
          markers={layerMarkers}
          visibleIds={visibleIds}
          doneIds={doneIds}
          selectedId={selectedId}
          placing={placing !== null}
          onMarkerClick={select}
          onMapClick={onMapClick}
        />
        {placing && (
          <div className="pointer-events-none absolute inset-x-0 top-3 z-[1000] flex justify-center">
            <p className="rounded bg-primary px-3 py-1 text-sm text-on-primary shadow">
              {placing.mode === "create"
                ? "Click the map to place the new marker"
                : "Click the new position"}{" "}
              (Esc cancels)
            </p>
          </div>
        )}
      </div>
      <aside className="flex w-96 shrink-0 flex-col border-l border-outline">
        <header className="flex flex-col gap-2 border-b border-outline p-3">
          <MapSwitcher maps={maps} mapId={mapId} />
          <ProfileSwitcher
            profiles={profiles}
            profileId={profileId}
            onChange={setProfileId}
          />
          <div className="flex items-center gap-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setPlacing(
                  placing?.mode === "create" ? null : { mode: "create" },
                );
              }}
              className={
                "rounded px-3 py-1 " +
                (placing?.mode === "create"
                  ? "bg-surface-variant text-on-surface-variant"
                  : "bg-primary text-on-primary")
              }
            >
              {placing?.mode === "create" ? "Cancel placing" : "Add marker"}
            </button>
            <Link to="/categories" className="underline">
              Categories
            </Link>
          </div>
        </header>
        <nav className="flex border-b border-outline text-sm">
          {(["markers", "details"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                setDraft(null);
                setEditingId(null);
              }}
              className={
                "flex-1 px-3 py-2 capitalize " +
                (tab === t
                  ? "border-b-2 border-primary font-medium"
                  : "opacity-70")
              }
            >
              {t}
            </button>
          ))}
        </nav>
        <div className="flex-1 overflow-y-auto p-3">{panel}</div>
      </aside>
    </div>
  );
}
