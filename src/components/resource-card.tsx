'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Resource, DataWeight, Difficulty } from "@/lib/types";
import { ArrowUpRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useFavorites } from "@/context/favorites-context";

type ResourceCardProps = {
  resource: Resource;
};

const dataWeightStyles: Record<DataWeight, string> = {
  Plume: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  Standard: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
  Media: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
  Flux: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
};

const difficultyStyles: Record<Difficulty, string> = {
  Débutant: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800",
  Intermédiaire: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800",
  Avancé: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
};


export function ResourceCard({ resource }: ResourceCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(resource.id);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-lg">{resource.title}</CardTitle>
        <CardDescription>{new URL(resource.url).hostname}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {resource.description || "Aucune description disponible."}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn(difficultyStyles[resource.difficulty])}>{resource.difficulty}</Badge>
            <Badge variant="outline" className={cn(dataWeightStyles[resource.dataWeight])}>{resource.dataWeight}</Badge>
            <Badge variant="secondary">{resource.language}</Badge>
        </div>
        <div className="flex w-full justify-between items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => toggleFavorite(resource.id)}>
                    <Heart className={cn("h-5 w-5 transition-colors", favorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground hover:text-red-500')} />
                    <span className="sr-only">{favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button asChild>
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    Accéder
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </a>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
