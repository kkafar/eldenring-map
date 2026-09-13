import { useEffect, useState } from "react";

interface NoteEditorProps {
  body: string;
  saving: boolean;
  onSave: (body: string) => void;
}

export function NoteEditor({ body, saving, onSave }: NoteEditorProps) {
  const [draft, setDraft] = useState(body);
  useEffect(() => setDraft(body), [body]);
  const dirty = draft !== body;

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={5}
        placeholder="Your note for this marker (Markdown)…"
        className="w-full rounded border border-outline bg-surface px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={() => onSave(draft)}
          className="rounded bg-primary px-3 py-1 text-sm text-on-primary disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
        {dirty && (
          <button
            type="button"
            onClick={() => setDraft(body)}
            className="rounded px-3 py-1 text-sm underline"
          >
            Discard
          </button>
        )}
      </div>
    </div>
  );
}
