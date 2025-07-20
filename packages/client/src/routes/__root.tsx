import * as React from 'react'
import { Outlet, createRootRoute, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { TRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { AppRouter } from '../../../server'
import { QueryClient } from '@tanstack/react-query'
import { TRPCClient } from '@trpc/client'

export interface AppContext {
  trpc: TRPCOptionsProxy<AppRouter>,
  trpcClient: TRPCClient<AppRouter>,
  queryClient: QueryClient,
}

export const Route = createRootRouteWithContext<AppContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
      <TanStackRouterDevtools />
    </React.Fragment>
  )
}

