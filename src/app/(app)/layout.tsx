'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoritesProvider } from "@/context/favorites-context";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

function AppFooter() {
  return (
    <footer className="border-t bg-card p-3 text-center text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} ITEtude. Tous droits réservés.
    </footer>
  );
}

function VersionBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary px-4 py-2 text-primary-foreground flex items-center justify-between text-xs md:text-sm font-medium animate-in fade-in slide-in-from-top duration-500">
      <div className="flex items-center gap-2 mx-auto">
        <Sparkles className="w-4 h-4 fill-primary-foreground/20" />
        <span>Bienvenue sur <strong>ITEtude V2.0</strong> ! Découvrez notre nouvelle recherche IA et l'espace communautaire.</span>
      </div>
      <button onClick={() => setIsVisible(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
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

  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
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
      <div className="flex flex-col h-dvh w-full overflow-hidden">
        <VersionBanner />
        <div className="flex-1 grid md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] overflow-hidden">
          <AppSidebar className="hidden md:block border-r" />
          <div className="flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0 bg-secondary/50">
               {children}
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    </FavoritesProvider>
  );
}
