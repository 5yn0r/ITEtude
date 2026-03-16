
'use client';

import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useUser, useFirestore } from "@/firebase";
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { PlusCircle, Pencil, Trash2, StickyNote, Loader2, Calendar } from "lucide-react";
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
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
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
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mon Bloc-notes</h2>
              <p className="text-muted-foreground">Consignez vos réflexions et vos rappels d'apprentissage.</p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle note
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Créer une note</DialogTitle>
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
                            <Input placeholder="Titre de la note" {...field} />
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
                            <Textarea placeholder="Écrivez votre contenu ici..." rows={6} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button type="submit" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis()).map(note => (
                <Card key={note.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                       <Calendar className="w-3 h-3" />
                       Dernière mise à jour le {note.updatedAt ? format(note.updatedAt.toDate(), 'd MMMM yyyy', { locale: fr }) : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                      {note.content}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-3 border-t flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(note)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeletingNoteId(note.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed border-muted-foreground/25">
               <StickyNote className="h-12 w-12 text-muted-foreground/50 mb-4" />
               <p className="text-lg font-medium">Votre bloc-notes est vide</p>
               <p className="text-sm text-muted-foreground mb-6">Commencez par créer votre première note.</p>
               <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nouvelle note
               </Button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier la note</DialogTitle>
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
                      <Input {...field} />
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
                      <Textarea rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                  {editForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Mettre à jour"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingNoteId} onOpenChange={(open) => !open && setDeletingNoteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette note ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Votre note sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
