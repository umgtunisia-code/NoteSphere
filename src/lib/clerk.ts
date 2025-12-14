// Clerk configuration utilities
// This file contains helper functions for working with Clerk authentication

import { currentUser, auth } from '@clerk/nextjs/server';

export const getCurrentUser = async () => {
  const user = await currentUser();
  return user;
};

export const getCurrentAuth = () => {
  return auth();
};