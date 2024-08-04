import React from 'react'
import { trpc } from '../api';

export default function AdminPanelPage() {
  const onResetDbClick = React.useCallback(() => {
    console.log("Reseting databse");
    trpc.private_resetDatabase.query()
  }, []);

  return (
    <div>
      <h1>Admin panel</h1>
      <p><a href='/'>Go to <strong>HomePage</strong></a></p>
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

