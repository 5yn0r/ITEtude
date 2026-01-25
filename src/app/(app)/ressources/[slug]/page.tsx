
'use client';

import { AppHeader } from "@/components/app-header";
import { FilterControls } from "@/components/filter-controls";
import { ResourceCard } from "@/components/resource-card";
import { categories } from "@/lib/data";
import { notFound } from "next/navigation";
import { useState, useMemo, use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Resource } from "@/lib/types";

function ResourceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ResourcePage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const [filters, setFilters] = useState({ difficulty: 'all', dataWeight: 'all', language: 'all' });
  const { data: allResources, loading } = useCollection<Resource>('resources');

  const category = categories.find(c => c.slug === slug);

  if (!category) {
    notFound();
  }

  const filteredResources = useMemo(() => {
    if (loading) return [];
    return allResources
      .filter(r => r.categoryId === category.id)
      .filter(r => filters.difficulty === 'all' || r.difficulty === filters.difficulty)
      .filter(r => filters.dataWeight === 'all' || r.dataWeight === filters.dataWeight)
      .filter(r => filters.language === 'all' || r.language === filters.language);
  }, [category.id, filters, allResources, loading]);

  return (
    <>
      <AppHeader title={category.name} />
      <main className="flex-1 min-h-0 bg-secondary/50 overflow-y-auto">
        <div className="sticky top-0 z-20 border-b bg-background p-2">
          <FilterControls onFilterChange={setFilters} />
        </div>
        
        <div className="p-4 md:p-6 lg:p-8">
          {loading ? (
             <ResourceGridSkeleton />
          ) : (
            <>
              {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredResources.map(resource => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg font-semibold">Aucune ressource trouvée</p>
                    <p>Essayez d'ajuster vos filtres.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
