
-- Add 'coordenador' to the education_role enum
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'coordenador';

-- Add funcao_educacional column to professores to distinguish professor vs coordenador
ALTER TABLE public.professores ADD COLUMN IF NOT EXISTS funcao_educacional text NOT NULL DEFAULT 'professor';
