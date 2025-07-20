import { createFileRoute } from '@tanstack/react-router'
import GoBackHomeLink from "../components/GoBackHomeLink";

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Login page</h1>
      <GoBackHomeLink />
    </div>
  );
}
