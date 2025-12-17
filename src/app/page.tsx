'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { RedirectToSignIn, SignedOut } from '@clerk/nextjs';
import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  // During loading, render nothing (or a spinner if you prefer)
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // If user is not signed in, redirect to sign-in
  if (!isSignedIn) {
    return (
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    );
  }

  // If user is signed in, render the dashboard
  return <Dashboard />;
}