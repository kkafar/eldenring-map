import React from 'react';
import map from './assets/maps/m0-overworld.png';
import './App.css';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';
import Map from './components/Map';

import categories from './data/categories.json';
import data from './data/items.json';
import MapCanvas from './components/MapCanvas';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8088',
    }),
  ],
});


function App() {
  return (
    <div>
      <MapCanvas data={data} />
    </div>
  );
}

export default App;
