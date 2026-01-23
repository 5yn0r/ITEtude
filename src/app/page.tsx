import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, BookOpen, Shield, BrainCircuit, ArrowRight, TrendingUp, Filter, Milestone, Network, Server, Cloud, FileText, Video, Link2 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background">
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
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 md:pt-40 md:pb-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground font-headline leading-tight">
            ITEtude: La Boussole de l'Apprenant
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
            Transformez le chaos informationnel en parcours d'apprentissage structurés. La curation intelligente pour l'IT francophone.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild className="transform transition-transform duration-300 hover:scale-105">
              <Link href="/dashboard">
                Commencer l'exploration
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="border-b bg-secondary/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="relative flex items-center justify-center h-64 md:h-80">
                {/* Radar Animation */}
                <div className="absolute w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-radar-pulse">
                    <Compass className="w-10 h-10 text-primary" />
                </div>
                {/* Concentric Circles */}
                <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-primary/20"></div>
                <div className="absolute w-64 h-64 rounded-full border border-primary/10"></div>
                
                {/* Floating Resource Icons */}
                <div className="absolute top-0 left-1/4 animate-float-1">
                    <div className="p-3 bg-card rounded-full shadow-md border">
                        <FileText className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="absolute bottom-1/4 right-0 animate-float-2">
                    <div className="p-3 bg-card rounded-full shadow-md border">
                        <Video className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="absolute bottom-0 left-1/4 animate-float-3">
                     <div className="p-3 bg-card rounded-full shadow-md border">
                        <Link2 className="w-6 h-6 text-primary" />
                    </div>
                </div>
                <div className="absolute top-1/4 left-0 animate-float-4">
                    <div className="p-3 bg-card rounded-full shadow-md border">
                        <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                </div>
                 <div className="absolute top-1/4 right-10 animate-float-5">
                    <div className="p-3 bg-card rounded-full shadow-md border">
                        <Server className="w-6 h-6 text-primary" />
                    </div>
                </div>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-medium font-headline text-foreground">
                  Apprendre l’informatique sans perdre du temps à chercher les bonnes ressources.
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  ITEtude centralise, organise et guide l’accès aux meilleures ressources en informatique — pour les étudiants, autodidactes et professionnels du numérique.
                </p>
                <p className="mt-2 text-lg text-muted-foreground">
                  Trouvez quoi apprendre, où apprendre et par quoi commencer, au même endroit.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Le chemin le plus clair vers l'expertise IT</h2>
              <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">Arrêtez de deviner. Commencez à apprendre avec un plan.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard
                icon={Filter}
                title="Ressources Validées"
                description="Fini les tutos obsolètes. Nous trions sur le volet les meilleures ressources du web pour que vous ne perdiez pas une minute."
              />
              <FeatureCard
                icon={Milestone}
                title="Apprentissage Structuré"
                description="Passez de débutant à expert grâce à des parcours qui construisent vos compétences brique par brique, dans le bon ordre."
              />
              <FeatureCard
                icon={TrendingUp}
                title="Progression Suivie"
                description="Sachez toujours où vous en êtes. Validez des étapes, complétez des parcours et voyez concrètement vos connaissances grandir."
              />
            </div>
          </div>
        </section>

        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-headline">Domaines Couverts</h2>
              <p className="mt-2 text-muted-foreground">Des ressources triées sur le volet pour les métiers de demain.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <DomainCard
                icon={BookOpen}
                title="Développement Web"
                description="Maîtrisez les technologies front-end et back-end, du HTML/CSS à Node.js et au-delà."
              />
              <DomainCard
                icon={Shield}
                title="Cybersécurité"
                description="Apprenez à protéger les systèmes, les réseaux et les données contre les cyberattaques."
              />
              <DomainCard
                icon={BrainCircuit}
                title="Data Science & IA"
                description="Plongez dans le monde des données, de l'analyse à l'intelligence artificielle."
              />
              <DomainCard
                icon={Network}
                title="Réseau"
                description="Comprenez les fondements des réseaux informatiques et des protocoles de communication."
              />
              <DomainCard
                icon={Server}
                title="Système"
                description="Administrez et maintenez des systèmes d'exploitation comme Linux et Windows Server."
              />
               <DomainCard
                icon={Cloud}
                title="Cloud Computing"
                description="Déployez et gérez des applications sur des infrastructures cloud."
              />
            </div>
            <div className="mt-16 text-center">
              <p className="text-lg italic text-muted-foreground">
                L'information est gratuite, mais le temps est cher.
              </p>
              <div className="mt-8">
                <Button size="lg" asChild className="transform transition-transform duration-300 hover:scale-105">
                  <Link href="/dashboard">
                    Prêt à commencer ?
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
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
                    <Link href="/terms" className="hover:text-primary transition-colors">Règles d'usage</Link>
                </nav>
            </div>
            <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} ITEtude. Tous droits réservés.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}

function DomainCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-card rounded-lg shadow-sm border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <div className="p-4 bg-primary/10 rounded-full">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      <h3 className="mt-4 text-xl font-bold font-headline">{title}</h3>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="text-left bg-card p-6 rounded-lg border transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <div className="inline-block p-3 bg-primary/10 rounded-lg border">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  )
}
