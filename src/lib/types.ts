import type { LucideIcon } from "lucide-react";

export type DataWeight = 'Plume' | 'Standard' | 'Media' | 'Flux';
export type Difficulty = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type ProgressStatus = 'non commencé' | 'en cours' | 'terminé';
export type CertificationStatus = 'Gratuit' | 'Payant';

export type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parentId?: number | null;
  iconName: string;
};

export type Resource = {
  id: string;
  title: string;
  url: string;
  description?: string;
  language: string;
  dataWeight: DataWeight;
  difficulty: Difficulty;
  categoryId: number;
  author?: string;
};

export type LearningPathStep = {
  order: number;
  resourceId: string;
};

export type LearningPath = {
  id: string;
  title: string;
  description?: string;
  steps: LearningPathStep[];
  categoryId: number;
  difficulty: Difficulty;
};

export type Certification = {
  id: string;
  title: string;
  issuingBody: string;
  url: string;
  logoUrl: string;
  description?: string;
  categoryId: number;
  difficulty: Difficulty;
  issuedAt?: any; // Firestore Timestamp
  expiresAt?: any | null; // Firestore Timestamp or null
  language: string;
  status: CertificationStatus;
};

export type UserProfile = {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  hiddenPaths?: string[];
};

export type UserProgress = {
  id: string; // This will be the resourceId
  userId?: string;
  status: ProgressStatus;
  isFavorite: boolean;
};

export type FeedbackType = 'Problème Technique' | 'Suggestion' | 'Problème de ressource' | 'Autre';
export type FeedbackStatus = 'Nouveau' | 'En cours' | 'Résolu';

export type Feedback = {
  id: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: any; // Firestore Timestamp
  userId: string;
  userEmail: string;
  userName: string;
  resourceId?: string;
  resourceTitle?: string;
};
