import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';

import appRouter from './routing';

import categories from './data/categories.json';
import data from './data/items.json';
import { CategoryMapping, ItemCategory, MarkerDescription, MarkerDescriptionRaw } from './types';
import { preprocessCategoryData, preprocessItemData } from './core/tools';
import ItemDataContext, { preprocessedItemData } from './contexts/ItemDataContext';
import CategoryMappingContext, { categoryMapping } from './contexts/CategoryMappingContext';

function App() {
  return (
    <CategoryMappingContext.Provider value={categoryMapping}>
      <ItemDataContext.Provider value={preprocessedItemData}>
        <RouterProvider router={appRouter} />
      </ItemDataContext.Provider>
    </CategoryMappingContext.Provider>
  );
}

export default App;

