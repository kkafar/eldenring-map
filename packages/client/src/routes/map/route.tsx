import { createFileRoute, Outlet } from '@tanstack/react-router'
import CategoryMappingContext, { categoryMapping } from '../../contexts/CategoryMappingContext'
import ItemDataContext, { preprocessedItemData } from '../../contexts/ItemDataContext'

export const Route = createFileRoute('/map')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <CategoryMappingContext.Provider value={categoryMapping}>
      <ItemDataContext.Provider value={preprocessedItemData}>
        <Outlet />
      </ItemDataContext.Provider>
    </CategoryMappingContext.Provider>
  );
}
