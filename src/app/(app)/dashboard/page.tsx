'use client'

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Milestone, Heart, BookOpen, Search, X, Trophy, Zap, Star } from 'lucide-react';
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

  // Statistique Calculations
  const stats = useMemo(() => {
    if (loading || !userProgress || !learningPaths) {
      return { completedPaths: 0, totalFavorites: 0, exploredResources: 0 };
    }

    const completedResourceIds = new Set(
      userProgress.filter(p => p.status === 'terminé').map(p => p.id)
    );

    const completedPaths = learningPaths.filter(path => 
      path.steps.length > 0 && path.steps.every(step => completedResourceIds.has(step.resourceId))
    ).length;

    const totalFavorites = userProgress.filter(p => p.isFavorite).length;

    const exploredResources = userProgress.filter(p => p.status !== 'non commencé').length;

    return { completedPaths, totalFavorites, exploredResources };
  }, [userProgress, learningPaths, loading]);

  const userFavoriteResources = useMemo(() => {
    if (loading) return [];
    return userProgress
      .filter(p => p.isFavorite)
      .map(p => resources.find(r => r.id === p.id))
      .filter((r): r is Resource => !!r);
  }, [userProgress, resources, loading]);

  const userLearningPaths = useMemo(() => {
    if (loading || !userProfile || !learningPaths || !userProgress) return [];

    const progressMap = new Map(userProgress.map(p => [p.id, p]));

    const userStartedPaths = learningPaths.filter(path => {
      if (userProfile.hiddenPaths?.includes(path.id)) {
        return false;
      }
      return path.steps.some(step => progressMap.has(step.resourceId));
    });

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <section>
                        <Skeleton className="h-8 w-56 mb-4" />
                        <div className="grid gap-6 md:grid-cols-2">
                           <Skeleton className="h-40 w-full" />
                           <Skeleton className="h-40 w-full" />
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Bonjour, {user?.displayName || 'Apprenant'} !</h2>
                        <p className="text-muted-foreground">Ravi de vous revoir. Voici un aperçu de vos progrès.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20 self-start md:self-auto">
                        <Zap className="w-5 h-5 fill-primary" />
                        <span className="font-bold">Version 2.0</span>
                    </div>
                </div>
                
                <div className="relative max-w-xl mx-auto my-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Rechercher une ressource ou un parcours..."
                        className="pl-12 w-full rounded-full bg-secondary/30"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>
        </div>
      
        <div className="space-y-8 px-4 md:px-6 lg:px-8 pb-8 mt-6">
          {/* Stats Cards Section */}
          {!searchResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-success">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-success/10 rounded-full">
                    <Trophy className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parcours terminés</p>
                    <p className="text-2xl font-bold">{stats.completedPaths}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-red-500">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-red-500/10 rounded-full">
                    <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Favoris enregistrés</p>
                    <p className="text-2xl font-bold">{stats.totalFavorites}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ressources explorées</p>
                    <p className="text-2xl font-bold">{stats.exploredResources}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {searchResults ? (
             <div className="space-y-8">
                <h3 className="text-2xl font-semibold tracking-tight">
                    Résultats pour "{searchQuery}"
                </h3>
                {/* ... (rest of search results logic remains the same) */}
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
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Milestone className="w-6 h-6 text-primary" />
                            Mes Parcours
                        </h3>
                        <Button asChild variant="link" className="text-primary p-0">
                            <Link href="/parcours">Tout voir</Link>
                        </Button>
                    </div>
                    {userLearningPaths.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                        {userLearningPaths.map(path => {
                            const handleRemovePath = () => {
                                if (!firestore || !user) return;
                                hideLearningPathForUser(firestore, user.uid, path.id);
                            };
                            return (
                            <Card key={path.id} className="overflow-hidden group">
                            <CardHeader className="relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="group-hover:text-primary transition-colors">{path.title}</CardTitle>
                                        <CardDescription>Étape {path.currentStep} sur {path.totalSteps}</CardDescription>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={handleRemovePath}>
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
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span>Progression</span>
                                            <span>{Math.round(path.progress)}%</span>
                                        </div>
                                        <Progress value={path.progress} className="h-2" />
                                    </div>
                                    <Button asChild variant="default" className="w-full">
                                        <Link href={`/parcours/${path.id}`}>
                                            {path.progress === 100 ? "Revoir le parcours" : "Continuer l'apprentissage"}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                            </Card>
                        )})}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                        <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <div className="p-4 bg-secondary rounded-full">
                                <Milestone className="w-10 h-10 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-foreground">Aucun parcours en cours</p>
                                <p>Commencez votre voyage en explorant nos parcours thématiques.</p>
                            </div>
                            <Button asChild className="mt-2">
                                <Link href="/parcours">Explorer les parcours</Link>
                            </Button>
                        </CardContent>
                        </Card>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Heart className="w-6 h-6 text-red-500" />
                            Mes Favoris
                        </h3>
                    </div>
                    <div className="grid gap-3">
                    {userFavoriteResources.length > 0 ? (
                        userFavoriteResources.map(resource => (
                          <Card key={resource.id} className="hover:border-primary/50 transition-all group shadow-sm">
                              <CardContent className="p-4 flex justify-between items-center">
                                <div className="flex flex-col">
                                  <p className="font-semibold group-hover:text-primary transition-colors">{resource.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="bg-secondary px-1.5 py-0.5 rounded">{new URL(resource.url).hostname}</span>
                                      <span>•</span>
                                      <span>{resource.difficulty}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => toggleFavorite(resource.id)}>
                                      <Heart className="w-5 h-5 fill-red-500" />
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
                        <Card className="border-dashed">
                          <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <div className="p-4 bg-secondary rounded-full">
                                <Star className="w-10 h-10 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-foreground">Votre liste est vide</p>
                                <p>Marquez les ressources qui vous plaisent pour les retrouver ici.</p>
                            </div>
                            <Button asChild variant="outline" className="mt-2">
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
