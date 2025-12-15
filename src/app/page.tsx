'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    redirect('/sign-in');
  }

  return <Dashboard />;
}