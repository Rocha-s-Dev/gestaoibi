
-- 1. Create enum for health professional roles
CREATE TYPE public.cargo_saude AS ENUM (
  'diretor_unidade',
  'coordenador_atencao_basica',
  'medico',
  'enfermeiro',
  'tecnico_enfermagem',
  'agente_comunitario_saude',
  'farmaceutico',
  'psicologo',
  'dentista',
  'recepcionista',
  'regulador_tfd',
  'auxiliar_administrativo'
);

-- 2. Add cargo column to profissionais_saude
ALTER TABLE public.profissionais_saude
  ADD COLUMN IF NOT EXISTS cargo cargo_saude NOT NULL DEFAULT 'auxiliar_administrativo';

-- 3. Add unique constraint: one active role per user per unit
CREATE UNIQUE INDEX idx_profissional_unico_por_unidade
  ON public.profissionais_saude (user_id, unidade_id)
  WHERE status = 'ativo';

-- 4. Add responsavel_id to unidades_saude (link to profissionais_saude user)
ALTER TABLE public.unidades_saude
  ADD COLUMN IF NOT EXISTS responsavel_id uuid REFERENCES public.profissionais_saude(id);

-- 5. Security definer function: get user's cargo in a health unit
CREATE OR REPLACE FUNCTION public.get_cargo_saude(_user_id uuid, _unidade_id uuid DEFAULT NULL)
  RETURNS cargo_saude
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT cargo FROM public.profissionais_saude
  WHERE user_id = _user_id
    AND status = 'ativo'
    AND (_unidade_id IS NULL OR unidade_id = _unidade_id)
  ORDER BY created_at DESC
  LIMIT 1;
$$;

-- 6. Security definer function: check if user has specific cargo
CREATE OR REPLACE FUNCTION public.has_cargo_saude(_user_id uuid, _cargo cargo_saude)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profissionais_saude
    WHERE user_id = _user_id
      AND cargo = _cargo
      AND status = 'ativo'
  );
$$;

-- 7. Security definer: check if user can access clinical data
CREATE OR REPLACE FUNCTION public.pode_acessar_dados_clinicos(_user_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profissionais_saude
    WHERE user_id = _user_id
      AND cargo IN ('medico', 'enfermeiro', 'dentista', 'psicologo')
      AND status = 'ativo'
  ) OR public.is_admin_municipal(_user_id)
    OR public.is_secretaria_saude(_user_id);
$$;

-- 8. Security definer: check if user can access unit data
CREATE OR REPLACE FUNCTION public.pode_acessar_unidade_saude(_user_id uuid, _unidade_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT
    public.is_admin_municipal(_user_id)
    OR public.is_secretaria_saude(_user_id)
    OR EXISTS (
      SELECT 1 FROM public.profissionais_saude
      WHERE user_id = _user_id
        AND unidade_id = _unidade_id
        AND status = 'ativo'
    );
$$;
