import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LearningPath, Difficulty } from "@/lib/types";
import { ArrowRight, BookCopy } from "lucide-react";
import { cn } from "@/lib/utils";

type LearningPathCardProps = {
  path: LearningPath;
  categoryName: string;
  resourceCount: number;
};

const difficultyStyles: Record<Difficulty, string> = {
  Débutant: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800",
  Intermédiaire: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800",
  Avancé: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
};

export function LearningPathCard({ path, categoryName, resourceCount }: LearningPathCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{path.title}</CardTitle>
            <Badge variant="secondary">{categoryName}</Badge>
        </div>
        <CardDescription>{path.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn(difficultyStyles[path.difficulty])}>{path.difficulty}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
                <BookCopy className="w-3 h-3"/>
                {resourceCount} ressources
            </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/parcours/${path.id}`}>
            Commencer le parcours
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
