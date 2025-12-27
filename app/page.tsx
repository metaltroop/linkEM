import { getLinks } from './actions';
import HomeClient from './home-client';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const links = await getLinks();

  return <HomeClient initialLinks={links} />;
}
