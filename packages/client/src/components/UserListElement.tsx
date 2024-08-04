import React from 'react'
import { User } from '../../../server/types'

export type UserListElementProps = User & {
  key?: string
};

export default function UserListElement(props: UserListElementProps) {
  const {
    key,
    name
  } = props;

  const userPageRoute = `/user/${name}`;

  return (
    <li key={key}>
      <a href={userPageRoute}>
        {name}
      </a>
    </li>
  )
}

