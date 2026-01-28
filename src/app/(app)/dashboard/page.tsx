'use client'

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Milestone, Heart, BookOpen, Search, X } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/context/favorites-context";
import { useUser, useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useDoc } from "@/firebase/firestore/use-doc";
import { hideLearningPathForUser } from "@/firebase/auth/auth";
import type { Resource, LearningPath, UserProfile } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { ResourceCard } from "@/components/resource-card";
import { LearningPathCard } from "@/components/learning-path-card";
import { categories } from "@/lib/data";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { userProgress, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const { data: resources, loading: resourcesLoading } = useCollection<Resource>('resources');
  const { data: learningPaths, loading: pathsLoading } = useCollection<LearningPath>('learningPaths');
  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);

  const [searchQuery, setSearchQuery] = useState("");

  const loading = favoritesLoading || resourcesLoading || pathsLoading || userProfileLoading;

  const userFavoriteResources = useMemo(() => {
    if (loading) return [];
    return userProgress
      .filter(p => p.isFavorite)
      .map(p => resources.find(r => r.id === p.id))
      .filter((r): r is Resource => !!r);
  }, [userProgress, resources, loading]);

  const userLearningPaths = useMemo(() => {
    if (loading || !userProfile || !learningPaths || !userProgress) return [];

    // Create a Map of resourceId -> progress for quick lookup.
    const progressMap = new Map(userProgress.map(p => [p.id, p]));

    const userStartedPaths = learningPaths.filter(path => {
      // Hide if explicitly hidden by the user
      if (userProfile.hiddenPaths?.includes(path.id)) {
        return false;
      }

      // A path is considered "started" if a UserProgress document exists for ANY of its resources.
      // This means the user has interacted with it (favorited it, or marked it as completed/in-progress).
      const hasStarted = path.steps.some(step => {
        return progressMap.has(step.resourceId);
      });

      return hasStarted;
    });

    // Map the filtered paths to include progress information
    return userStartedPaths.map(path => {
      const totalSteps = path.steps.length;
      const completedSteps = path.steps.filter(step => {
        const progress = progressMap.get(step.resourceId);
        return progress?.status === 'terminé';
      }).length;
      
      const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
      
      return { ...path, progress, currentStep: completedSteps, totalSteps };
    });
  }, [learningPaths, userProgress, userProfile, loading]);

  const searchResults = useMemo(() => {
    if (!searchQuery) return null;

    const lowercasedQuery = searchQuery.toLowerCase();

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(lowercasedQuery) ||
        resource.description?.toLowerCase().includes(lowercasedQuery)
    );

    const filteredPaths = learningPaths.filter(path =>
        path.title.toLowerCase().includes(lowercasedQuery) ||
        path.description?.toLowerCase().includes(lowercasedQuery)
    );

    return { resources: filteredResources, paths: filteredPaths };
  }, [searchQuery, resources, learningPaths]);


  if (loading) {
    return (
        <>
            <AppHeader title="Mon tableau de bord" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/50">
                 <div className="space-y-6">
                    <div className="mb-2">
                        <Skeleton className="h-9 w-64 mb-2" />
                        <Skeleton className="h-5 w-80" />
                    </div>
                    <div className="relative mb-8">
                        <Skeleton className="h-10 w-full max-w-xl mx-auto rounded-full" />
                    </div>
                    <section>
                        <Skeleton className="h-8 w-56 mb-4" />
                        <div className="grid gap-6 md:grid-cols-2">
                           <Skeleton className="h-40 w-full" />
                           <Skeleton className="h-40 w-full" />
                        </div>
                    </section>
                    <section>
                        <Skeleton className="h-8 w-48 mb-4" />
                        <div className="grid gap-4">
                           <Skeleton className="h-20 w-full" />
                           <Skeleton className="h-20 w-full" />
                        </div>
                    </section>
                 </div>
            </main>
        </>
    )
  }

  return (
    <>
      <AppHeader title="Mon tableau de bord" />
      <main className="flex-1 min-h-0 bg-secondary/50 overflow-y-auto overscroll-y-contain">
        <div className="sticky top-0 z-10 border-b bg-background pt-4 md:pt-6 lg:pt-8">
            <div className="px-4 md:px-6 lg:px-8">
                <div className="mb-2">
                    <h2 className="text-3xl font-bold tracking-tight">Bonjour, {user?.displayName || 'Apprenant'} !</h2>
                    <p className="text-muted-foreground">Ravi de vous revoir. Continuons à apprendre.</p>
                </div>
                
                <div className="relative max-w-xl mx-auto my-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher une ressource ou un parcours..."
                        className="pl-12 w-full rounded-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
      
        <div className="space-y-6 px-4 md:px-6 lg:px-8 pb-4 md:pb-6 lg:pb-8">
          {searchResults ? (
             <div className="space-y-8">
                <h3 className="text-2xl font-semibold tracking-tight">
                    Résultats pour "{searchQuery}"
                </h3>

                {searchResults.paths.length > 0 && (
                    <section>
                        <h4 className="text-xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                            <Milestone className="w-5 h-5" />
                            Parcours
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.paths.map(path => {
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
                    </section>
                )}

                {searchResults.resources.length > 0 && (
                     <section>
                        <h4 className="text-xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5" />
                            Ressources
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {searchResults.resources.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    </section>
                )}

                {searchResults.paths.length === 0 && searchResults.resources.length === 0 && (
                    <div className="text-center py-16 text-muted-foreground">
                        <p className="text-lg font-semibold">Aucun résultat trouvé</p>
                        <p>Essayez avec d'autres mots-clés.</p>
                    </div>
                )}
             </div>
          ) : (
            <>
                <section>
                    <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                    <Milestone className="w-6 h-6" />
                    Mes Parcours
                    </h3>
                    {userLearningPaths.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                        {userLearningPaths.map(path => {
                            const handleRemovePath = () => {
                                if (!firestore || !user) return;
                                hideLearningPathForUser(firestore, user.uid, path.id);
                            };
                            return (
                            <Card key={path.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle>{path.title}</CardTitle>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-foreground" onClick={handleRemovePath}>
                                                    <X className="h-4 w-4" />
                                                    <span className="sr-only">Masquer le parcours</span>
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Masquer de "Mes parcours"</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <CardDescription>Étape {path.currentStep} sur {path.totalSteps}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Progress value={path.progress} className="w-full mb-4" />
                                <Button asChild variant="outline">
                                <Link href={`/parcours/${path.id}`}>Continuer le parcours</Link>
                                </Button>
                            </CardContent>
                            </Card>
                        )})}
                        </div>
                    ) : (
                        <Card>
                        <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <Milestone className="w-10 h-10" />
                            <p>Vous n'avez commencé aucun parcours pour le moment.</p>
                            <Button asChild>
                                <Link href="/parcours">Explorer les parcours</Link>
                            </Button>
                        </CardContent>
                        </Card>
                    )}
                </section>

                <section>
                    <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                    <Heart className="w-6 h-6" />
                    Mes Favoris
                    </h3>
                    <div className="grid gap-4">
                    {userFavoriteResources.length > 0 ? (
                        userFavoriteResources.map(resource => (
                          <Card key={resource.id} className="hover:bg-muted/50 transition-colors">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                  <p className="font-semibold">{resource.title}</p>
                                  <p className="text-sm text-muted-foreground">{new URL(resource.url).hostname}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(resource.id)}>
                                      <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                                      <span className="sr-only">Retirer des favoris</span>
                                  </Button>
                                  <Button asChild size="sm">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">Accéder</a>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                        ))
                      ) : (
                        <Card>
                          <CardContent className="p-6 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <BookOpen className="w-10 h-10" />
                            <p>Vous n'avez pas encore de favoris.</p>
                            <p>Cliquez sur l'icône ❤️ sur une ressource pour l'ajouter ici.</p>
                            <Button asChild variant="outline">
                                <Link href="/parcours">Découvrir des ressources</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                </section>
            </>
          )}
        </div>
      </main>
    </>
  );
}

    