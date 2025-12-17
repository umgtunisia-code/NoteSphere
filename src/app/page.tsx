'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { Dashboard } from '@/components/dashboard';
import { useEffect } from 'react';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  return <Dashboard />;
}