'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoritesProvider } from "@/context/favorites-context";

function AppFooter() {
  return (
    <footer className="border-t bg-card p-3 text-center text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} ITEtude. Tous droits réservés.
    </footer>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // For admin routes, the protection and layout are handled by AdminLayout.
  // This avoids showing the main app shell to non-admins.
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    // The admin route has its own auth protection.
    // For all other routes, redirect to login if not authenticated.
    if (!isAdminRoute && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router, isAdminRoute]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="grid h-dvh w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-sidebar md:block">
            <div className="flex h-full max-h-screen flex-col gap-2 p-4">
                <Skeleton className="h-8 w-32" />
                <div className="flex-1 space-y-4 pt-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
                <div className="mt-auto p-4 border-t border-sidebar-border">
                  <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-96 w-full" />
          </main>
          <div className="border-t bg-card p-3">
             <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <FavoritesProvider>
      <div className="grid h-dvh w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <AppSidebar className="hidden md:block border-r" />
        <div className="flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0 bg-secondary/50">
             {children}
          </div>
          <AppFooter />
        </div>
      </div>
    </FavoritesProvider>
  );
}
