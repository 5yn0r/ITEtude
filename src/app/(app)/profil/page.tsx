'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserProfile } from "@/firebase/auth/auth";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  displayName: z.string().min(3, { message: "Le nom d'affichage doit contenir au moins 3 caractères." }),
});

export default function ProfilePage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!auth || !firestore || !user) return;

    const success = await updateUserProfile(auth, firestore, user, values);

    if (success) {
      toast({
        title: "Profil mis à jour",
        description: "Votre nom d'affichage a été modifié.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour de votre profil.",
      });
    }
  }
  
  if (loading) {
    return (
        <>
            <AppHeader title="Profil" />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/50">
                 <div className="max-w-2xl mx-auto space-y-6">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-20 w-20 rounded-full" />
                            </div>
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-24" />
                        </CardContent>
                    </Card>
                 </div>
            </main>
        </>
    )
  }

  return (
    <>
      <AppHeader title="Profil" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mon Profil</CardTitle>
              <CardDescription>Gérez les informations de votre compte.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || "Utilisateur"} />
                    <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                 </Avatar>
                 <div>
                    <p className="font-semibold text-xl">{user?.displayName}</p>
                    <p className="text-muted-foreground">{user?.email}</p>
                 </div>
               </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom d'affichage</FormLabel>
                        <FormControl>
                          <Input placeholder="Votre nom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
