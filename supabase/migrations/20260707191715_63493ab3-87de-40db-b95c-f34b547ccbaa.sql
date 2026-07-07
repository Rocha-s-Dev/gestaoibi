
-- 1. Enum type
DO $$ BEGIN
  CREATE TYPE public.environment_role AS ENUM (
    'secretario_meio_ambiente',
    'coordenador_ambiental',
    'fiscal_ambiental',
    'analista_ambiental',
    'agente_ambiental',
    'gestor_programas_ambientais'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Table
CREATE TABLE IF NOT EXISTS public.user_environment_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.environment_role NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, secretaria_id)
);

-- 3. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_environment_roles TO authenticated;
GRANT ALL ON public.user_environment_roles TO service_role;

-- 4. RLS
ALTER TABLE public.user_environment_roles ENABLE ROW LEVEL SECURITY;

-- 5. Helper functions
CREATE OR REPLACE FUNCTION public.has_environment_role(_user_id uuid, _role public.environment_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_environment_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_secretario_meio_ambiente(_user_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_environment_roles
    WHERE user_id = _user_id AND role = 'secretario_meio_ambiente'
  )
$$;

-- 6. Policies
DROP POLICY IF EXISTS "Admins e secretários gerenciam papéis ambientais" ON public.user_environment_roles;
CREATE POLICY "Admins e secretários gerenciam papéis ambientais"
ON public.user_environment_roles
FOR ALL
TO authenticated
USING (
  public.is_admin_municipal(auth.uid())
  OR public.is_secretario_meio_ambiente(auth.uid())
)
WITH CHECK (
  public.is_admin_municipal(auth.uid())
  OR public.is_secretario_meio_ambiente(auth.uid())
);

DROP POLICY IF EXISTS "Coordenadores visualizam equipe ambiental" ON public.user_environment_roles;
CREATE POLICY "Coordenadores visualizam equipe ambiental"
ON public.user_environment_roles
FOR SELECT
TO authenticated
USING (
  public.has_environment_role(auth.uid(), 'coordenador_ambiental')
);

DROP POLICY IF EXISTS "Usuário visualiza próprio papel ambiental" ON public.user_environment_roles;
CREATE POLICY "Usuário visualiza próprio papel ambiental"
ON public.user_environment_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
