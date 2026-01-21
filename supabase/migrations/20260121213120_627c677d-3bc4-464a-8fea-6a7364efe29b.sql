-- =============================================
-- CONSUMO MERENDA E SISTEMA DE PAPÉIS EDUCACIONAIS
-- =============================================

-- 1. TABELA CONSUMO MERENDA
CREATE TABLE public.consumo_merenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE NOT NULL,
  cardapio_id UUID REFERENCES public.cardapios(id) ON DELETE SET NULL,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  refeicao TEXT NOT NULL,
  porcoes_servidas INTEGER NOT NULL DEFAULT 0,
  porcoes_planejadas INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_consumo_merenda_escola ON public.consumo_merenda(escola_id);
CREATE INDEX idx_consumo_merenda_data ON public.consumo_merenda(data);

ALTER TABLE public.consumo_merenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view consumo_merenda" ON public.consumo_merenda FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert consumo_merenda" ON public.consumo_merenda FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update consumo_merenda" ON public.consumo_merenda FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete consumo_merenda" ON public.consumo_merenda FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_consumo_merenda_updated_at BEFORE UPDATE ON public.consumo_merenda FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ENUM PARA PAPÉIS EDUCACIONAIS
CREATE TYPE public.education_role AS ENUM ('secretaria', 'diretor', 'professor', 'responsavel');

-- 3. TABELA USER_EDUCATION_ROLES
CREATE TABLE public.user_education_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role education_role NOT NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, escola_id)
);

CREATE INDEX idx_user_education_roles_user ON public.user_education_roles(user_id);
CREATE INDEX idx_user_education_roles_escola ON public.user_education_roles(escola_id);

ALTER TABLE public.user_education_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view education roles" ON public.user_education_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert education roles" ON public.user_education_roles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update education roles" ON public.user_education_roles FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete education roles" ON public.user_education_roles FOR DELETE TO authenticated USING (true);

-- 4. FUNÇÕES HELPER PARA VERIFICAR PAPEL EDUCACIONAL

CREATE OR REPLACE FUNCTION public.has_education_role(_user_id UUID, _role education_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_education_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_education_role_in_school(_user_id UUID, _role education_role, _escola_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_education_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (escola_id = _escola_id OR escola_id IS NULL)
  )
$$;

CREATE OR REPLACE FUNCTION public.is_secretaria(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_education_roles
    WHERE user_id = _user_id
      AND role = 'secretaria'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_school_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT escola_id
  FROM public.user_education_roles
  WHERE user_id = _user_id
    AND escola_id IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.is_responsavel_of_student(_user_id UUID, _aluno_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.responsaveis_alunos ra
    WHERE ra.responsavel_id = _user_id
      AND ra.aluno_id = _aluno_id
  )
$$;