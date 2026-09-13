import { useLocalStorageState } from "./useLocalStorageState";

// The active profile is a client-side preference; every progress/note call sends it explicitly.
export function useActiveProfile(profiles: ReadonlyArray<{ id: number }>) {
  const [stored, setStored] = useLocalStorageState<number | null>(
    "activeProfileId",
    null,
    (raw) => (typeof raw === "number" || raw === null ? raw : undefined),
  );
  const profileId = profiles.some((p) => p.id === stored)
    ? stored
    : (profiles[0]?.id ?? null);
  return [profileId, setStored] as const;
}
