'use client';

import { AppHeader } from "@/components/app-header";
import { CertificationCard } from "@/components/certification-card";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Certification } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function CertificationsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
         <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-16 w-16 rounded-md" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full max-w-32 rounded-md" />
            </div>
        </div>
      ))}
    </div>
  );
}

export default function CertificationsPage() {
  const { data: certifications, loading } = useCollection<Certification>('certifications');

  return (
    <>
      <AppHeader title="Certifications IT" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto overscroll-y-contain">
        <div className="space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Explorez les certifications</h2>
            <p className="text-muted-foreground">Validez vos compétences avec des certifications reconnues par l'industrie.</p>
          </div>
          {loading ? (
            <CertificationsGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map(cert => (
                  <CertificationCard 
                    key={cert.id} 
                    certification={cert}
                  />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

    