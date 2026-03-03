
-- Add modalidade column to escolas
ALTER TABLE public.escolas ADD COLUMN IF NOT EXISTS modalidade text DEFAULT 'fundamental_i';

-- Create professor_disciplinas junction table
CREATE TABLE IF NOT EXISTS public.professor_disciplinas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  disciplina_id uuid NOT NULL REFERENCES public.disciplinas(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(professor_id, disciplina_id)
);

-- Enable RLS
ALTER TABLE public.professor_disciplinas ENABLE ROW LEVEL SECURITY;

-- RLS policies for professor_disciplinas
CREATE POLICY "Authenticated users can view professor_disciplinas"
ON public.professor_disciplinas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin full access professor_disciplinas"
ON public.professor_disciplinas FOR ALL TO authenticated
USING (is_admin_municipal(auth.uid()))
WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Education roles can manage professor_disciplinas"
ON public.professor_disciplinas FOR ALL TO authenticated
USING (
  has_education_role(auth.uid(), 'secretaria') OR
  has_education_role(auth.uid(), 'diretor') OR
  has_education_role(auth.uid(), 'vice_diretor')
)
WITH CHECK (
  has_education_role(auth.uid(), 'secretaria') OR
  has_education_role(auth.uid(), 'diretor') OR
  has_education_role(auth.uid(), 'vice_diretor')
);

-- Rename bimestre to trimestre in notas table
ALTER TABLE public.notas RENAME COLUMN bimestre TO trimestre;
