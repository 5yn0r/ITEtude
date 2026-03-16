'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlusCircle, Pencil, Trash2, StickyNote, Loader2, Calendar, FileText, Clock } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Note } from "@/lib/types";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const noteSchema = z.object({
  title: z.string().min(1, "Le titre est requis."),
  content: z.string().min(1, "Le contenu est requis."),
});

export default function NotesPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const { data: notes, loading } = useCollection<Note>(
    user ? `users/${user.uid}/notes` : null
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "", content: "" },
  });

  const editForm = useForm<z.infer<typeof noteSchema>>({
    resolver: zodResolver(noteSchema),
  });

  async function onCreateSubmit(values: z.infer<typeof noteSchema>) {
    if (!firestore || !user) return;
    const noteData = {
      ...values,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    addDoc(collection(firestore, `users/${user.uid}/notes`), noteData)
      .then(() => {
        toast({ title: "Note créée", description: "Votre note a été enregistrée avec succès." });
        setIsCreateDialogOpen(false);
        form.reset();
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: `users/${user.uid}/notes`,
          operation: 'create',
          requestResourceData: noteData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  async function onEditSubmit(values: z.infer<typeof noteSchema>) {
    if (!firestore || !user || !editingNote) return;
    const noteRef = doc(firestore, `users/${user.uid}/notes`, editingNote.id);
    const updateData = {
      ...values,
      updatedAt: serverTimestamp(),
    };

    updateDoc(noteRef, updateData)
      .then(() => {
        toast({ title: "Note mise à jour" });
        setEditingNote(null);
      })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: noteRef.path,
          operation: 'update',
          requestResourceData: updateData,
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  async function handleDelete() {
    if (!firestore || !user || !deletingNoteId) return;
    const noteRef = doc(firestore, `users/${user.uid}/notes`, deletingNoteId);
    
    deleteDoc(noteRef)
      .then(() => toast({ title: "Note supprimée" }))
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: noteRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setDeletingNoteId(null));
  }

  function handleOpenEdit(note: Note) {
    setEditingNote(note);
    editForm.reset({ title: note.title, content: note.content });
  }

  if (loading) {
    return (
      <>
        <AppHeader title="Mes Notes" />
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-secondary/50">
           <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
              </div>
           </div>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title="Mes Notes" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto overscroll-y-contain">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mon Bloc-notes</h2>
              <p className="text-muted-foreground">Consignez vos réflexions et vos rappels d'apprentissage.</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-primary/20 transition-all">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Créer une note
                  </DialogTitle>
                  <DialogDescription>Ajoutez une nouvelle note à votre bloc-notes personnel.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Titre</FormLabel>
                          <FormControl>
                            <Input placeholder="Titre de la note..." {...field} className="bg-secondary/20" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Écrivez vos pensées ici..." rows={6} {...field} className="bg-secondary/20 resize-none" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting} className="w-full sm:w-auto">
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer la note"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {notes.sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis()).map((note, index) => {
                const colors = ["border-t-primary", "border-t-success", "border-t-orange-400", "border-t-indigo-400"];
                const borderColor = colors[index % colors.length];

                return (
                  <Card key={note.id} className={cn(
                    "flex flex-col h-full border-t-4 transition-all duration-300 hover:shadow-xl bg-card rounded-xl overflow-hidden group",
                    borderColor
                  )}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                          {note.title}
                        </CardTitle>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {note.updatedAt ? format(note.updatedAt.toDate(), 'd MMMM yyyy', { locale: fr }) : ''}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                          <Clock className="w-3 h-3" />
                          Mis à jour à {note.updatedAt ? format(note.updatedAt.toDate(), 'HH:mm', { locale: fr }) : ''}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-3 pb-4 px-6 border-t bg-secondary/10 flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" 
                        onClick={() => handleOpenEdit(note)}
                      >
                        <Pencil className="h-4 w-4 mr-1.5" />
                        Modifier
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors" 
                        onClick={() => setDeletingNoteId(note.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Supprimer
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-card rounded-3xl border-2 border-dashed border-muted-foreground/20 shadow-inner">
               <div className="bg-primary/5 p-6 rounded-full mb-6">
                 <StickyNote className="h-16 w-16 text-primary/40" />
               </div>
               <p className="text-xl font-bold text-foreground mb-2">Votre bloc-notes est vide</p>
               <p className="text-sm text-muted-foreground mb-8 text-center max-w-sm px-4">
                  Besoin de noter une commande Linux ou une astuce React ? C'est l'endroit idéal pour garder vos connaissances à portée de main.
               </p>
               <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-full px-8">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Créer ma première note
               </Button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Modifier la note
            </DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 py-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-secondary/20" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contenu</FormLabel>
                    <FormControl>
                      <Textarea rows={8} {...field} className="bg-secondary/20 resize-none" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={editForm.formState.isSubmitting} className="w-full sm:w-auto">
                  {editForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Mettre à jour la note"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={(open) => !open && setDeletingNoteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Supprimer cette note ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Votre note sera définitivement supprimée de votre espace personnel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
