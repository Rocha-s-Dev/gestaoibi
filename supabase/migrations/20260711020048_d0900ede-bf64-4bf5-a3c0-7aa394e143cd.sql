
-- 1. Enum de papéis
DO $$ BEGIN
  CREATE TYPE public.infrastructure_role AS ENUM (
    'secretario_infraestrutura','diretor_obras','coordenador_obras',
    'engenheiro_civil','engenheiro_eletricista','arquiteto','fiscal_obras',
    'coordenador_manutencao','supervisor_equipe','encarregado_servicos',
    'tecnico_edificacoes','tecnico_eletrotecnico','operador_maquinas',
    'eletricista','bombeiro_hidraulico','pedreiro','carpinteiro','pintor',
    'soldador','mecanico','operador_rocadeira','jardineiro','agente_campo'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Tabela user_infrastructure_roles
CREATE TABLE IF NOT EXISTS public.user_infrastructure_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.infrastructure_role NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  unidade_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE (user_id, role, unidade_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_infrastructure_roles TO authenticated;
GRANT ALL ON public.user_infrastructure_roles TO service_role;
ALTER TABLE public.user_infrastructure_roles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_uir_updated_at BEFORE UPDATE ON public.user_infrastructure_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Funções auxiliares
CREATE OR REPLACE FUNCTION public.has_infrastructure_role(_user_id uuid, _role public.infrastructure_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_infrastructure_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE OR REPLACE FUNCTION public.is_secretario_infraestrutura(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT public.has_infrastructure_role(_user_id,'secretario_infraestrutura')
$$;

CREATE OR REPLACE FUNCTION public.is_diretor_obras(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT public.has_infrastructure_role(_user_id,'diretor_obras')
$$;

CREATE OR REPLACE FUNCTION public.is_coordenador_manutencao(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT public.has_infrastructure_role(_user_id,'coordenador_manutencao')
$$;

CREATE OR REPLACE FUNCTION public.has_any_infrastructure_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_infrastructure_roles WHERE user_id=_user_id)
$$;

CREATE OR REPLACE FUNCTION public.can_manage_infrastructure(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT public.is_admin_municipal(_user_id)
      OR public.is_secretario_infraestrutura(_user_id)
      OR public.is_diretor_obras(_user_id)
      OR public.has_infrastructure_role(_user_id,'coordenador_obras')
      OR public.has_infrastructure_role(_user_id,'coordenador_manutencao')
      OR public.has_infrastructure_role(_user_id,'engenheiro_civil')
      OR public.has_infrastructure_role(_user_id,'engenheiro_eletricista')
      OR public.has_infrastructure_role(_user_id,'arquiteto')
      OR public.has_infrastructure_role(_user_id,'fiscal_obras')
$$;

CREATE OR REPLACE FUNCTION public.can_view_infrastructure(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='public' AS $$
  SELECT public.can_manage_infrastructure(_user_id)
      OR public.has_any_infrastructure_role(_user_id)
      OR public.is_auditor(_user_id)
      OR public.has_gabinete_access(_user_id)
$$;

-- 4. RLS user_infrastructure_roles
CREATE POLICY "uir_view" ON public.user_infrastructure_roles FOR SELECT TO authenticated
  USING (public.can_view_infrastructure(auth.uid()) OR user_id = auth.uid());
CREATE POLICY "uir_manage" ON public.user_infrastructure_roles FOR ALL TO authenticated
  USING (public.is_admin_municipal(auth.uid()) OR public.is_secretario_infraestrutura(auth.uid()))
  WITH CHECK (public.is_admin_municipal(auth.uid()) OR public.is_secretario_infraestrutura(auth.uid()));

-- 5. Alertas
CREATE TABLE IF NOT EXISTS public.alertas_infraestrutura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prioridade TEXT NOT NULL DEFAULT 'media',
  status TEXT NOT NULL DEFAULT 'pendente',
  entidade TEXT,
  entidade_id UUID,
  responsavel_id UUID,
  data_limite DATE,
  resolvido_em TIMESTAMPTZ,
  resolvido_por UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas_infraestrutura TO authenticated;
GRANT ALL ON public.alertas_infraestrutura TO service_role;
ALTER TABLE public.alertas_infraestrutura ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_ai_updated_at BEFORE UPDATE ON public.alertas_infraestrutura
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "ai_view" ON public.alertas_infraestrutura FOR SELECT TO authenticated
  USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "ai_manage" ON public.alertas_infraestrutura FOR ALL TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 6. Documentos
CREATE TABLE IF NOT EXISTS public.documentos_infraestrutura (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  tipo TEXT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tamanho BIGINT,
  mime_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_infraestrutura TO authenticated;
GRANT ALL ON public.documentos_infraestrutura TO service_role;
ALTER TABLE public.documentos_infraestrutura ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_di_updated_at BEFORE UPDATE ON public.documentos_infraestrutura
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "di_view" ON public.documentos_infraestrutura FOR SELECT TO authenticated
  USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "di_insert" ON public.documentos_infraestrutura FOR INSERT TO authenticated
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE POLICY "di_update" ON public.documentos_infraestrutura FOR UPDATE TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE POLICY "di_delete" ON public.documentos_infraestrutura FOR DELETE TO authenticated
  USING (public.is_admin_municipal(auth.uid()) OR public.is_secretario_infraestrutura(auth.uid()));

-- 7. Storage policies bucket documentos-infraestrutura
CREATE POLICY "di_storage_view" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-infraestrutura' AND public.can_view_infrastructure(auth.uid()));
CREATE POLICY "di_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-infraestrutura' AND public.can_manage_infrastructure(auth.uid()));
CREATE POLICY "di_storage_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos-infraestrutura' AND public.can_manage_infrastructure(auth.uid()));
CREATE POLICY "di_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-infraestrutura' AND (public.is_admin_municipal(auth.uid()) OR public.is_secretario_infraestrutura(auth.uid())));

-- 8. Auditoria automática
CREATE TRIGGER trg_audit_uir AFTER INSERT OR UPDATE OR DELETE ON public.user_infrastructure_roles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER trg_audit_ai AFTER INSERT OR UPDATE OR DELETE ON public.alertas_infraestrutura
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER trg_audit_di AFTER INSERT OR UPDATE OR DELETE ON public.documentos_infraestrutura
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
