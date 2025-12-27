import { isAdmin, getLinks } from '../actions';
import { redirect } from 'next/navigation';
import AdminPanel from './admin-panel';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/');
    }

    const links = await getLinks();

    return <AdminPanel initialLinks={links} />;
}
