'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Certification, Difficulty, CertificationStatus } from "@/lib/types";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { categories } from '@/lib/data';
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type CertificationCardProps = {
  certification: Certification;
};

const difficultyStyles: Record<Difficulty, string> = {
  Débutant: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800",
  Intermédiaire: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800",
  Avancé: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
};

const statusStyles: Record<CertificationStatus, string> = {
  Gratuit: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
  Payant: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
};


export function CertificationCard({ certification }: CertificationCardProps) {
  const category = categories.find(c => c.id === certification.categoryId);
  const isExpired = certification.expiresAt && certification.expiresAt.toDate() < new Date();

  return (
    <Card className={cn("flex flex-col h-full hover:shadow-md transition-shadow", isExpired && "opacity-60")}>
      <CardHeader>
        <div className="flex gap-4 items-start">
            <Image 
                src={certification.logoUrl} 
                alt={`Logo de ${certification.issuingBody}`}
                width={64}
                height={64}
                className="rounded-md border p-1 aspect-square object-contain"
            />
            <div className='flex-1'>
                <CardTitle className="text-lg">{certification.title}</CardTitle>
                <CardDescription>{certification.issuingBody}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {certification.description || "Aucune description disponible."}
        </p>
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn(difficultyStyles[certification.difficulty])}>{certification.difficulty}</Badge>
            {category && <Badge variant="secondary">{category.name}</Badge>}
            <Badge variant="secondary">{certification.language}</Badge>
            <Badge variant="outline" className={cn(statusStyles[certification.status])}>{certification.status}</Badge>
        </div>
         <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t mt-4">
            {certification.issuedAt && (
                <p>Commencé le : <span className="font-medium text-foreground">{format(certification.issuedAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span></p>
            )}
            {isExpired ? (
                 <p className="font-semibold text-destructive">Expiré le : {format(certification.expiresAt.toDate(), 'd MMMM yyyy', { locale: fr })}</p>
            ) : certification.expiresAt ? (
                <p>Expire le : <span className="font-medium text-foreground">{format(certification.expiresAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span></p>
            ) : (
                <p>Expiration : <span className="font-medium text-foreground">Non applicable</span></p>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={isExpired}>
          <a href={certification.url} target="_blank" rel="noopener noreferrer">
            Voir la certification
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
