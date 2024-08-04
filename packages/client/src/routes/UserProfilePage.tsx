import React from 'react'
import { Await, useLoaderData, useParams, defer, LoaderFunctionArgs } from 'react-router-dom'
import GoBackHomeLink from '../components/GoBackHomeLink';
import { trpc } from '../api';
import type { Profile, ResponsePayload } from '../../../server/types';

export async function loadDataUserProfilePage({ params }: LoaderFunctionArgs) {
  const { userName } = params;
  const resultPromise = trpc.listUserProfiles.query({ name: userName! });
  return defer({ profileList: resultPromise });

  // const result = await resultPromise;
  // return result.data;
}

export default function UserProfilePage() {
  const { userName } = useParams();
  const defferedData = useLoaderData();

  return (
    <div>
      <p>
        {userName} profiles page
      </p>
      <React.Suspense fallback={<p>Loading data...</p>}>
        <Await
          // @ts-ignore React Router TS support sucks
          resolve={defferedData.profileList}
          errorElement={
            <div>Failed to load data...</div>
          }
          children={(profileList: ResponsePayload<Profile[]>) => {
            return (
              <ul>
                {profileList.data.map((profile, i) => <li key={i.toString()}>{profile.name}</li>)}
              </ul>
            )
          }}
        />
      </React.Suspense>
      <GoBackHomeLink />
    </div>
  )
}

