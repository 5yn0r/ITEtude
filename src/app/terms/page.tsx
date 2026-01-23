'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [date, setDate] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    const currentDate = new Date();
    setDate(currentDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }));
    setYear(currentDate.getFullYear().toString());
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-headline !mb-4">Règles d'Usage</h1>
            <p className="text-muted-foreground !mt-0">Dernière mise à jour : {date || '...'}</p>
            
            <p>Bienvenue sur ITEtude. En utilisant notre site, vous acceptez de respecter les présentes règles d'usage.</p>
            
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Utilisation du service</h2>
            <p>Vous vous engagez à utiliser ITEtude de manière responsable et à ne pas perturber le bon fonctionnement du site. Il est interdit de :</p>
            <ul>
              <li>Utiliser le site à des fins illégales ou non autorisées.</li>
              <li>Soumettre du contenu malveillant, diffamatoire ou qui enfreint les droits d'autrui.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold font-headline">Contenu</h2>
            <p>Le contenu des ressources externes vers lesquelles nous lions n'est pas sous notre contrôle direct. Bien que nous nous efforçons de ne proposer que des liens de qualité, nous ne sommes pas responsables de leur contenu.</p>
            <p>Les feedbacks que vous soumettez nous aident à améliorer la plateforme. En soumettant un feedback, vous nous accordez le droit de l'utiliser pour améliorer notre service.</p>

            <h2 className="text-2xl md:text-3xl font-bold font-headline">Comptes</h2>
            <p>Vous êtes responsable de la sécurité de votre compte et de votre mot de passe. ITEtude ne peut être tenu pour responsable des pertes ou dommages résultant de votre manquement à cette obligation de sécurité.</p>
            
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
                    <Link href="/about" className="hover:text-primary transition-colors">À propos</Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors">Confidentialité</Link>
                    <Link href="/terms" className="text-primary font-semibold transition-colors">Règles d'usage</Link>
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
