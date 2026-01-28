'use client'

import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { categories } from "@/lib/data";
import type { Resource, LearningPath, LearningPathStep, Feedback, FeedbackStatus, UserProgress, UserProfile, Certification } from "@/lib/types";
import { Milestone, BookOpen, PlusCircle, Pencil, Trash2, Heart, ArrowUpRight, Users, Loader2, ScanLine, Award } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useCollection } from "@/firebase/firestore/use-collection";
import { useCollectionGroup } from "@/firebase/firestore/use-collection-group";
import { addDoc, collection, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useFirestore, useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
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
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { checkLink } from "@/ai/flows/check-link-flow";

const resourceSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères."),
  url: z.string().url("Veuillez entrer une URL valide."),
  description: z.string().optional(),
  categoryId: z.coerce.number(),
  difficulty: z.enum(['Débutant', 'Intermédiaire', 'Avancé']),
  dataWeight: z.enum(['Plume', 'Standard', 'Media', 'Flux']),
  language: z.string(),
  author: z.string().optional(),
});

const pathSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères."),
  description: z.string().optional(),
  categoryId: z.coerce.number(),
  difficulty: z.enum(['Débutant', 'Intermédiaire', 'Avancé']),
  resourceIds: z.array(z.string()).min(1, "Veuillez sélectionner au moins une ressource."),
});

const certificationSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères."),
  issuingBody: z.string().min(2, "Le nom de l'organisme est requis."),
  url: z.string().url("Veuillez entrer une URL valide."),
  logoUrl: z.string().url("Veuillez entrer une URL de logo valide."),
  description: z.string().optional(),
  categoryId: z.coerce.number(),
  difficulty: z.enum(['Débutant', 'Intermédiaire', 'Avancé']),
});


const feedbackStatusStyles: Record<FeedbackStatus, string> = {
  'Nouveau': 'bg-red-100 text-red-800 border-red-200 font-semibold dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
  'En cours': 'bg-yellow-100 text-yellow-800 border-yellow-200 font-semibold dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
  'Résolu': 'bg-green-100 text-green-800 border-green-200 font-semibold dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
};

export default function AdminPage() {
  const { data: resources, loading: resourcesLoading } = useCollection<Resource>('resources');
  const { data: learningPaths, loading: pathsLoading } = useCollection<LearningPath>('learningPaths');
  const { data: certifications, loading: certificationsLoading } = useCollection<Certification>('certifications');
  const { data: feedbacks, loading: feedbacksLoading } = useCollection<Feedback>('feedback');
  const { data: allProgress, loading: progressLoading } = useCollectionGroup<UserProgress>('progress');
  const { data: users, loading: usersLoading } = useCollection<UserProfile>('users');
  const firestore = useFirestore();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("resources");
  const { toast } = useToast();

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [deletingPathId, setDeletingPathId] = useState<string | null>(null);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [deletingCertificationId, setDeletingCertificationId] = useState<string | null>(null);
  const [viewingFeedback, setViewingFeedback] = useState<Feedback | null>(null);
  const [checkingLinkId, setCheckingLinkId] = useState<string | null>(null);

  const resourceForm = useForm<z.infer<typeof resourceSchema>>({
    resolver: zodResolver(resourceSchema),
    defaultValues: { title: "", url: "", description: "", difficulty: "Débutant", dataWeight: "Standard", language: "Français", author: "" },
  });

  const pathForm = useForm<z.infer<typeof pathSchema>>({
    resolver: zodResolver(pathSchema),
    defaultValues: { title: "", description: "", difficulty: "Débutant", resourceIds: [] },
  });

  const certificationForm = useForm<z.infer<typeof certificationSchema>>({
    resolver: zodResolver(certificationSchema),
    defaultValues: { title: "", issuingBody: "", url: "", logoUrl: "", description: "", difficulty: "Débutant" },
  });

  const editResourceForm = useForm<z.infer<typeof resourceSchema>>({ resolver: zodResolver(resourceSchema) });
  const editPathForm = useForm<z.infer<typeof pathSchema>>({ resolver: zodResolver(pathSchema) });
  const editCertificationForm = useForm<z.infer<typeof certificationSchema>>({ resolver: zodResolver(certificationSchema) });

  useEffect(() => { if (editingResource) { editResourceForm.reset(editingResource); } }, [editingResource, editResourceForm]);
  useEffect(() => { if (editingPath) { editPathForm.reset({ ...editingPath, resourceIds: editingPath.steps.map(step => step.resourceId) }); } }, [editingPath, editPathForm]);
  useEffect(() => { if (editingCertification) { editCertificationForm.reset(editingCertification); } }, [editingCertification, editCertificationForm]);
  
  const likesPerResource = useMemo(() => {
    if (!allProgress) return new Map<string, number>();
    const counts = new Map<string, number>();
    allProgress.forEach(p => {
        if (p.isFavorite && p.id) {
            counts.set(p.id, (counts.get(p.id) || 0) + 1);
        }
    });
    return counts;
  }, [allProgress]);

  const totalLikes = useMemo(() => {
      if (!allProgress) return 0;
      return allProgress.filter(p => p.isFavorite).length;
  }, [allProgress]);

  const completionsPerPath = useMemo(() => {
    if (!allProgress || !learningPaths) return new Map<string, number>();
    const completedResourcesByUser = new Map<string, Set<string>>();
    allProgress.forEach(p => {
      if (p.status === 'terminé' && p.userId) {
        if (!completedResourcesByUser.has(p.userId)) {
          completedResourcesByUser.set(p.userId, new Set());
        }
        completedResourcesByUser.get(p.userId)!.add(p.id);
      }
    });
    const completions = new Map<string, number>();
    learningPaths.forEach(path => {
      if (path.steps.length === 0) {
        completions.set(path.id, 0);
        return;
      }
      const requiredResourceIds = new Set(path.steps.map(step => step.resourceId));
      let pathCompletions = 0;
      for (const [userId, userCompletedSet] of completedResourcesByUser.entries()) {
        const hasCompletedPath = [...requiredResourceIds].every(requiredId => userCompletedSet.has(requiredId));
        if (hasCompletedPath) pathCompletions++;
      }
      completions.set(path.id, pathCompletions);
    });
    return completions;
  }, [allProgress, learningPaths]);


  async function handleCheckLink(resource: Resource) {
    if (!user || !firestore) return;
    setCheckingLinkId(resource.id);
    try {
      const result = await checkLink({ url: resource.url });
      if (result.status === 'active') {
        toast({ title: "Lien Actif", description: `Le lien pour "${resource.title}" est accessible (Code: ${result.statusCode}).` });
      } else {
        const feedbackMessage = result.status === 'error' 
            ? `Le lien pour la ressource "${resource.title}" a retourné une erreur : ${result.errorMessage}`
            : `Le lien pour la ressource "${resource.title}" semble être cassé (Code de statut: ${result.statusCode}).`;
        toast({ variant: 'destructive', title: "Lien Cassé ou Inaccessible", description: "Un rapport a été créé dans la section feedback." });
        const dataToSend: any = { type: 'Problème de ressource', message: feedbackMessage, userId: user.uid, userEmail: user.email || 'N/A', userName: 'Système de Vérification', status: 'Nouveau', createdAt: serverTimestamp(), resourceId: resource.id, resourceTitle: resource.title };
        addDoc(collection(firestore, "feedback"), dataToSend).catch(async () => {
            const permissionError = new FirestorePermissionError({ path: 'feedback', operation: 'create', requestResourceData: dataToSend });
            errorEmitter.emit('permission-error', permissionError);
        });
      }
    } catch(e) { toast({ variant: 'destructive', title: "Erreur inattendue", description: "Une erreur s'est produite lors de la vérification du lien." }); }
    finally { setCheckingLinkId(null); }
  }

  function onResourceSubmit(values: z.infer<typeof resourceSchema>) {
    if (!firestore) return;
    const resourceData = { ...values, createdAt: serverTimestamp() };
    addDoc(collection(firestore, "resources"), resourceData).then(() => {
        toast({ title: "Ressource créée !", description: `"${values.title}" a été ajoutée.` });
        resourceForm.reset();
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: 'resources', operation: 'create', requestResourceData: resourceData });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de créer la ressource.", variant: "destructive" });
    });
  }

  function onPathSubmit(values: z.infer<typeof pathSchema>) {
    if (!firestore) return;
    const steps: LearningPathStep[] = values.resourceIds.map((resourceId, index) => ({ order: index + 1, resourceId: resourceId }));
    const newPath = { title: values.title, description: values.description, categoryId: values.categoryId, difficulty: values.difficulty, steps: steps, createdAt: serverTimestamp() };
    addDoc(collection(firestore, "learningPaths"), newPath).then(() => {
        toast({ title: "Parcours créé !", description: `"${values.title}" a été ajouté.` });
        pathForm.reset();
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: 'learningPaths', operation: 'create', requestResourceData: newPath });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de créer le parcours.", variant: "destructive" });
    });
  }

  function onCertificationSubmit(values: z.infer<typeof certificationSchema>) {
    if (!firestore) return;
    const certData = { ...values, createdAt: serverTimestamp() };
    addDoc(collection(firestore, "certifications"), certData).then(() => {
        toast({ title: "Certification créée !", description: `"${values.title}" a été ajoutée.` });
        certificationForm.reset();
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: 'certifications', operation: 'create', requestResourceData: certData });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de créer la certification.", variant: "destructive" });
    });
  }

  function onEditResourceSubmit(values: z.infer<typeof resourceSchema>) {
    if (!firestore || !editingResource) return;
    const resourceRef = doc(firestore, "resources", editingResource.id);
    updateDoc(resourceRef, values).then(() => {
        toast({ title: "Ressource mise à jour !" });
        setEditingResource(null);
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: resourceRef.path, operation: 'update', requestResourceData: values });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de mettre à jour la ressource.", variant: "destructive" });
    });
  }

  function onEditPathSubmit(values: z.infer<typeof pathSchema>) {
    if (!firestore || !editingPath) return;
    const steps: LearningPathStep[] = values.resourceIds.map((resourceId, index) => ({ order: index + 1, resourceId: resourceId }));
    const pathData = { title: values.title, description: values.description, categoryId: values.categoryId, difficulty: values.difficulty, steps: steps };
    const pathRef = doc(firestore, "learningPaths", editingPath.id);
    updateDoc(pathRef, pathData).then(() => {
        toast({ title: "Parcours mis à jour !" });
        setEditingPath(null);
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: pathRef.path, operation: 'update', requestResourceData: pathData });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de mettre à jour le parcours.", variant: "destructive" });
    });
  }

  function onEditCertificationSubmit(values: z.infer<typeof certificationSchema>) {
    if (!firestore || !editingCertification) return;
    const certRef = doc(firestore, "certifications", editingCertification.id);
    updateDoc(certRef, values).then(() => {
        toast({ title: "Certification mise à jour !" });
        setEditingCertification(null);
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: certRef.path, operation: 'update', requestResourceData: values });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de mettre à jour la certification.", variant: "destructive" });
    });
  }

  function handleDeleteResource() {
    if (!firestore || !deletingResourceId) return;
    const resourceRef = doc(firestore, 'resources', deletingResourceId);
    deleteDoc(resourceRef).then(() => toast({ title: "Ressource supprimée" })).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: resourceRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de supprimer la ressource.", variant: "destructive" });
    }).finally(() => setDeletingResourceId(null));
  }

  function handleDeletePath() {
    if (!firestore || !deletingPathId) return;
    const pathRef = doc(firestore, 'learningPaths', deletingPathId);
    deleteDoc(pathRef).then(() => toast({ title: "Parcours supprimé" })).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: pathRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de supprimer le parcours.", variant: "destructive" });
    }).finally(() => setDeletingPathId(null));
  }

  function handleDeleteCertification() {
    if (!firestore || !deletingCertificationId) return;
    const certRef = doc(firestore, 'certifications', deletingCertificationId);
    deleteDoc(certRef).then(() => toast({ title: "Certification supprimée" })).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: certRef.path, operation: 'delete' });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de supprimer la certification.", variant: "destructive" });
    }).finally(() => setDeletingCertificationId(null));
  }

  function handleFeedbackStatusChange(feedbackId: string, status: FeedbackStatus) {
    if (!firestore) return;
    const feedbackRef = doc(firestore, 'feedback', feedbackId);
    updateDoc(feedbackRef, { status }).then(() => {
        toast({ title: "Statut du feedback mis à jour." });
    }).catch(async () => {
        const permissionError = new FirestorePermissionError({ path: feedbackRef.path, operation: 'update', requestResourceData: { status } });
        errorEmitter.emit('permission-error', permissionError);
        toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    });
  }

  const loading = resourcesLoading || pathsLoading || certificationsLoading || feedbacksLoading || progressLoading || usersLoading;

  if (loading) {
    return (
      <>
        <AppHeader title="Tableau de bord Admin" />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
              <Card><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-12" /></CardContent></Card>
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <AppHeader title="Tableau de bord Admin" />
      <main className="flex-1 min-h-0 p-4 md:p-6 lg:p-8 bg-secondary/50 overflow-y-auto">
        <div className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Ressources</CardTitle><BookOpen className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{resources.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Parcours Créés</CardTitle><Milestone className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{learningPaths.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Certifications</CardTitle><Award className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{certifications.length}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Favoris</CardTitle><Heart className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalLikes}</div></CardContent></Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resources">Gérer les Ressources</TabsTrigger>
              <TabsTrigger value="paths">Gérer les Parcours</TabsTrigger>
              <TabsTrigger value="certifications">Gérer les Certifications</TabsTrigger>
              <TabsTrigger value="feedbacks">Gérer les Feedbacks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="space-y-4">
              <Card><CardHeader><CardTitle>Créer une nouvelle ressource</CardTitle></CardHeader><CardContent><Form {...resourceForm}><form onSubmit={resourceForm.handleSubmit(onResourceSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={resourceForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={resourceForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                <FormField control={resourceForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><FormField control={resourceForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={resourceForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={resourceForm.control} name="dataWeight" render={({ field }) => (<FormItem><FormLabel>Poids Data</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Plume">Plume</SelectItem><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Media">Media</SelectItem><SelectItem value="Flux">Flux</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={resourceForm.control} name="language" render={({ field }) => (<FormItem><FormLabel>Langue</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Français">Français</SelectItem><SelectItem value="Anglais">Anglais</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={resourceForm.control} name="author" render={({ field }) => (<FormItem><FormLabel>Auteur (Optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                <Button type="submit" disabled={resourceForm.formState.isSubmitting}>Créer la ressource</Button>
              </form></Form></CardContent></Card>
              
              <Card><CardHeader><CardTitle>Gérer les ressources existantes</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Titre</TableHead><TableHead className="text-center">Favoris</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                {resources.map((resource) => (<TableRow key={resource.id}><TableCell className="font-medium">{resource.title}</TableCell><TableCell className="text-center">{likesPerResource.get(resource.id) || 0}</TableCell><TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleCheckLink(resource)} disabled={checkingLinkId === resource.id}>
                    {checkingLinkId === resource.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
                    <span className="sr-only">Vérifier le lien</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setEditingResource(resource)}><Pencil className="h-4 w-4" /><span className="sr-only">Modifier</span></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingResourceId(resource.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer</span></Button>
                </TableCell></TableRow>))}
              </TableBody></Table></CardContent></Card>
            </TabsContent>

            <TabsContent value="paths" className="space-y-4">
              <Card><CardHeader><CardTitle>Créer un nouveau parcours</CardTitle></CardHeader><CardContent><Form {...pathForm}><form onSubmit={pathForm.handleSubmit(onPathSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={pathForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={pathForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /></div>
                <FormField control={pathForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={pathForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                <FormField control={pathForm.control} name="resourceIds" render={() => (<FormItem><div className="mb-4 flex items-center justify-between"><div className="space-y-1"><FormLabel className="text-base">Ressources du parcours</FormLabel><FormDescription>Sélectionnez les ressources à inclure.</FormDescription></div><Button type="button" variant="outline" size="sm" onClick={() => setActiveTab('resources')}><PlusCircle className="mr-2 h-4 w-4" />Nouvelle ressource</Button></div><div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 border rounded-md">{resources.map((resource) => (<FormField key={resource.id} control={pathForm.control} name="resourceIds" render={({ field }) => (<FormItem key={resource.id} className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(resource.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), resource.id]) : field.onChange(field.value?.filter((value) => value !== resource.id)); }} /></FormControl><FormLabel className="font-normal text-sm">{resource.title}</FormLabel></FormItem>)} />))}</div><FormMessage /></FormItem>)} />
                <Button type="submit" disabled={pathForm.formState.isSubmitting}>Créer le parcours</Button>
              </form></Form></CardContent></Card>

              <Card><CardHeader><CardTitle>Gérer les parcours existants</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow>
                <TableHead>Titre</TableHead>
                <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>Achèvements</span>
                    </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader><TableBody>
                {learningPaths.map((path) => (<TableRow key={path.id}>
                    <TableCell className="font-medium">{path.title}</TableCell>
                    <TableCell className="text-center">{completionsPerPath.get(path.id) || 0}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setEditingPath(path)}><Pencil className="h-4 w-4" /><span className="sr-only">Modifier</span></Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingPathId(path.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer</span></Button>
                    </TableCell>
                </TableRow>))}
              </TableBody></Table></CardContent></Card>
            </TabsContent>

             <TabsContent value="certifications" className="space-y-4">
              <Card><CardHeader><CardTitle>Ajouter une nouvelle certification</CardTitle></CardHeader><CardContent><Form {...certificationForm}><form onSubmit={certificationForm.handleSubmit(onCertificationSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={certificationForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={certificationForm.control} name="issuingBody" render={({ field }) => (<FormItem><FormLabel>Organisme</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={certificationForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={certificationForm.control} name="logoUrl" render={({ field }) => (<FormItem><FormLabel>URL du Logo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
                <FormField control={certificationForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={certificationForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={certificationForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /></div>
                <Button type="submit" disabled={certificationForm.formState.isSubmitting}>Ajouter la certification</Button>
              </form></Form></CardContent></Card>
              
              <Card><CardHeader><CardTitle>Gérer les certifications existantes</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Titre</TableHead><TableHead>Organisme</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>
                {certifications.map((cert) => (<TableRow key={cert.id}><TableCell className="font-medium">{cert.title}</TableCell><TableCell>{cert.issuingBody}</TableCell><TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingCertification(cert)}><Pencil className="h-4 w-4" /><span className="sr-only">Modifier</span></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingCertificationId(cert.id)}><Trash2 className="h-4 w-4" /><span className="sr-only">Supprimer</span></Button>
                </TableCell></TableRow>))}
              </TableBody></Table></CardContent></Card>
            </TabsContent>

            <TabsContent value="feedbacks">
              <Card>
                <CardHeader><CardTitle>Feedbacks des utilisateurs</CardTitle><CardDescription>Gérez les retours et les problèmes signalés.</CardDescription></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader><TableRow><TableHead>Message</TableHead><TableHead>Type</TableHead><TableHead>Ressource</TableHead><TableHead>Utilisateur</TableHead><TableHead>Date</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {feedbacks.map(feedback => {
                        const resource = feedback.resourceId ? resources.find(r => r.id === feedback.resourceId) : null;
                        return (
                          <TableRow key={feedback.id}>
                            <TableCell className="max-w-xs truncate">
                              <Button variant="link" className="p-0 h-auto text-left font-normal text-current hover:no-underline hover:text-primary" onClick={() => setViewingFeedback(feedback)}>{feedback.message}</Button>
                            </TableCell>
                            <TableCell>{feedback.type}</TableCell>
                            <TableCell>{resource ? (<a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" title={resource.title}>{feedback.resourceTitle || resource.title}</a>) : (<span className="text-muted-foreground">-</span>)}</TableCell>
                            <TableCell>{feedback.userName || feedback.userEmail}</TableCell>
                            <TableCell>{feedback.createdAt ? format(feedback.createdAt.toDate(), 'P p', { locale: fr }) : ''}</TableCell>
                            <TableCell>
                              <Select defaultValue={feedback.status} onValueChange={(value) => handleFeedbackStatusChange(feedback.id, value as FeedbackStatus)}>
                                  <SelectTrigger className={cn("w-[120px]", feedbackStatusStyles[feedback.status])}><SelectValue /></SelectTrigger>
                                  <SelectContent><SelectItem value="Nouveau">Nouveau</SelectItem><SelectItem value="En cours">En cours</SelectItem><SelectItem value="Résolu">Résolu</SelectItem></SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </div>
      </main>

      <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
        <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Modifier la ressource</DialogTitle></DialogHeader>
          <Form {...editResourceForm}><form onSubmit={editResourceForm.handleSubmit(onEditResourceSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editResourceForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={editResourceForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
            <FormField control={editResourceForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><FormField control={editResourceForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={editResourceForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={editResourceForm.control} name="dataWeight" render={({ field }) => (<FormItem><FormLabel>Poids Data</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Plume">Plume</SelectItem><SelectItem value="Standard">Standard</SelectItem><SelectItem value="Media">Media</SelectItem><SelectItem value="Flux">Flux</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editResourceForm.control} name="language" render={({ field }) => (<FormItem><FormLabel>Langue</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Français">Français</SelectItem><SelectItem value="Anglais">Anglais</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={editResourceForm.control} name="author" render={({ field }) => (<FormItem><FormLabel>Auteur (Optionnel)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
            <DialogFooter><Button type="submit" disabled={editResourceForm.formState.isSubmitting}>Enregistrer</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deletingResourceId} onOpenChange={(open) => !open && setDeletingResourceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera définitivement la ressource. Les parcours utilisant cette ressource pourraient être affectés.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteResource}>Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editingPath} onOpenChange={(open) => !open && setEditingPath(null)}>
        <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Modifier le parcours</DialogTitle></DialogHeader>
          <Form {...editPathForm}><form onSubmit={editPathForm.handleSubmit(onEditPathSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editPathForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={editPathForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /></div>
            <FormField control={editPathForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={editPathForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <FormField control={editPathForm.control} name="resourceIds" render={() => (<FormItem><div className="mb-4"><FormLabel className="text-base">Ressources du parcours</FormLabel><FormDescription>Ajoutez ou retirez des ressources.</FormDescription></div><div className="max-h-60 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 border rounded-md">{resources.map((resource) => (<FormField key={resource.id} control={editPathForm.control} name="resourceIds" render={({ field }) => (<FormItem key={resource.id} className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(resource.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), resource.id]) : field.onChange(field.value?.filter((value) => value !== resource.id)); }} /></FormControl><FormLabel className="font-normal text-sm">{resource.title}</FormLabel></FormItem>)} />))}</div><FormMessage /></FormItem>)} />
            <DialogFooter><Button type="submit" disabled={editPathForm.formState.isSubmitting}>Enregistrer</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deletingPathId} onOpenChange={(open) => !open && setDeletingPathId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera définitivement le parcours d'apprentissage.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeletePath}>Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Dialog open={!!editingCertification} onOpenChange={(open) => !open && setEditingCertification(null)}>
        <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Modifier la certification</DialogTitle></DialogHeader>
          <Form {...editCertificationForm}><form onSubmit={editCertificationForm.handleSubmit(onEditCertificationSubmit)} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editCertificationForm.control} name="title" render={({ field }) => (<FormItem><FormLabel>Titre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={editCertificationForm.control} name="issuingBody" render={({ field }) => (<FormItem><FormLabel>Organisme</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editCertificationForm.control} name="url" render={({ field }) => (<FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /><FormField control={editCertificationForm.control} name="logoUrl" render={({ field }) => (<FormItem><FormLabel>URL du Logo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} /></div>
            <FormField control={editCertificationForm.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FormField control={editCertificationForm.control} name="categoryId" render={({ field }) => (<FormItem><FormLabel>Catégorie</FormLabel><Select onValueChange={field.onChange} defaultValue={String(field.value)}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent>{categories.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>)} /><FormField control={editCertificationForm.control} name="difficulty" render={({ field }) => (<FormItem><FormLabel>Difficulté</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Choisir..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Débutant">Débutant</SelectItem><SelectItem value="Intermédiaire">Intermédiaire</SelectItem><SelectItem value="Avancé">Avancé</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} /></div>
            <DialogFooter><Button type="submit" disabled={editCertificationForm.formState.isSubmitting}>Enregistrer</Button></DialogFooter>
          </form></Form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deletingCertificationId} onOpenChange={(open) => !open && setDeletingCertificationId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible et supprimera définitivement la certification.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDeleteCertification}>Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!viewingFeedback} onOpenChange={(open) => !open && setViewingFeedback(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Message de {viewingFeedback?.userName || viewingFeedback?.userEmail}</DialogTitle>
            <DialogDescription>
              Type: {viewingFeedback?.type} | Le {viewingFeedback?.createdAt ? format(viewingFeedback.createdAt.toDate(), 'P p', { locale: fr }) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
            <p>{viewingFeedback?.message}</p>
          </div>
          <DialogFooter>
              {viewingFeedback?.resourceId && resources.find(r => r.id === viewingFeedback.resourceId) && (
                  <Button asChild>
                      <a href={resources.find(r => r.id === viewingFeedback.resourceId)?.url} target="_blank" rel="noopener noreferrer">
                          Voir la ressource
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                      </a>
                  </Button>
              )}
            <Button variant="outline" onClick={() => setViewingFeedback(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
