import React from 'react';
import logo from './logo.svg';
import map from './assets/maps/m0-overworld.png';

import './App.css';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server';
import Map from './components/Map';

const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8088',
    }),
  ],
});

function App() {
  return (
    <div >
    <Map />
    </div>
  );
}

export default App;
