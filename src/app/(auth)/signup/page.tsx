'use client';

import { Button } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase";
import { signUpWithEmail, signInWithGoogle } from "@/firebase/auth/auth";
import { Compass, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button as ShadcnButton } from "@/components/ui/button";

const formSchema = z.object({
  displayName: z.string().min(3, { message: "Le nom doit contenir au moins 3 caractères." }),
  email: z.string().email({ message: "Veuillez entrer une adresse e-mail valide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    const user = await signUpWithEmail(auth, firestore, values.email, values.password, values.displayName);
    if (user) {
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erreur d'inscription",
        description: "Cette adresse e-mail est peut-être déjà utilisée.",
      });
    }
  }

  async function handleGoogleSignIn() {
    if (!auth || !firestore) return;
    const user = await signInWithGoogle(auth, firestore);
    if (user) {
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de se connecter avec Google. Veuillez réessayer.",
      });
    }
  }

  return (
    <>
      <Link href="/" className="flex items-center justify-center gap-2 mb-6" aria-label="ITEtude Home">
          <Compass className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold text-foreground font-headline">ITEtude</span>
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Inscription</CardTitle>
          <CardDescription>Créez un compte pour commencer à apprendre</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ShadcnButton 
            variant="outline" 
            className="w-full bg-white text-gray-700 border-gray-300 hover:bg-gray-50 font-medium" 
            onClick={handleGoogleSignIn}
          >
            <GoogleIcon />
            Continuer avec Google
          </ShadcnButton>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ou continuer avec
              </span>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom complet" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="nom@exemple.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••"
                          {...field} 
                          className="pr-10"
                        />
                        <ShadcnButton
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                          </span>
                        </ShadcnButton>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ShadcnButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  'Créer mon compte'
                )}
              </ShadcnButton>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>
              Vous avez déjà un compte ?{" "}
              <Link href="/login" className="text-primary hover:underline">
                  Se connecter
              </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
