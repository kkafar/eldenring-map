import { createFileRoute } from "@tanstack/react-router";
import GoBackHomeLink from "../components/GoBackHomeLink";
import { PageTitleText } from "../components/PageTitleText";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-surface p-6">
      <PageTitleText title="Login page" />
      <GoBackHomeLink />
    </div>
  );
}
