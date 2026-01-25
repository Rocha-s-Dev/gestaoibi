
-- Corrigir policy de log_acessos para não usar WITH CHECK (true)
DROP POLICY IF EXISTS "System insert logs" ON public.log_acessos;

-- Criar policy mais restritiva para inserção de logs (apenas usuários autenticados)
CREATE POLICY "Authenticated insert logs" ON public.log_acessos
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Adicionar search_path às funções que estavam sem
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_municipal(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND role = 'admin_municipal'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_secretaria_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT secretaria_id
  FROM public.user_secretaria_roles
  WHERE user_id = _user_id
    AND secretaria_id IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.has_secretaria_access(_user_id uuid, _secretaria_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND (secretaria_id = _secretaria_id OR role = 'admin_municipal')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_secretaria_role(_user_id uuid, _role secretaria_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_secretario_of(_user_id uuid, _secretaria_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND secretaria_id = _secretaria_id
      AND role IN ('secretario', 'secretario_adjunto')
  )
$$;

CREATE OR REPLACE FUNCTION public.has_education_role(_user_id uuid, _role education_role)
RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.has_education_role_in_school(_user_id uuid, _role education_role, _escola_id uuid)
RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.is_secretaria(_user_id uuid)
RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.get_user_school_ids(_user_id uuid)
RETURNS SETOF uuid
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

CREATE OR REPLACE FUNCTION public.is_responsavel_of_student(_user_id uuid, _aluno_id uuid)
RETURNS boolean
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

CREATE OR REPLACE FUNCTION public.is_secretaria_saude(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = 'secretaria_saude'
  )
$$;

CREATE OR REPLACE FUNCTION public.has_health_role(_user_id uuid, _role health_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.has_health_role_in_unidade(_user_id uuid, _role health_role, _unidade_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (unidade_id = _unidade_id OR unidade_id IS NULL)
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_unidade_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT unidade_id
  FROM public.user_health_roles
  WHERE user_id = _user_id
    AND unidade_id IS NOT NULL
$$;
