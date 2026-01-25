'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCollection } from "@/firebase/firestore/use-collection";
import type { Resource } from "@/lib/types";

const feedbackSchema = z.object({
  type: z.enum(["Problème Technique", "Suggestion", "Problème de ressource", "Autre"], {
    required_error: "Veuillez sélectionner un type."
  }),
  message: z.string().min(10, { message: "Votre message doit contenir au moins 10 caractères." }),
  resourceId: z.string().optional(),
});

export default function FeedbackPage() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { data: resources, loading: resourcesLoading } = useCollection<Resource>('resources');

  const form = useForm<z.infer<typeof feedbackSchema>>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "Suggestion",
      message: "",
    },
  });

  const selectedType = form.watch("type");

  async function onSubmit(values: z.infer<typeof feedbackSchema>) {
    if (!firestore || !user) {
      toast({ variant: "destructive", title: "Erreur", description: "Vous devez être connecté pour envoyer un feedback." });
      return;
    }

    const dataToSend: any = {
      type: values.type,
      message: values.message,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName,
      status: 'Nouveau',
      createdAt: serverTimestamp(),
    };

    if (values.type === 'Problème de ressource' && values.resourceId) {
      dataToSend.resourceId = values.resourceId;
      const resourceTitle = resources.find(r => r.id === values.resourceId)?.title;
      if (resourceTitle) {
        dataToSend.resourceTitle = resourceTitle;
      }
    }

    addDoc(collection(firestore, "feedback"), dataToSend)
      .then(() => {
        toast({ variant: "success", title: "Feedback envoyé !", description: "Merci pour votre contribution." });
        form.reset();
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({ path: 'feedback', operation: 'create', requestResourceData: dataToSend });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible d'envoyer le feedback. Veuillez réessayer.", variant: "destructive" });
      });
  }

  return (
    <>
      <AppHeader title="Donner un feedback" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Votre avis nous intéresse</CardTitle>
              <CardDescription>Aidez-nous à améliorer ITEtude en nous faisant part de vos suggestions ou des problèmes que vous rencontrez.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de feedback</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez un type..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Suggestion">Suggestion</SelectItem>
                            <SelectItem value="Problème Technique">Problème Technique</SelectItem>
                            <SelectItem value="Problème de ressource">Problème sur une ressource</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedType === 'Problème de ressource' && (
                     <FormField
                        control={form.control}
                        name="resourceId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ressource concernée</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez une ressource..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {resourcesLoading ? (
                                    <SelectItem value="loading" disabled>Chargement...</SelectItem>
                                ) : (
                                    resources.map(r => <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>)
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  )}

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez votre suggestion ou le problème rencontré..."
                            rows={6}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={form.formState.isSubmitting}>
                     {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Envoyer le feedback
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
