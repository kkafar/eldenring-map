import React from 'react'
import Map from '../components/Map'
import ItemDataContext from '../contexts/ItemDataContext'
import CategoryMappingContext from '../contexts/CategoryMappingContext';

export default function MapDevPage() {
  const markerDescriptions = React.useContext(ItemDataContext);
  const categoryMapping = React.useContext(CategoryMappingContext);

  return (
    <Map data={markerDescriptions} categoryMapping={categoryMapping} />
  );
}

