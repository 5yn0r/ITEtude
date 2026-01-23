'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AboutPage() {
  const [year, setYear] = useState('');

  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-secondary/50">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="ITEtude Home">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground font-headline">ITEtude</span>
          </Link>
          <Button asChild>
            <Link href="/dashboard">Accéder à la plateforme</Link>
          </Button>
        </div>
      </header>
      <main className="flex-grow">
        <section className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <article className="prose dark:prose-invert max-w-none">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-headline !mb-4">À propos d'ITEtude</h1>
            <p className="text-xl text-muted-foreground !mt-0">Notre mission est de rendre l'apprentissage de l'informatique plus accessible et structuré pour la communauté francophone.</p>
            
            <h2 className="text-2xl md:text-3xl font-bold font-headline">La Problématique</h2>
            <p>Le monde de l'informatique est un océan d'informations. Pour les apprenants, en particulier francophones, il est souvent difficile de naviguer dans cette immensité de ressources, de tutoriels et de documentations. On se retrouve vite submergé, ne sachant pas par où commencer, quelles ressources sont fiables, ou comment organiser son apprentissage de manière logique. Cette surcharge informationnelle mène à la démotivation et à l'abandon.</p>
            
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Notre Solution</h2>
            <p>ITEtude est né de ce constat. Nous sommes la boussole qui guide les passionnés d'IT à travers leur parcours d'apprentissage. Notre plateforme ne se contente pas de lister des ressources ; elle les organise en <strong className="text-primary">parcours d'apprentissage cohérents et structurés</strong>, conçus par des experts du domaine.</p>
            <ul>
              <li><strong>Curation Intelligente :</strong> Nous sélectionnons et validons les meilleures ressources disponibles (articles, vidéos, documentations, etc.) pour chaque sujet.</li>
              <li><strong>Parcours Structurés :</strong> Fini le chaos. Suivez des chemins balisés qui vous mènent du niveau débutant à avancé, étape par étape.</li>
              <li><strong>Communauté Francophone :</strong> Toutes nos ressources sont choisies pour leur pertinence et leur accessibilité pour un public francophone.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold font-headline">Notre Vision</h2>
            <p>Nous croyons que l'éducation technologique de qualité doit être à la portée de tous. ITEtude a pour ambition de devenir la référence pour l'auto-formation en informatique dans le monde francophone, en créant une communauté d'apprenants et de contributeurs passionnés.</p>
          </article>
        </section>
      </main>
      <footer className="bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2" aria-label="ITEtude Home">
                    <Compass className="w-7 h-7 text-primary" />
                    <span className="text-xl font-bold text-foreground font-headline">ITEtude</span>
                </div>
                <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <Link href="/about" className="text-primary font-semibold transition-colors">À propos</Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
                    <Link href="/terms" className="hover:text-primary transition-colors">Règles d'usage</Link>
                </nav>
            </div>
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>&copy; {year} ITEtude. Tous droits réservés.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
