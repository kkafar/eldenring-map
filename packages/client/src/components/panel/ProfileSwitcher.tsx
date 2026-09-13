import { Link } from "@tanstack/react-router";

interface ProfileSwitcherProps {
  profiles: ReadonlyArray<{ id: number; name: string }>;
  profileId: number | null;
  onChange: (id: number) => void;
}

export function ProfileSwitcher({
  profiles,
  profileId,
  onChange,
}: ProfileSwitcherProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="opacity-70">Profile</span>
        <select
          value={profileId ?? ""}
          onChange={(e) => onChange(Number(e.target.value))}
          className="rounded border border-outline bg-surface px-2 py-1"
        >
          {profiles.length === 0 && <option value="">none</option>}
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <Link to="/profiles" className="underline">
        Manage
      </Link>
    </div>
  );
}
