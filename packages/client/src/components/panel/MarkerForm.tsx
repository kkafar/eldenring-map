import { useMemo, useState } from "react";
import type { CategoryRow } from "../../lib/markers";
import type { Px } from "../map/pixelCrs";

export interface MarkerFormValues {
  name: string;
  categoryId: number | null;
  subcategoryId: number | null;
  description: string;
  image: string | null;
}

interface MarkerFormProps {
  title: string;
  categories: CategoryRow[];
  position: Px;
  initial?: MarkerFormValues;
  submitting: boolean;
  error?: string;
  onSubmit: (values: MarkerFormValues) => void;
  onCancel: () => void;
}

const EMPTY: MarkerFormValues = {
  name: "",
  categoryId: null,
  subcategoryId: null,
  description: "",
  image: null,
};

export function MarkerForm({
  title,
  categories,
  position,
  initial,
  submitting,
  error,
  onSubmit,
  onCancel,
}: MarkerFormProps) {
  const [values, setValues] = useState<MarkerFormValues>(initial ?? EMPTY);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const roots = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  );
  const children = useMemo(
    () => categories.filter((c) => c.parentId === values.categoryId),
    [categories, values.categoryId],
  );
  const patch = (changes: Partial<MarkerFormValues>) =>
    setValues((v) => ({ ...v, ...changes }));

  const upload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = (await res.json()) as { filename?: string; error?: string };
      if (!res.ok || !json.filename)
        throw new Error(json.error ?? `upload failed (${res.status})`);
      patch({ image: json.filename });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (values.name.trim() && values.categoryId !== null) onSubmit(values);
      }}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-xs opacity-70">
        Position: {Math.round(position.x)}, {Math.round(position.y)}
      </p>
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          value={values.name}
          onChange={(e) => patch({ name: e.target.value })}
          required
          className="rounded border border-outline bg-surface px-3 py-2"
        />
      </label>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex flex-col gap-1">
          Category
          <select
            value={values.categoryId ?? ""}
            onChange={(e) =>
              patch({
                categoryId: e.target.value ? Number(e.target.value) : null,
                subcategoryId: null,
              })
            }
            required
            className="rounded border border-outline bg-surface px-2 py-2"
          >
            <option value="">Choose…</option>
            {roots.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Subcategory
          <select
            value={values.subcategoryId ?? ""}
            onChange={(e) =>
              patch({
                subcategoryId: e.target.value ? Number(e.target.value) : null,
              })
            }
            disabled={children.length === 0}
            className="rounded border border-outline bg-surface px-2 py-2 disabled:opacity-50"
          >
            <option value="">None</option>
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        Description (Markdown)
        <textarea
          value={values.description}
          onChange={(e) => patch({ description: e.target.value })}
          rows={5}
          className="rounded border border-outline bg-surface px-3 py-2"
        />
      </label>
      <div className="flex flex-col gap-1 text-sm">
        <span>Image</span>
        {values.image && (
          <img
            src={`/uploads/${values.image}`}
            alt=""
            className="max-h-40 self-start rounded"
          />
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          {values.image && (
            <button
              type="button"
              onClick={() => patch({ image: null })}
              className="underline"
            >
              Remove
            </button>
          )}
        </div>
        {uploading && <span className="opacity-70">Uploading…</span>}
        {uploadError && <span className="text-error">{uploadError}</span>}
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded bg-primary px-4 py-2 text-sm text-on-primary disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded px-4 py-2 text-sm underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
