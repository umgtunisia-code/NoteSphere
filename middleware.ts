import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/', // Main dashboard
  '/dashboard(.*)', // Other dashboard routes if they exist
  '/projects(.*)',
  '/notes(.*)',
  '/tasks(.*)',
  '/calendar(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (isProtectedRoute(request)) {
    return auth().protect();
  }
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};