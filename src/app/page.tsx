'use client';

export const dynamic = 'force-dynamic';

import { useUser } from '@clerk/nextjs';
import { Dashboard } from '@/components/dashboard';

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading application...</p>
          <p className="text-sm text-gray-500">If this takes too long, check your Clerk configuration</p>
        </div>
      </div>
    );
  }

  // If user is signed in, render the dashboard
  // If not signed in, the layout will handle the authentication UI
  return <Dashboard />;
}