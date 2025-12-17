'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { RedirectToSignIn, SignedOut, useAuth } from '@clerk/nextjs';
import { Dashboard } from '@/components/dashboard';
import { useEffect } from 'react';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const { userId } = useAuth(); // Using useAuth hook for better debugging

  // Log for debugging purposes
  useEffect(() => {
    if (isLoaded) {
      console.log("Auth loaded:", { isSignedIn, userId });
    }
  }, [isLoaded, isSignedIn, userId]);

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );
  }

  return <Dashboard />;
}