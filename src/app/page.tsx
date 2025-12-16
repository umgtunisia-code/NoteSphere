'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { RedirectToSignIn, SignedOut } from '@clerk/nextjs';
import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

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