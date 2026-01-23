'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function PrivacyPage() {
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground font-headline !mb-4">Politique de Confidentialité</h1>
            <p className="text-muted-foreground !mt-0">Dernière mise à jour : {date || '...'}</p>
            
            <p>Votre vie privée est importante pour nous. Cette politique de confidentialité explique quelles données personnelles ITEtude collecte auprès de vous, à travers nos interactions et nos services, et comment nous les utilisons.</p>
            
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Données que nous collectons</h2>
            <p>ITEtude collecte des données pour fonctionner efficacement et vous fournir les meilleures expériences avec nos services. Vous fournissez certaines de ces données directement, par exemple lorsque vous créez un compte ITEtude, ou lorsque vous nous contactez pour du support.</p>
            <p>Les données que nous collectons peuvent inclure les suivantes :</p>
            <ul>
              <li><strong>Informations de compte :</strong> Votre nom, votre adresse e-mail, et vos identifiants de connexion.</li>
              <li><strong>Données d'utilisation :</strong> Nous collectons des données sur la manière dont vous interagissez avec nos services. Cela inclut des données telles que les parcours que vous suivez, les ressources que vous consultez et votre progression.</li>
              <li><strong>Feedbacks et communications :</strong> Si vous nous donnez un feedback ou nous contactez pour du support, nous collectons votre message et d'autres données que vous nous fournissez.</li>
            </ul>

            <h2 className="text-2xl md:text-3xl font-bold font-headline">Comment nous utilisons les données personnelles</h2>
            <p>ITEtude utilise les données que nous collectons pour fournir et améliorer les services que nous offrons, y compris la personnalisation des expériences. Nous utilisons également les données pour communiquer avec vous, par exemple pour vous informer sur votre compte et les mises à jour du produit.</p>

            <h2 className="text-2xl md:text-3xl font-bold font-headline">Partage de vos données personnelles</h2>
            <p>Nous ne partageons pas vos données personnelles avec des tiers, sauf si cela est nécessaire pour fournir le service ou si la loi l'exige.</p>
            
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
                    <Link href="/privacy" className="text-primary font-semibold transition-colors">Confidentialité</Link>
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
