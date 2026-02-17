
-- Add diretor_id and vice_diretor_id columns to escolas (referencing user_id from profiles)
ALTER TABLE public.escolas ADD COLUMN diretor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.escolas ADD COLUMN vice_diretor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
