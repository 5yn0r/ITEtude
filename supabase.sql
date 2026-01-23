-- Schema for ITEtude Platform

-- This script is idempotent and can be run multiple times.

-- DATA WEIGHT ENUM
-- Defines the estimated data consumption for a resource.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'data_weight_enum') THEN
    CREATE TYPE data_weight_enum AS ENUM ('Plume', 'Standard', 'Media', 'Flux');
  END IF;
END$$;

-- DIFFICULTY LEVEL ENUM
-- Defines the difficulty level of a resource.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'difficulty_level_enum') THEN
    CREATE TYPE difficulty_level_enum AS ENUM ('Débutant', 'Intermédiaire', 'Avancé');
  END IF;
END$$;

-- PROGRESS STATUS ENUM
-- Defines the user's progress on a resource.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'progress_status_enum') THEN
    CREATE TYPE progress_status_enum AS ENUM ('non commencé', 'en cours', 'terminé');
  END IF;
END$$;

-- CATEGORIES TABLE
-- Stores resource categories in a hierarchical structure.
CREATE TABLE IF NOT EXISTS public.categories (
  id serial PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  parent_id integer REFERENCES public.categories(id) ON DELETE SET NULL,
  icon_name text -- For Lucide icons
);

-- PROFILES TABLE
-- This table stores user profile information, linked to Supabase Auth.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  preferences_data jsonb
);

-- RESOURCES TABLE
-- Stores curated learning resources.
CREATE TABLE IF NOT EXISTS public.resources (
  id serial PRIMARY KEY,
  title text NOT NULL,
  url text NOT NULL UNIQUE,
  description text,
  language text DEFAULT 'Français',
  data_weight data_weight_enum NOT NULL,
  difficulty_level difficulty_level_enum NOT NULL,
  category_id integer NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  author text,
  is_active boolean DEFAULT true
);

-- LEARNING PATHS TABLE
-- Stores structured learning paths composed of ordered resources.
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id serial PRIMARY KEY,
  title text NOT NULL,
  description text,
  steps jsonb, -- e.g., [{"order": 1, "resource_id": 123}, {"order": 2, "resource_id": 456}]
  category_id integer REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  difficulty_level difficulty_level_enum
);

-- USER PROGRESS TABLE
-- Tracks user progress on resources and learning paths.
CREATE TABLE IF NOT EXISTS public.user_progress (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_id integer REFERENCES public.resources(id) ON DELETE CASCADE,
  learning_path_id integer REFERENCES public.learning_paths(id) ON DELETE CASCADE,
  status progress_status_enum NOT NULL DEFAULT 'non commencé',
  updated_at timestamp WITH time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_favorite boolean DEFAULT false,
  CONSTRAINT user_resource_unique UNIQUE (user_id, resource_id)
);

-- HEALTH CHECK TABLE
-- Monitors the status of resource links.
CREATE TABLE IF NOT EXISTS public.health_check (
  id bigserial PRIMARY KEY,
  resource_id integer NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  status_code integer,
  last_checked_at timestamp WITH time zone NOT NULL,
  CONSTRAINT resource_id_unique UNIQUE (resource_id)
);


-- SEED INITIAL DATA
-- We use ON CONFLICT DO NOTHING to avoid errors on subsequent runs.

INSERT INTO public.categories (name, slug, description, icon_name, parent_id) VALUES
('Développement Web', 'developpement-web', 'Apprenez à créer des sites et applications web modernes.', 'BookOpen', NULL),
('Cybersécurité', 'cybersecurite', 'Protégez les systèmes informatiques contre les menaces et les vulnérabilités.', 'Shield', NULL),
('Data Science & IA', 'data-science-ia', 'Explorez le monde des données, de l''analyse à l''intelligence artificielle.', 'BrainCircuit', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
-- It's good practice to enable RLS and define policies.
-- These are commented out as they depend on your specific auth rules.

-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.health_check ENABLE ROW LEVEL SECURITY;

-- Example RLS policies:
-- CREATE POLICY "Allow public read-only access to categories and resources"
--   ON public.categories FOR SELECT USING (true);
-- CREATE POLICY "Allow public read-only access to resources"
--   ON public.resources FOR SELECT USING (true);
-- CREATE POLICY "Users can manage their own profile"
--   ON public.profiles FOR ALL USING (auth.uid() = id);
-- CREATE POLICY "Users can manage their own progress"
--   ON public.user_progress FOR ALL USING (auth.uid() = user_id);
