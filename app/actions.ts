'use server';

import { db, initDb } from '@/lib/db';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';

export async function uploadIcon(file: File) {
    await initDb();

    // Get total count of links to determine the next image sequence number
    const result = await db.execute('SELECT COUNT(*) as total FROM links');
    const count = Number(result.rows[0]?.total || 0);
    const nextNumber = count + 1;

    // Extract extension or default to png
    const extension = file.name.split('.').pop() || 'png';
    const filename = `metaltroop-image-${nextNumber}.${extension}`;

    const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true, // Keep suffix as well to avoid browser cache issues but use the prefix we want
    });
    return blob.url;
}

export async function getLinks() {
    try {
        await initDb();
        const result = await db.execute('SELECT * FROM links ORDER BY order_index ASC');
        return result.rows.map(row => ({
            id: row.id as number,
            title: row.title as string,
            url: row.url as string,
            icon_url: row.icon_url as string | null,
            order_index: row.order_index as number,
        }));
    } catch (error) {
        console.error('Failed to fetch links:', error);
        return []; // Return empty list rather than crashing
    }
}

export async function addLink(formData: FormData) {
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const icon_url = formData.get('icon_url') as string;

    if (!title || !url) return { error: 'Title and URL are required' };

    await initDb();

    // Get the current max order_index
    const maxOrderResult = await db.execute('SELECT MAX(order_index) as max_order FROM links');
    const maxOrder = (maxOrderResult.rows[0]?.max_order as number) || 0;

    await db.execute({
        sql: 'INSERT INTO links (title, url, icon_url, order_index) VALUES (?, ?, ?, ?)',
        args: [title, url, icon_url || null, maxOrder + 1],
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
}

export async function updateLink(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const url = formData.get('url') as string;
    const icon_url = formData.get('icon_url') as string;

    if (!title || !url) return { error: 'Title and URL are required' };

    await initDb();

    await db.execute({
        sql: 'UPDATE links SET title = ?, url = ?, icon_url = ? WHERE id = ?',
        args: [title, url, icon_url || null, id],
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
}

export async function updateLinkOrder(links: { id: number; order_index: number }[]) {
    await initDb();

    const tx = await db.transaction("write");
    try {
        for (const link of links) {
            await tx.execute({
                sql: 'UPDATE links SET order_index = ? WHERE id = ?',
                args: [link.order_index, link.id],
            });
        }
        await tx.commit();
        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        await tx.rollback();
        console.error('Transaction failed:', error);
        return { success: false, error: 'Failed to update order' };
    }
}

export async function deleteLink(id: number) {
    await initDb();
    await db.execute({
        sql: 'DELETE FROM links WHERE id = ?',
        args: [id],
    });

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
}

export async function verifyPin(pin: string) {
    const correctPin = process.env.ADMIN_PIN || '235689';

    if (pin === correctPin) {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24, // 24 hours
        });
        return { success: true };
    }

    return { success: false, error: 'Invalid PIN' };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete('admin_session');
    revalidatePath('/admin');
}

export async function isAdmin() {
    const cookieStore = await cookies();
    return cookieStore.get('admin_session')?.value === 'authenticated';
}
