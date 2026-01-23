import type { Category } from './types';

export const categories: Category[] = [
  { id: 1, name: 'Développement Web', slug: 'developpement-web', description: 'Apprenez à créer des sites et applications web modernes.', iconName: 'BookOpen' },
  { id: 2, name: 'Cybersécurité', slug: 'cybersecurite', description: 'Protégez les systèmes informatiques contre les menaces et les vulnérabilités.', iconName: 'Shield' },
  { id: 3, name: 'Data Science & IA', slug: 'data-science-ia', description: 'Explorez le monde des données, de l\'analyse à l\'intelligence artificielle.', iconName: 'BrainCircuit' },
  { id: 4, name: 'Réseau', slug: 'reseau', description: 'Comprenez les fondements des réseaux informatiques.', iconName: 'Network' },
  { id: 5, name: 'Système', slug: 'systeme', description: 'Administrez et maintenez des systèmes d\'exploitation.', iconName: 'Server' },
  { id: 6, name: 'Cloud Computing', slug: 'cloud-computing', description: 'Déployez et gérez des applications sur des infrastructures cloud.', iconName: 'Cloud' }
];
