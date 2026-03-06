
-- Create educacao_equipe table for support staff
CREATE TABLE public.educacao_equipe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cargo TEXT NOT NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE SET NULL,
  turno TEXT NOT NULL DEFAULT 'matutino',
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.educacao_equipe ENABLE ROW LEVEL SECURITY;

-- Admin municipal full access
CREATE POLICY "admin_full_access_educacao_equipe"
  ON public.educacao_equipe FOR ALL
  TO authenticated
  USING (public.is_admin_municipal(auth.uid()))
  WITH CHECK (public.is_admin_municipal(auth.uid()));

-- Secretaria de educação full access
CREATE POLICY "secretaria_educacao_full_access"
  ON public.educacao_equipe FOR ALL
  TO authenticated
  USING (public.has_education_role(auth.uid(), 'secretaria'))
  WITH CHECK (public.has_education_role(auth.uid(), 'secretaria'));

-- Directors/coordinators can view their school's staff
CREATE POLICY "diretores_view_escola"
  ON public.educacao_equipe FOR SELECT
  TO authenticated
  USING (
    escola_id IN (SELECT public.get_user_school_ids(auth.uid()))
  );
