import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router'
import { trpc } from '../api';
import GoBackHomeLink from '../components/GoBackHomeLink';

export const Route = createFileRoute('/user/$userName')({
  component: RouteComponent,
  loader: async ({ context: { trpc, queryClient }, params: { userName } }) => {
    await queryClient.ensureQueryData(trpc.listUserProfiles.queryOptions({ name: userName }));
  },
})

function RouteComponent() {
  const userName = Route.useParams({ select: (d) => d.userName });

  const userProfilesQuery = useQuery(trpc.listUserProfiles.queryOptions({ name: userName }));

  const profileList = userProfilesQuery.data;

  return (
    <div>
      <p>
        {userName} profiles page
      </p>
      <ul>
        {profileList && profileList.data.map((profile, i) => <li key={i.toString()}>{profile.name}</li>)}
      </ul>
      <GoBackHomeLink />
    </div>
  )
}
