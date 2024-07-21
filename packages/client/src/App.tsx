import React from 'react';
import './App.css';

import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../server';

import categories from './data/categories.json';
import data from './data/items.json';
import MapCanvas from './components/MapCanvas';
import useCounter from './hooks/useCounter';
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
  const [isBackendLive, setIsBackendLive] = React.useState(false);
  const [apiConnectionAttempts, incrementApiConnectionAttempts] = useCounter(0);

  const checkIsApiLive = React.useCallback(async (ac: AbortController) => {
    console.log('Pinging API for avaibility');
    trpc.ping.query(undefined, { signal: ac.signal })
    // trpc.ping.query()
      .then(_ => {
        console.log(`Received initial response from server after attempt ${apiConnectionAttempts + 1}`);
        incrementApiConnectionAttempts();
        setIsBackendLive(true);
      }, reason => {
        console.error(`Ping to server resulted in rejected promise: ${reason}`);
        incrementApiConnectionAttempts();
        setIsBackendLive(false);
      })
      .catch(error => {
        console.error(`Ping to server resulted in error: ${error}`);
        incrementApiConnectionAttempts();
        setIsBackendLive(false);
      });
  }, [setIsBackendLive, incrementApiConnectionAttempts]);

  const apiCallback = React.useCallback(async (ac: AbortController) => {
    console.log("Executing API callback in App");
    // let userResult = await trpc.createUser.mutate({ userName: 'testUser' }, { signal: ac.signal });
    // console.log(`createUser result: ${JSON.stringify(userResult)}`);
    //
    // let listUsers = await trpc.listUsers.query(undefined, { signal: ac.signal });
    // console.log(`listUsers result: ${JSON.stringify(listUsers)}`);
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();

    if (!isBackendLive) {
      checkIsApiLive(ac);
    } else {
      apiCallback(ac);
    }

    return () => {
      ac.abort();
    }
  }, [checkIsApiLive, apiCallback]);

  return (
    <div>
      <h1>Elden ring map</h1>
      {isBackendLive && (
        <p>Lorem ipsum</p>
      )}
    </div>
  );

  // return (
  //   {(isBackendLive && (
  //     <div>
  //       <MapCanvas data={preprocessedItemData} categoryMapping={categoryMapping} />
  //     </div>
  //   ))}
  // );
}

export default App;

