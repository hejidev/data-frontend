'use server';

import { revalidatePath } from 'next/cache';

/** Called after branding is saved so metadata/SEO titles update immediately. */
export async function revalidateSite() {
  revalidatePath('/', 'layout');
}