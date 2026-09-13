import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { trpc } from "../api";
import { PageTitleText } from "../components/PageTitleText";
import type { CategoryRow } from "../lib/markers";

export const Route = createFileRoute("/categories")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(
        context.trpc.categories.list.queryOptions(),
      ),
      context.queryClient.ensureQueryData(
        context.trpc.categories.icons.queryOptions(),
      ),
    ]),
  component: CategoriesPage,
});

function CategoriesPage() {
  const queryClient = useQueryClient();
  const { data: categories } = useSuspenseQuery(
    trpc.categories.list.queryOptions(),
  );
  const { data: icons } = useSuspenseQuery(
    trpc.categories.icons.queryOptions(),
  );
  const invalidate = () =>
    queryClient.invalidateQueries(trpc.categories.list.pathFilter());
  const create = useMutation(
    trpc.categories.create.mutationOptions({ onSuccess: invalidate }),
  );
  const update = useMutation(
    trpc.categories.update.mutationOptions({ onSuccess: invalidate }),
  );
  const remove = useMutation(
    trpc.categories.delete.mutationOptions({ onSuccess: invalidate }),
  );
  const roots = useMemo(
    () => categories.filter((c) => c.parentId === null),
    [categories],
  );
  const error = create.error ?? update.error ?? remove.error;

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-6 text-on-surface">
      <div className="flex items-baseline justify-between">
        <PageTitleText title="Categories" />
        <Link
          to="/map/$mapId"
          params={{ mapId: "overworld" }}
          className="underline"
        >
          Back to map
        </Link>
      </div>
      <p className="opacity-70">
        Two levels: categories (with the verb used for progress, e.g. discovered
        / collected) and their subcategories. Icons come from the server's icon
        set.
      </p>
      {error && <p className="text-error">{error.message}</p>}
      <NewCategoryForm
        label="New category"
        icons={icons}
        withVerb
        pending={create.isPending}
        onCreate={(values) => create.mutate(values)}
      />
      <ul className="flex flex-col gap-4">
        {roots.map((root) => (
          <li
            key={root.id}
            className="flex flex-col gap-2 rounded border border-outline p-3"
          >
            <CategoryEditor
              category={root}
              icons={icons}
              withVerb
              onSave={(changes) => update.mutate({ id: root.id, ...changes })}
              onDelete={() => remove.mutate({ id: root.id })}
            />
            <ul className="ml-6 flex flex-col gap-1">
              {categories
                .filter((c) => c.parentId === root.id)
                .map((sub) => (
                  <li key={sub.id}>
                    <CategoryEditor
                      category={sub}
                      icons={icons}
                      onSave={(changes) =>
                        update.mutate({ id: sub.id, ...changes })
                      }
                      onDelete={() => remove.mutate({ id: sub.id })}
                    />
                  </li>
                ))}
              <li>
                <NewCategoryForm
                  label={`New subcategory of ${root.name}`}
                  icons={icons}
                  pending={create.isPending}
                  onCreate={(values) =>
                    create.mutate({ ...values, parentId: root.id })
                  }
                />
              </li>
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}

interface CategoryEditorProps {
  category: CategoryRow;
  icons: string[];
  withVerb?: boolean;
  onSave: (changes: {
    name: string;
    icon: string | null;
    doneVerb?: string;
  }) => void;
  onDelete: () => void;
}

function CategoryEditor({
  category,
  icons,
  withVerb,
  onSave,
  onDelete,
}: CategoryEditorProps) {
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [verb, setVerb] = useState(category.doneVerb);
  const dirty =
    name !== category.name ||
    icon !== category.icon ||
    verb !== category.doneVerb;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {icon && (
        <img src={`/icons/${icon}`} alt="" className="h-6 w-6 object-contain" />
      )}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-40 flex-1 rounded border border-outline bg-surface px-2 py-1"
      />
      <IconSelect icons={icons} value={icon} onChange={setIcon} />
      {withVerb && (
        <input
          value={verb}
          onChange={(e) => setVerb(e.target.value)}
          title="Verb shown when a marker is done"
          className="w-28 rounded border border-outline bg-surface px-2 py-1"
        />
      )}
      <button
        type="button"
        disabled={!dirty || !name.trim()}
        onClick={() =>
          onSave({ name, icon, ...(withVerb ? { doneVerb: verb } : {}) })
        }
        className="rounded px-2 py-1 underline disabled:opacity-40"
      >
        Save
      </button>
      <button
        type="button"
        onClick={() => {
          if (window.confirm(`Delete category "${category.name}"?`)) onDelete();
        }}
        className="rounded px-2 py-1 text-error underline"
      >
        Delete
      </button>
    </div>
  );
}

interface NewCategoryFormProps {
  label: string;
  icons: string[];
  withVerb?: boolean;
  pending: boolean;
  onCreate: (values: {
    name: string;
    icon: string | null;
    doneVerb?: string;
  }) => void;
}

function NewCategoryForm({
  label,
  icons,
  withVerb,
  pending,
  onCreate,
}: NewCategoryFormProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<string | null>(null);
  const [verb, setVerb] = useState("done");
  return (
    <form
      className="flex flex-wrap items-center gap-2 text-sm"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate({ name, icon, ...(withVerb ? { doneVerb: verb } : {}) });
        setName("");
      }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={label}
        className="min-w-40 flex-1 rounded border border-outline bg-surface px-2 py-1"
      />
      <IconSelect icons={icons} value={icon} onChange={setIcon} />
      {withVerb && (
        <input
          value={verb}
          onChange={(e) => setVerb(e.target.value)}
          title="Verb shown when a marker is done"
          className="w-28 rounded border border-outline bg-surface px-2 py-1"
        />
      )}
      <button
        type="submit"
        disabled={pending || !name.trim()}
        className="rounded bg-primary px-3 py-1 text-on-primary disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

function IconSelect({
  icons,
  value,
  onChange,
}: {
  icons: string[];
  value: string | null;
  onChange: (icon: string | null) => void;
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="max-w-48 rounded border border-outline bg-surface px-2 py-1"
    >
      <option value="">No icon</option>
      {icons.map((file) => (
        <option key={file} value={file}>
          {file.replace(/\.png$/, "")}
        </option>
      ))}
    </select>
  );
}
