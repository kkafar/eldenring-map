import React from 'react'
import type { User } from '../../../server/types'

export type UserListElementProps = User & {
  key?: string
};

export default function UserListItem(props: UserListElementProps) {
  const {
    name
  } = props;

  const userPageRoute = `/user/${name}`;

  return (
    <li>
      <a href={userPageRoute}>
        {name}
      </a>
    </li>
  )
}

