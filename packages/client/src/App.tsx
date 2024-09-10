import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';

import appRouter from './routing';

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

