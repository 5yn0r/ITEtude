'use client';

import { useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';

type AdminStatus = {
  isAdmin: boolean;
  loading: boolean;
};

export function useAdmin(): AdminStatus {
  const { user, loading: userLoading } = useUser();
  
  // Pass user.uid to useDoc, it will be null if user is null, and useDoc handles it.
  const { data: adminDoc, loading: adminDocLoading } = useDoc<{}>(
    user ? `admins/${user.uid}` : null
  );

  // We are loading if the user's auth state is still loading,
  // or if we have a user but we're still waiting for their admin status from Firestore.
  const loading = userLoading || (!!user && adminDocLoading);

  // If loading is finished, and we have a user and their corresponding admin document, they are an admin.
  // Note: !!adminDoc is true even for an empty document, which is what we want.
  const isAdmin = !loading && !!user && !!adminDoc;

  return { isAdmin, loading };
}
