'use client';

import { AppHeader } from "@/components/app-header";
import { LearningPathCard } from "@/components/learning-path-card";
import { categories } from "@/lib/data";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { LearningPath } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

function PathsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
         <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-5 w-16" />
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

export default function LearningPathsPage() {
  const { data: learningPaths, loading } = useCollection<LearningPath>('learningPaths');

  return (
    <>
      <AppHeader title="Parcours d'Apprentissage" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto">
        <div className="space-y-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Explorez nos parcours</h2>
            <p className="text-muted-foreground">Des chemins balisés pour vous guider dans votre apprentissage.</p>
          </div>
          {loading ? (
            <PathsGridSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map(path => {
                const category = categories.find(c => c.id === path.categoryId);
                
                return (
                  <LearningPathCard 
                    key={path.id} 
                    path={path}
                    categoryName={category?.name || 'Inconnue'}
                    resourceCount={path.steps.length}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
