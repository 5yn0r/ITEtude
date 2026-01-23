'use client';

import { AppSidebar } from "@/components/app-sidebar";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle } from "@/firebase/auth/auth";
import { Compass, Loader2, ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { useAdmin } from "@/hooks/use-admin";

function AppFooter() {
  return (
    <footer className="border-t bg-card p-3 text-center text-xs text-muted-foreground">
      &copy; {new Date().getFullYear()} ITEtude. Tous droits réservés.
    </footer>
  );
}

function AdminSkeleton() {
    return (
      <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-sidebar md:block">
            <div className="flex h-full max-h-screen flex-col gap-2 p-4">
                <Skeleton className="h-8 w-32" />
                <div className="flex-1 space-y-4 pt-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
                 <div className="mt-auto p-4 border-t border-sidebar-border">
                  <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
        <div className="flex flex-col overflow-hidden">
          <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-card px-4 md:px-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Skeleton className="h-96 w-full" />
          </main>
           <div className="border-t bg-card p-3">
             <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
}

const formSchema = z.object({
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

function AdminLoginPage() {
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const checkAdminAndProceed = async (loggedInUser: any) => {
    if (!firestore || !loggedInUser) {
        toast({ variant: "destructive", title: "Erreur", description: "Utilisateur non trouvé." });
        return;
    }
    const adminDocRef = doc(firestore, 'admins', loggedInUser.uid);
    try {
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            window.location.reload();
        } else {
            toast({ variant: "destructive", title: "Accès refusé", description: "Vous ne disposez pas des autorisations nécessaires pour accéder à cette section." });
        }
    } catch (error) {
        console.error("Error checking admin status:", error);
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de vérifier les autorisations d'administrateur." });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    const loggedInUser = await signInWithEmail(auth, values.email, values.password);
    if (loggedInUser) {
      await checkAdminAndProceed(loggedInUser);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "L'adresse e-mail ou le mot de passe est incorrect.",
      });
    }
  }

  async function handleGoogleSignIn() {
    if (!auth || !firestore) return;
    const loggedInUser = await signInWithGoogle(auth, firestore);
    if (loggedInUser) {
      await checkAdminAndProceed(loggedInUser);
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter avec Google. Veuillez réessayer.",
      });
    }
  }
  
  return (
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-secondary/50 p-4">
        <div className="absolute top-4 left-4">
             <Button asChild variant="outline">
                <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour au tableau de bord
                </Link>
            </Button>
        </div>
        <Link href="/" className="flex items-center gap-2 mb-6" aria-label="ITEtude Home">
            <Compass className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground font-headline">ITEtude</span>
        </Link>
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
            <CardTitle>Accès Administrateur</CardTitle>
            <CardDescription>Pour votre sécurité, veuillez vous authentifier à nouveau pour accéder au panneau d'administration.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    S'authentifier avec Google
                </Button>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou continuer avec</span></div>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="nom@exemple.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="password" render={({ field }) => (<FormItem><FormLabel>Mot de passe</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Vérification...</> : "Accéder à l'administration"}
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </main>
  )
}

function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
            <div className="text-center">
                <h1 className="text-9xl font-black text-primary">404</h1>
                <p className="text-2xl font-semibold tracking-tight text-foreground sm:text-4xl">Page non trouvée</p>
                <p className="mt-4 text-muted-foreground">Désolé, la page que vous cherchez n'existe pas ou a été déplacée.</p>
            </div>
        </main>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode; }) {
  const { user, loading: userLoading } = useUser();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const adminAuthStatus = sessionStorage.getItem('isAdminAuthenticated');
    if (adminAuthStatus === 'true') {
        setIsAdminAuthed(true);
    }
    setIsCheckingSession(false);
  }, []);

  const loading = userLoading || adminLoading || isCheckingSession;

  if (loading) {
    return <AdminSkeleton />;
  }
  
  if (!user) {
    // The root layout will redirect to /login. We just show a skeleton in the meantime.
    return <AdminSkeleton />;
  }

  // If the user is logged in but is NOT an admin, show a custom not found/unauthorized page.
  if (!isAdmin) {
    return <NotFoundPage />;
  }

  // If the user IS an admin, check if they have passed the re-authentication step.
  if (isAdminAuthed) {
    return (
        <div className="grid h-screen w-full overflow-hidden md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <AppSidebar className="hidden md:block border-r" />
          <div className="flex flex-col overflow-hidden">
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
            <AppFooter />
          </div>
        </div>
      );
  }
  
  // If the user is an admin but has not re-authenticated yet, show the admin login page.
  return <AdminLoginPage />;
}
