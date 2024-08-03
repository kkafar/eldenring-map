import React, { useContext } from 'react';
import categories from '../data/categories.json';
import data from '../data/items.json';
import MapCanvas from '../components/MapCanvas';
import useCounter from '../hooks/useCounter';
import { CategoryMapping, ItemCategory, MarkerDescription, MarkerDescriptionRaw } from '../types';
import { trpc } from '../api';
import { preprocessCategoryData, preprocessItemData } from '../core/tools';
import ItemDataContext from '../contexts/ItemDataContext';
import CategoryMappingContext from '../contexts/CategoryMappingContext';

function HomePage() {
  const preprocessedItemData = useContext<MarkerDescription[]>(ItemDataContext);
  const categoryMapping = useContext<CategoryMapping>(CategoryMappingContext);

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
      <p><a href='/login'>Take me to login page</a></p>
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

export default HomePage;

