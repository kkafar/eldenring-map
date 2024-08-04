import React from 'react'
import { useParams } from 'react-router-dom'

export default function UserProfilePage() {
  const { userName } = useParams();

  return (
    <div>{userName} profiles page</div>
  )
}

