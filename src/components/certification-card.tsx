'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Certification, Difficulty, CertificationStatus } from "@/lib/types";
import { ArrowUpRight, Award } from "lucide-react";
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
    <Card className={cn("flex flex-col h-full hover:shadow-lg transition-all duration-300 border-t-4 border-t-primary/20", isExpired && "opacity-60")}>
      <CardHeader>
        <div className="flex gap-4 items-start">
            <div className="shrink-0 p-1 bg-white rounded-xl border shadow-sm">
              <Image 
                  src={certification.logoUrl} 
                  alt={`Logo de ${certification.issuingBody}`}
                  width={64}
                  height={64}
                  className="rounded-lg aspect-square object-contain"
              />
            </div>
            <div className='flex-1 space-y-1.5'>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                  {certification.issuingBody}
                </div>
                <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
                  {certification.title}
                </CardTitle>
            </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {certification.description || "Aucune description disponible pour cette certification."}
        </p>
        <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn("font-bold", difficultyStyles[certification.difficulty])}>{certification.difficulty}</Badge>
            {category && <Badge variant="secondary" className="font-semibold">{category.name}</Badge>}
            <Badge variant="secondary" className="font-semibold">{certification.language}</Badge>
            <Badge variant="outline" className={cn("font-bold", statusStyles[certification.status])}>{certification.status}</Badge>
        </div>
         <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t mt-4 bg-secondary/20 p-3 rounded-lg">
            {certification.issuedAt && (
                <div className="flex justify-between items-center">
                  <span>Commencé le</span>
                  <span className="font-bold text-foreground">{format(certification.issuedAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span>
                </div>
            )}
            <div className="flex justify-between items-center">
              <span>Statut expiration</span>
              {isExpired ? (
                   <span className="font-black text-destructive uppercase tracking-tighter">Expiré</span>
              ) : certification.expiresAt ? (
                  <span className="font-bold text-foreground">{format(certification.expiresAt.toDate(), 'd MMMM yyyy', { locale: fr })}</span>
              ) : (
                  <span className="font-medium text-muted-foreground">À vie / N/A</span>
              )}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full font-bold shadow-md hover:shadow-primary/20" disabled={isExpired}>
          <a href={certification.url} target="_blank" rel="noopener noreferrer">
            Accéder à la certification
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
