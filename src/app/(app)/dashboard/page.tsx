
'use client'

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Milestone, Heart, BookOpen, Search, X, Trophy, Zap, Star, Sparkles, Loader2, BrainCircuit, User } from 'lucide-react';
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
import { aiSearch, type AISearchOutput } from "@/ai/flows/ai-search-flow";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { userProgress, toggleFavorite, loading: favoritesLoading } = useFavorites();
  const { data: resources, loading: resourcesLoading } = useCollection<Resource>('resources');
  const { data: learningPaths, loading: pathsLoading } = useCollection<LearningPath>('learningPaths');
  const { data: userProfile, loading: userProfileLoading } = useDoc<UserProfile>(user ? `users/${user.uid}` : null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAISearching, setIsAISearching] = useState(false);
  const [aiResults, setAiResults] = useState<AISearchOutput | null>(null);

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

  const handleAISearch = async () => {
    if (!searchQuery.trim() || isAISearching) return;
    
    setIsAISearching(true);
    setAiResults(null);
    try {
      const results = await aiSearch({
        query: searchQuery,
        availableData: {
          resources: resources.map(r => ({ id: r.id, title: r.title, description: r.description, difficulty: r.difficulty })),
          paths: learningPaths.map(p => ({ id: p.id, title: p.title, description: p.description, difficulty: p.difficulty })),
        }
      });
      setAiResults(results);
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsAISearching(false);
    }
  };

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
        {/* Sticky Header with high Z-Index and opaque background */}
        <div className="sticky top-0 z-40 border-b bg-background pt-2 md:pt-6 shadow-sm">
            <div className="px-4 md:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-2 mb-1 md:mb-2">
                    <div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tight">Bonjour, {user?.displayName || 'Apprenant'} !</h2>
                        <p className="hidden md:block text-sm md:text-base text-muted-foreground">Ravi de vous revoir. Voici un aperçu de vos progrès.</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2 py-1 md:px-4 md:py-2 rounded-full border border-primary/20 shrink-0">
                        <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 fill-primary" />
                        <span className="font-bold text-[10px] md:text-sm">V2.0</span>
                    </div>
                </div>
                
                <div className="relative max-w-2xl mx-auto my-3 md:my-6 flex flex-row gap-2 pb-2 md:pb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher..."
                            className="pl-9 md:pl-12 w-full rounded-full bg-secondary/30 h-10 md:h-12 text-sm md:text-lg shadow-inner focus:bg-background transition-all"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                if (aiResults) setAiResults(null);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
                        />
                    </div>
                    <Button 
                        onClick={handleAISearch} 
                        disabled={!searchQuery.trim() || isAISearching}
                        className="rounded-full h-10 md:h-12 gap-1.5 px-4 md:px-8 shadow-lg hover:shadow-primary/30 transition-all font-bold shrink-0 text-xs md:text-sm"
                    >
                        {isAISearching ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
                        <span className="hidden sm:inline">Conseil IA</span>
                        <span className="sm:hidden">IA</span>
                    </Button>
                </div>
            </div>
        </div>
      
        <div className="space-y-8 px-4 md:px-6 lg:px-8 pb-8 mt-6">
          
          {/* AI Search Results Section */}
          {aiResults && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
               <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <BrainCircuit className="w-6 h-6" />
                    Recommandations de l'IA
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setAiResults(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4 mr-2" /> Effacer
                  </Button>
               </div>

               <Alert className="bg-primary/5 border-primary/20 shadow-md border-l-4 border-l-primary overflow-hidden">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <AlertTitle className="font-bold text-primary flex items-center gap-2">
                    Analyse pédagogique
                  </AlertTitle>
                  <AlertDescription className="text-primary/90 font-medium leading-relaxed mt-2 text-sm md:text-base italic">
                    "{aiResults.summary}"
                  </AlertDescription>
               </Alert>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 mt-12">
                  {aiResults.recommendations.map((rec) => {
                     const item = rec.type === 'resource' 
                        ? resources.find(r => r.id === rec.id)
                        : learningPaths.find(p => p.id === rec.id);
                     
                     if (!item) return null;

                     return (
                        <div key={rec.id} className="group relative flex flex-col pt-16">
                           {/* Position the badge absolutely with enough offset to not overlap */}
                           <div className="absolute top-0 left-0 right-0 z-10 px-4 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-t-2xl shadow-sm flex items-start gap-2 min-h-[64px]">
                              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                              <div className="flex flex-col gap-0.5">
                                 <span className="text-[9px] uppercase tracking-wider font-black opacity-80">Pourquoi l'IA recommande :</span>
                                 <span className="text-xs md:text-sm font-medium leading-tight">{rec.reason}</span>
                              </div>
                           </div>
                           <div className="flex-1 rounded-b-2xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shadow-sm group-hover:shadow-lg overflow-hidden bg-background">
                              {rec.type === 'resource' ? (
                                 <ResourceCard resource={item as Resource} />
                              ) : (
                                 <LearningPathCard 
                                    path={item as LearningPath}
                                    categoryName={categories.find(c => c.id === (item as LearningPath).categoryId)?.name || 'Inconnue'}
                                    resourceCount={(item as LearningPath).steps.length}
                                 />
                              )}
                           </div>
                        </div>
                     )
                  })}
               </div>
               
               <div className="border-t border-dashed pt-8 mt-12" />
            </div>
          )}

          {/* Stats Cards Section */}
          {!searchResults && !aiResults && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-l-4 border-l-success shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4 md:p-6">
                  <div className="p-2 md:p-3 bg-success/10 rounded-full">
                    <Trophy className="w-5 h-5 md:w-6 md:h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Parcours terminés</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.completedPaths}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4 md:p-6">
                  <div className="p-2 md:p-3 bg-red-500/10 rounded-full">
                    <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500 fill-red-500" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Favoris</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.totalFavorites}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 p-4 md:p-6">
                  <div className="p-2 md:p-3 bg-primary/10 rounded-full">
                    <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-wider">Explorées</p>
                    <p className="text-xl md:text-2xl font-bold">{stats.exploredResources}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {(searchResults && !aiResults) ? (
             <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-2xl font-semibold tracking-tight">
                      Résultats pour "{searchQuery}"
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-muted-foreground">
                    <X className="w-4 h-4 mr-2" /> Effacer
                  </Button>
                </div>
                
                {searchResults.paths.length > 0 && (
                    <section>
                        <h4 className="text-base md:text-xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                            <Milestone className="w-5 h-5 text-primary" />
                            Parcours correspondants
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
                     <section className="mt-8">
                        <h4 className="text-base md:text-xl font-semibold tracking-tight flex items-center gap-2 mb-4">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Ressources correspondantes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {searchResults.resources.map(resource => (
                                <ResourceCard key={resource.id} resource={resource} />
                            ))}
                        </div>
                    </section>
                )}

                {searchResults.paths.length === 0 && searchResults.resources.length === 0 && (
                    <div className="text-center py-12 bg-card rounded-2xl border-2 border-dashed">
                        <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-base font-semibold text-muted-foreground">Aucun résultat classique trouvé</p>
                        <p className="text-sm text-muted-foreground mb-6">Essayez d'utiliser l'IA pour une recherche plus large.</p>
                        <Button onClick={handleAISearch} disabled={isAISearching}>
                          {isAISearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                          Demander à l'IA
                        </Button>
                    </div>
                )}
             </div>
          ) : !aiResults && (
            <>
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Milestone className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                            Mes Parcours
                        </h3>
                        <Button asChild variant="link" className="text-primary p-0 h-auto text-sm">
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
                            <Card key={path.id} className="overflow-hidden group hover:shadow-md transition-all">
                            <CardHeader className="p-4 md:p-6 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="group-hover:text-primary transition-colors text-base md:text-lg">{path.title}</CardTitle>
                                        <CardDescription className="text-xs md:text-sm">Étape {path.currentStep} sur {path.totalSteps}</CardDescription>
                                    </div>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-muted-foreground hover:text-destructive transition-colors" onClick={handleRemovePath}>
                                                    <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
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
                            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
                                <div className="space-y-4">
                                    <div className="space-y-1.5 md:space-y-2">
                                        <div className="flex justify-between text-[10px] md:text-xs font-medium">
                                            <span>Progression</span>
                                            <span>{Math.round(path.progress)}%</span>
                                        </div>
                                        <Progress value={path.progress} className="h-1.5 md:h-2" />
                                    </div>
                                    <Button asChild variant="default" className="w-full h-9 md:h-10 text-sm">
                                        <Link href={`/parcours/${path.id}`}>
                                            {path.progress === 100 ? "Revoir le parcours" : "Continuer"}
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                            </Card>
                        )})}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                        <CardContent className="p-8 md:p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <div className="p-3 md:p-4 bg-secondary rounded-full">
                                <Milestone className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base md:text-lg font-semibold text-foreground">Aucun parcours en cours</p>
                                <p className="text-xs md:text-sm">Commencez votre voyage en explorant nos parcours thématiques.</p>
                            </div>
                            <Button asChild className="mt-2 h-9 text-sm">
                                <Link href="/parcours">Explorer</Link>
                            </Button>
                        </CardContent>
                        </Card>
                    )}
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg md:text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                            Mes Favoris
                        </h3>
                    </div>
                    <div className="grid gap-3">
                    {userFavoriteResources.length > 0 ? (
                        userFavoriteResources.map(resource => (
                          <Card key={resource.id} className="hover:border-primary/50 transition-all group shadow-sm">
                              <CardContent className="p-3 md:p-4 flex justify-between items-center">
                                <div className="flex flex-col flex-1 min-w-0 mr-2">
                                  <p className="font-semibold group-hover:text-primary transition-colors text-sm md:text-base truncate">{resource.title}</p>
                                  <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-xs text-muted-foreground">
                                      <span className="bg-secondary px-1.5 py-0.5 rounded truncate max-w-[80px] md:max-w-none">{new URL(resource.url).hostname}</span>
                                      <span>•</span>
                                      <span>{resource.difficulty}</span>
                                      {resource.author && (
                                        <>
                                          <span>•</span>
                                          <span className="flex items-center gap-1 italic">
                                            <User className="w-3 h-3" />
                                            {resource.author}
                                          </span>
                                        </>
                                      )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => toggleFavorite(resource.id)}>
                                      <Heart className="w-4 h-4 md:w-5 md:h-5 fill-red-500" />
                                      <span className="sr-only">Retirer</span>
                                  </Button>
                                  <Button asChild size="sm" className="h-8 px-3 text-xs">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">Accéder</a>
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                        ))
                      ) : (
                        <Card className="border-dashed">
                          <CardContent className="p-8 md:p-10 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <div className="p-3 md:p-4 bg-secondary rounded-full">
                                <Star className="w-8 h-8 md:w-10 md:h-10 opacity-50" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base md:text-lg font-semibold text-foreground">Votre liste est vide</p>
                                <p className="text-xs md:text-sm">Marquez les ressources qui vous plaisent pour les retrouver ici.</p>
                            </div>
                            <Button asChild variant="outline" className="mt-2 h-9 text-sm">
                                <Link href="/parcours">Découvrir</Link>
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
