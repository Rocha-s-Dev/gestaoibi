
-- Add new values to education_role enum
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'secretario_escolar';
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'assistente_admin_escolar';
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'auxiliar_secretaria_escolar';
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'coordenador_admin_escolar';
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'tecnico_admin_educacional';
