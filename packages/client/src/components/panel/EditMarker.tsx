import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "../../api";
import type { CategoryRow } from "../../lib/markers";
import { MarkerForm } from "./MarkerForm";

interface EditMarkerProps {
  id: number;
  categories: CategoryRow[];
  onDone: () => void;
}

export function EditMarker({ id, categories, onDone }: EditMarkerProps) {
  const queryClient = useQueryClient();
  const query = useQuery(trpc.markers.get.queryOptions({ id }));
  const update = useMutation(
    trpc.markers.update.mutationOptions({
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries(trpc.markers.list.pathFilter()),
          queryClient.invalidateQueries(trpc.markers.get.queryFilter({ id })),
        ]);
        onDone();
      },
    }),
  );
  if (query.isPending) return <p>Loading…</p>;
  if (query.isError) return <p className="text-error">{query.error.message}</p>;
  const m = query.data;
  return (
    <MarkerForm
      title={`Edit ${m.name}`}
      categories={categories}
      position={{ x: m.x, y: m.y }}
      initial={{
        name: m.name,
        categoryId: m.categoryId,
        subcategoryId: m.subcategoryId,
        description: m.description,
        image: m.image,
      }}
      submitting={update.isPending}
      error={update.error?.message}
      onSubmit={(values) =>
        update.mutate({
          id,
          name: values.name,
          categoryId: values.categoryId ?? undefined,
          subcategoryId: values.subcategoryId,
          description: values.description,
          image: values.image,
        })
      }
      onCancel={onDone}
    />
  );
}
