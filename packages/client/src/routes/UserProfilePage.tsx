import React from 'react'
import { useParams } from 'react-router-dom'

export default function UserProfilePage() {
  const { userName } = useParams();

  return (
    <div>
      <p>
        {userName} profiles page
      </p>
      <p>
        <a href='/'>Go back to <strong>HomePage</strong></a>
      </p>
    </div>
  )
}

