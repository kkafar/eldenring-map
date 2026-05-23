import React, { useContext } from "react";
import MapCanvas from "../components/MapCanvas";
import useCounter from "../hooks/useCounter";
import {
  CategoryMapping,
  ItemCategory,
  MarkerDescription,
  MarkerDescriptionRaw,
} from "../types";
import { trpc } from "../api";
import ItemDataContext from "../contexts/ItemDataContext";
import CategoryMappingContext from "../contexts/CategoryMappingContext";
import type { User } from "../../../server/types";
import UserListItem from "../components/UserListItem";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const preprocessedItemData = useContext<MarkerDescription[]>(ItemDataContext);
  const categoryMapping = useContext<CategoryMapping>(CategoryMappingContext);

  const [isBackendLive, setIsBackendLive] = React.useState(false);
  const [apiConnectionAttempts, incrementApiConnectionAttempts] = useCounter(0);

  const [userList, setUserList] = React.useState<User[] | null>(null);

  const checkIsApiLive = React.useCallback(
    async (ac: AbortController) => {
      console.log("Pinging API for avaibility");
      trpc.ping
        .query(undefined, { signal: ac.signal })
        // trpc.ping.query()
        .then(
          (_) => {
            console.log(
              `Received initial response from server after attempt ${apiConnectionAttempts + 1}`,
            );
            incrementApiConnectionAttempts();
            setIsBackendLive(true);
          },
          (reason) => {
            console.error(
              `Ping to server resulted in rejected promise: ${reason}`,
            );
            incrementApiConnectionAttempts();
            setIsBackendLive(false);
          },
        )
        .catch((error) => {
          console.error(`Ping to server resulted in error: ${error}`);
          incrementApiConnectionAttempts();
          setIsBackendLive(false);
        });
    },
    [setIsBackendLive, incrementApiConnectionAttempts],
  );

  const apiCallback = React.useCallback(async (ac: AbortController) => {
    console.log("Executing API callback in App");
    let listUsers: { data: User[] } = await trpc.listUsers.query(undefined, {
      signal: ac.signal,
    });
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
    };
  }, [checkIsApiLive, apiCallback]);

  return (
    <div className="p-6">
      <EldenRingMapTitle />
      <div className="pt-4 space-y-2">
        <PageLink pagePath="/login" pageName="Take me to login page" />
        <PageLink pagePath="/admin" pageName="Take me to admin page" />
        <PageLink pagePath="/map/v1" pageName="Take me to map page (v1)" />
        <PageLink pagePath="/map/v2" pageName="Take me to map page (v2)" />
      </div>
      {isBackendLive && <p>Backend is live and well</p>}
      {userList !== null && (
        <ul>
          {userList.map((user, index) => (
            <UserListItem key={index.toString()} name={user.name} />
          ))}
        </ul>
      )}
    </div>
  );
}

function EldenRingMapTitle() {
  return <h1 className="font-bold text-6xl text-on-surface">Elden ring map</h1>;
}

function PageLink(props: { pagePath: string; pageName: string }) {
  return (
    <p className="hover:text-on-surface-variant hover:underline">
      <a href={props.pagePath}>{props.pageName}</a>
    </p>
  );
}
