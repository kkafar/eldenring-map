import React from 'react'
import MapCanvas from '../components/MapCanvas'
import ItemDataContext from '../contexts/ItemDataContext'
import CategoryMappingContext from '../contexts/CategoryMappingContext';

export default function MapDevPage() {
  const markerDescriptions = React.useContext(ItemDataContext);
  const categoryMapping = React.useContext(CategoryMappingContext);

  return (
    <MapCanvas data={markerDescriptions} categoryMapping={categoryMapping} />
  );
}

