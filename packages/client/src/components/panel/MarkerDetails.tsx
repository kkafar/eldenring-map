import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { trpc } from "../../api";
import type { CategoryRow } from "../../lib/markers";
import { NoteEditor } from "./NoteEditor";

interface MarkerDetailsProps {
  id: number;
  profileId: number | null;
  categoryById: Map<number, CategoryRow>;
  done: boolean;
  note: string;
  onShowOnMap: () => void;
  onEdit: () => void;
  onMove: () => void;
  onDeleted: () => void;
}

export function MarkerDetails({
  id,
  profileId,
  categoryById,
  done,
  note,
  onShowOnMap,
  onEdit,
  onMove,
  onDeleted,
}: MarkerDetailsProps) {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.markers.get.queryOptions({ id }));
  const setDone = useMutation(
    trpc.progress.set.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.progress.list.pathFilter()),
    }),
  );
  const saveNote = useMutation(
    trpc.notes.upsert.mutationOptions({
      onSuccess: () =>
        queryClient.invalidateQueries(trpc.notes.list.pathFilter()),
    }),
  );
  const remove = useMutation(
    trpc.markers.delete.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.markers.list.pathFilter());
        onDeleted();
      },
    }),
  );

  if (query.isPending) return <p>Loading…</p>;
  if (query.isError) return <p className="text-error">{query.error.message}</p>;
  const m = query.data;
  const category = categoryById.get(m.subcategoryId ?? m.categoryId);
  const verb = category?.doneVerb ?? "done";
  const path = [
    categoryById.get(m.categoryId)?.name,
    categoryById.get(m.subcategoryId ?? -1)?.name,
  ]
    .filter(Boolean)
    .join(" › ");

  return (
    <article className="flex flex-col gap-3">
      <div>
        <h2 className="text-2xl font-semibold">{m.name}</h2>
        <p className="text-sm opacity-70">{path}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          disabled={profileId === null || setDone.isPending}
          onClick={() =>
            profileId !== null &&
            setDone.mutate({ profileId, markerId: id, done: !done })
          }
          className={
            "rounded px-3 py-1 disabled:opacity-50 " +
            (done
              ? "bg-surface-variant text-on-surface-variant"
              : "bg-primary text-on-primary")
          }
        >
          {done ? `Undo ${verb}` : `Mark ${verb}`}
        </button>
        <button
          type="button"
          onClick={onShowOnMap}
          className="rounded px-3 py-1 underline"
        >
          Show on map
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="rounded px-3 py-1 underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onMove}
          className="rounded px-3 py-1 underline"
        >
          Move
        </button>
        <button
          type="button"
          disabled={remove.isPending}
          onClick={() => {
            if (
              window.confirm(
                `Delete "${m.name}"? Progress and notes for it are removed too.`,
              )
            ) {
              remove.mutate({ id });
            }
          }}
          className="rounded px-3 py-1 text-error underline disabled:opacity-50"
        >
          Delete
        </button>
      </div>
      {remove.isError && (
        <p className="text-sm text-error">{remove.error.message}</p>
      )}
      {m.image && (
        <img src={`/uploads/${m.image}`} alt="" className="rounded" />
      )}
      <div className="text-sm leading-relaxed [&_a]:underline [&_li]:ml-4 [&_li]:list-disc [&_p]:mb-2">
        <ReactMarkdown>{m.description}</ReactMarkdown>
      </div>
      {m.wikiUrl && (
        <a
          href={m.wikiUrl}
          target="_blank"
          rel="noreferrer"
          className="self-start underline"
        >
          Wiki page
        </a>
      )}
      <section className="flex flex-col gap-2 border-t border-outline pt-3">
        <h3 className="font-medium">Note</h3>
        {profileId === null ? (
          <p className="text-sm opacity-70">Create a profile to keep notes.</p>
        ) : (
          <NoteEditor
            key={`${profileId}:${id}`}
            body={note}
            saving={saveNote.isPending}
            onSave={(body) =>
              saveNote.mutate({ profileId, markerId: id, body })
            }
          />
        )}
      </section>
    </article>
  );
}
