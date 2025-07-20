import React from 'react'
import { trpcClient } from '../api';
import GoBackHomeLink from '../components/GoBackHomeLink';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  const onResetDbClick = React.useCallback(() => {
    console.log("Reseting databse");
    trpcClient.private_resetDatabase.query();
  }, []);

  return (
    <div>
      <h1>Admin panel</h1>
      <GoBackHomeLink />
      <h3>Database actions</h3>
      <div>
        <ul>
          <li>
            <button onClick={onResetDbClick}>
              Reset database
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
