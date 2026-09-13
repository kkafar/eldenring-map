import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { trpc } from "../api";
import { PageTitleText } from "../components/PageTitleText";

export const Route = createFileRoute("/profiles")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      context.trpc.profiles.list.queryOptions(),
    ),
  component: ProfilesPage,
});

function ProfilesPage() {
  const queryClient = useQueryClient();
  const { data: profiles } = useSuspenseQuery(
    trpc.profiles.list.queryOptions(),
  );
  const invalidate = () =>
    queryClient.invalidateQueries(trpc.profiles.list.pathFilter());
  const create = useMutation(
    trpc.profiles.create.mutationOptions({ onSuccess: invalidate }),
  );
  const rename = useMutation(
    trpc.profiles.rename.mutationOptions({ onSuccess: invalidate }),
  );
  const remove = useMutation(
    trpc.profiles.delete.mutationOptions({ onSuccess: invalidate }),
  );
  const [newName, setNewName] = useState("");
  const error = create.error ?? rename.error ?? remove.error;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6 text-on-surface">
      <div className="flex items-baseline justify-between">
        <PageTitleText title="Profiles" />
        <Link
          to="/map/$mapId"
          params={{ mapId: "overworld" }}
          className="underline"
        >
          Back to map
        </Link>
      </div>
      <p className="opacity-70">
        A profile is one playthrough: discovered and collected markers and notes
        are tracked per profile.
      </p>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          create.mutate({ name: newName }, { onSuccess: () => setNewName("") });
        }}
      >
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New profile name"
          className="flex-1 rounded border border-outline bg-surface px-3 py-2"
        />
        <button
          type="submit"
          disabled={create.isPending}
          className="rounded bg-primary px-4 py-2 text-on-primary disabled:opacity-50"
        >
          Create
        </button>
      </form>
      {error && <p className="text-error">{error.message}</p>}
      <ul className="flex flex-col gap-2">
        {profiles.map((p) => (
          <ProfileRow
            key={p.id}
            name={p.name}
            onRename={(name) => rename.mutate({ id: p.id, name })}
            onDelete={() => {
              if (
                window.confirm(
                  `Delete profile "${p.name}" and all its progress and notes?`,
                )
              ) {
                remove.mutate({ id: p.id });
              }
            }}
          />
        ))}
      </ul>
    </main>
  );
}

interface ProfileRowProps {
  name: string;
  onRename: (name: string) => void;
  onDelete: () => void;
}

function ProfileRow({ name, onRename, onDelete }: ProfileRowProps) {
  const [draft, setDraft] = useState(name);
  return (
    <li className="flex items-center gap-2 rounded border border-outline p-2">
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="flex-1 rounded bg-surface px-2 py-1"
      />
      <button
        type="button"
        disabled={draft.trim() === "" || draft === name}
        onClick={() => onRename(draft)}
        className="rounded px-3 py-1 underline disabled:opacity-40"
      >
        Rename
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="rounded px-3 py-1 text-error underline"
      >
        Delete
      </button>
    </li>
  );
}
