import React from 'react'
import Map from '../../components/Map'
import ItemDataContext from '../../contexts/ItemDataContext'
import CategoryMappingContext from '../../contexts/CategoryMappingContext';

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/map/v2')({
  component: RouteComponent,
})

function RouteComponent() {
  const markerDescriptions = React.useContext(ItemDataContext);
  const categoryMapping = React.useContext(CategoryMappingContext);

  return (
    <Map data={markerDescriptions} categoryMapping={categoryMapping} />
  );
}

