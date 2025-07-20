import { createFileRoute } from '@tanstack/react-router'
import React from 'react';
import CategoryMappingContext from '../../contexts/CategoryMappingContext';
import ItemDataContext from '../../contexts/ItemDataContext';
import MapCanvas from '../../components/MapCanvas';

export const Route = createFileRoute('/map/v1')({
  component: RouteComponent,
})

function RouteComponent() {
  const markerDescriptions = React.useContext(ItemDataContext);
  const categoryMapping = React.useContext(CategoryMappingContext);

  return (
    <MapCanvas data={markerDescriptions} categoryMapping={categoryMapping} />
  );
}
