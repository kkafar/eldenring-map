import React, { useContext } from 'react';
import MapCanvas from '../components/MapCanvas';
import useCounter from '../hooks/useCounter';
import { CategoryMapping, ItemCategory, MarkerDescription, MarkerDescriptionRaw } from '../types';
import { trpc } from '../api';
import ItemDataContext from '../contexts/ItemDataContext';
import CategoryMappingContext from '../contexts/CategoryMappingContext';
import type { User } from '../../../server/types';
import UserListItem from '../components/UserListItem';

function HomePage() {
  const preprocessedItemData = useContext<MarkerDescription[]>(ItemDataContext);
  const categoryMapping = useContext<CategoryMapping>(CategoryMappingContext);

  const [isBackendLive, setIsBackendLive] = React.useState(false);
  const [apiConnectionAttempts, incrementApiConnectionAttempts] = useCounter(0);

  const [userList, setUserList] = React.useState<User[] | null>(null);

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
    let listUsers: { data: User[] } = await trpc.listUsers.query(undefined, { signal: ac.signal });
    console.log(`listUsers result: ${JSON.stringify(listUsers)}`);
    setUserList(listUsers.data);
    setIsBackendLive(true);
  }, []);

  React.useEffect(() => {
    const ac = new AbortController();

    // if (!isBackendLive) {
    //   checkIsApiLive(ac);
    // } else {
    //   apiCallback(ac);
    // }
    apiCallback(ac);

    return () => {
      ac.abort();
    }
  }, [checkIsApiLive, apiCallback]);

  return (
    <div>
      <h1>Elden ring map</h1>
      <p><a href='/login'>Take me to login page</a></p>
      <p><a href='/admin'>Take me to admin page</a></p>
      <p><a href='/dev-map'>Take me to map page</a></p>
      {isBackendLive && (
        <p>Backend is live and well</p>
      )}
      {userList !== null && (
        <ul>
          {userList.map((user, index) => <UserListItem key={index.toString()} name={user.name} />)}
        </ul>
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

