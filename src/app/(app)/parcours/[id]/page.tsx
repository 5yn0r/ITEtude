'use client';

import { AppHeader } from "@/components/app-header";
import { categories } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Milestone, ArrowUpRight, RefreshCcw } from "lucide-react";
import Link from 'next/link';
import { useFavorites } from "@/context/favorites-context";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { LearningPath, Resource } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect, use, useMemo } from "react";
import { useWindowSize } from "@/hooks/use-window-size";
import dynamic from 'next/dynamic';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

function PathDetailSkeleton() {
  return (
    <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-9 w-3/4 mb-2" />
          <Skeleton className="h-5 w-full max-w-lg mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </main>
  );
}


export default function LearningPathDetailPage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const { isCompleted, toggleResourceCompleted, loading: favoritesLoading, resetPathProgress } = useFavorites();
  const { data: path, loading: pathLoading } = useDoc<LearningPath>(`learningPaths/${id}`);
  const { data: resources, loading: resourcesLoading } = useCollection<Resource>('resources');
  
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const loading = pathLoading || resourcesLoading || favoritesLoading;

  const pathResources = useMemo(() => {
    if (!path || !resources) return [];
    return path.steps
      .map(step => ({
        ...step,
        resource: resources.find(r => r.id === step.resourceId)
      }))
      .filter(item => item.resource)
      .sort((a, b) => a.order - b.order);
  }, [path, resources]);
  
  const { progress, completedSteps, totalSteps } = useMemo(() => {
    if (!pathResources || pathResources.length === 0) return { progress: 0, completedSteps: 0, totalSteps: 0 };
    const total = pathResources.length;
    const completed = pathResources.filter(step => isCompleted(step.resourceId)).length;
    const prog = Math.round((completed / total) * 100);
    return { progress: prog, completedSteps: completed, totalSteps: total };
  }, [pathResources, isCompleted]);
  
  useEffect(() => {
    if (progress === 100) {
      setShowConfetti(true);
    }
  }, [progress]);

  if (loading) {
    return (
      <>
        <AppHeader title="Parcours d'Apprentissage" />
        <PathDetailSkeleton />
      </>
    );
  }

  if (!path) {
    notFound();
  }

  const category = categories.find(c => c.id === path.categoryId);

  return (
    <>
      {showConfetti && width && height && (
        <ReactConfetti
          width={width}
          height={height}
          recycle={false}
          onConfettiComplete={() => setShowConfetti(false)}
          numberOfPieces={500}
          gravity={0.15}
        />
      )}
      <AppHeader title="Parcours d'Apprentissage" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
              <Milestone className="w-8 h-8 text-primary" />
              <div>
                <Link href="/parcours" className="text-sm text-primary hover:underline">
                  Tous les parcours
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">{path.title}</h2>
              </div>
            </div>
            <p className="text-muted-foreground">{path.description}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="secondary">{category?.name}</Badge>
              <Badge variant="outline">{path.difficulty}</Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <p className="text-muted-foreground">Progression</p>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" onClick={() => setShowResetConfirm(true)}>
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                    <span className="sr-only">Réinitialiser la progression</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Réinitialiser la progression</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <p className="font-medium text-muted-foreground">{completedSteps} / {totalSteps} terminées</p>
              </div>
              <Progress value={progress} />
            </div>
          </div>

          <div className="space-y-4">
            {pathResources.map(({ resource, order }) => {
              if (!resource) return null;
              const completed = isCompleted(resource.id);
              return (
                <Card key={resource.id} className="transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
                    <button
                      onClick={() => toggleResourceCompleted(resource.id)}
                      className="p-2 rounded-full hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shrink-0"
                      aria-label={`Marquer l'étape ${order} comme ${completed ? 'non terminée' : 'terminée'}`}
                    >
                      {completed ? (
                        <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-8 h-8 text-muted-foreground shrink-0" />
                      )}
                    </button>
                    <div className="flex-grow w-full">
                      <p className="text-sm text-muted-foreground">Étape {order}</p>
                      <p className="font-semibold">{resource.title}</p>
                      {resource.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{resource.description}</p>}
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground mt-2">
                        <span>{new URL(resource.url).hostname}</span>
                        <Badge variant="outline" className="py-0">{resource.dataWeight}</Badge>
                      </div>
                    </div>
                    <Button asChild size="sm" className="shrink-0 w-full sm:w-auto">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Accéder
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

       <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
          <AlertDialogContent>
          <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
              Cette action est irréversible. Votre progression pour ce parcours sera entièrement réinitialisée,
              mais vos favoris seront conservés.
              </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
              onClick={() => {
                  const resourceIds = pathResources.map(pr => pr.resourceId);
                  resetPathProgress(resourceIds);
              }}
              >
              Réinitialiser
              </AlertDialogAction>
          </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
