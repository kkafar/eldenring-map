import React from 'react';
import './App.css';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';

import categories from './data/categories.json';
import data from './data/items.json';
import MapCanvas from './components/MapCanvas';
import { CategoryMapping, ItemCategory, MarkerDescription, MarkerDescriptionRaw } from './types';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8088',
    }),
  ],
});

function preprocessItemData(data: MarkerDescriptionRaw[]): MarkerDescription[] {
  // TODO: We need to preprocess image data here also

  return data.map(marker => {
    return {
      ...marker,
      // For some reason coordinates are swapped in input data
      x: Math.abs(Number(marker.y)),
      y: Math.abs(Number(marker.x)),
    }
  });
}

function preprocessCategoryData(data: ItemCategory[]): CategoryMapping {
  let result = {};

  data.forEach(category => {
    Object.defineProperty(result, category.id, {
      enumerable: true,
      value: category,
      writable: false,
    });
  });

  return result as CategoryMapping;
}

const preprocessedItemData = preprocessItemData(data);
const categoryMapping = preprocessCategoryData(categories);

function App() {
  return (
    <div>
      <MapCanvas data={preprocessedItemData} categoryMapping={categoryMapping} />
    </div>
  );
}

export default App;
