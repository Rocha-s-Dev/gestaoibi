
-- 1. ENUM de papéis sociais
DO $$ BEGIN
  CREATE TYPE public.social_role AS ENUM (
    'secretario_assistencia_social',
    'coordenador_cras',
    'coordenador_creas',
    'assistente_social',
    'psicologo_social',
    'tecnico_nivel_medio',
    'agente_social',
    'gestor_beneficios'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. ENUM de tipos de benefício
DO $$ BEGIN
  CREATE TYPE public.tipo_beneficio_eventual AS ENUM (
    'auxilio_funeral',
    'auxilio_natalidade',
    'cesta_basica',
    'aluguel_social',
    'passagem',
    'documentacao',
    'outros'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Tabela user_social_roles
CREATE TABLE IF NOT EXISTS public.user_social_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.social_role NOT NULL,
  secretaria_id UUID,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role, unidade_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_social_roles TO authenticated;
GRANT ALL ON public.user_social_roles TO service_role;
ALTER TABLE public.user_social_roles ENABLE ROW LEVEL SECURITY;

-- 4. Funções auxiliares
CREATE OR REPLACE FUNCTION public.has_social_role(_user_id uuid, _role public.social_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_social_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_secretario_assistencia_social(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_social_roles
    WHERE user_id = _user_id AND role = 'secretario_assistencia_social'
  )
$$;

CREATE OR REPLACE FUNCTION public.has_any_social_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_social_roles WHERE user_id = _user_id)
$$;

-- 5. Policies user_social_roles
DROP POLICY IF EXISTS "Admins e secretários gerenciam papéis sociais" ON public.user_social_roles;
CREATE POLICY "Admins e secretários gerenciam papéis sociais"
ON public.user_social_roles FOR ALL TO authenticated
USING (public.is_admin_municipal(auth.uid()) OR public.is_secretario_assistencia_social(auth.uid()))
WITH CHECK (public.is_admin_municipal(auth.uid()) OR public.is_secretario_assistencia_social(auth.uid()));

DROP POLICY IF EXISTS "Equipe social visualiza colegas" ON public.user_social_roles;
CREATE POLICY "Equipe social visualiza colegas"
ON public.user_social_roles FOR SELECT TO authenticated
USING (public.has_any_social_role(auth.uid()));

DROP POLICY IF EXISTS "Usuário visualiza próprio papel social" ON public.user_social_roles;
CREATE POLICY "Usuário visualiza próprio papel social"
ON public.user_social_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- 6. Tabela beneficios_eventuais
CREATE TABLE IF NOT EXISTS public.beneficios_eventuais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias_cadunico(id) ON DELETE SET NULL,
  membro_id UUID REFERENCES public.membros_familia(id) ON DELETE SET NULL,
  tipo_beneficio public.tipo_beneficio_eventual NOT NULL,
  descricao TEXT,
  valor NUMERIC(12,2) DEFAULT 0,
  quantidade INTEGER DEFAULT 1,
  data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_concessao DATE,
  data_validade DATE,
  parcela_atual INTEGER DEFAULT 1,
  total_parcelas INTEGER DEFAULT 1,
  justificativa TEXT NOT NULL,
  parecer_tecnico TEXT,
  documentos_anexos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'solicitado',
  tecnico_responsavel_id UUID,
  aprovado_por UUID,
  data_aprovacao TIMESTAMPTZ,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  secretaria_id UUID,
  observacoes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.beneficios_eventuais TO authenticated;
GRANT ALL ON public.beneficios_eventuais TO service_role;
ALTER TABLE public.beneficios_eventuais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins e secretários gerenciam benefícios" ON public.beneficios_eventuais;
CREATE POLICY "Admins e secretários gerenciam benefícios"
ON public.beneficios_eventuais FOR ALL TO authenticated
USING (public.is_admin_municipal(auth.uid()) OR public.is_secretario_assistencia_social(auth.uid()))
WITH CHECK (public.is_admin_municipal(auth.uid()) OR public.is_secretario_assistencia_social(auth.uid()));

DROP POLICY IF EXISTS "Equipe social gerencia benefícios" ON public.beneficios_eventuais;
CREATE POLICY "Equipe social gerencia benefícios"
ON public.beneficios_eventuais FOR ALL TO authenticated
USING (
  public.has_social_role(auth.uid(), 'coordenador_cras')
  OR public.has_social_role(auth.uid(), 'coordenador_creas')
  OR public.has_social_role(auth.uid(), 'assistente_social')
  OR public.has_social_role(auth.uid(), 'psicologo_social')
  OR public.has_social_role(auth.uid(), 'gestor_beneficios')
)
WITH CHECK (
  public.has_social_role(auth.uid(), 'coordenador_cras')
  OR public.has_social_role(auth.uid(), 'coordenador_creas')
  OR public.has_social_role(auth.uid(), 'assistente_social')
  OR public.has_social_role(auth.uid(), 'psicologo_social')
  OR public.has_social_role(auth.uid(), 'gestor_beneficios')
);

DROP POLICY IF EXISTS "Técnicos e agentes visualizam benefícios" ON public.beneficios_eventuais;
CREATE POLICY "Técnicos e agentes visualizam benefícios"
ON public.beneficios_eventuais FOR SELECT TO authenticated
USING (
  public.has_social_role(auth.uid(), 'tecnico_nivel_medio')
  OR public.has_social_role(auth.uid(), 'agente_social')
);

-- 7. Trigger updated_at
DROP TRIGGER IF EXISTS trg_beneficios_eventuais_updated_at ON public.beneficios_eventuais;
CREATE TRIGGER trg_beneficios_eventuais_updated_at
BEFORE UPDATE ON public.beneficios_eventuais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Histórico
CREATE TABLE IF NOT EXISTS public.beneficios_eventuais_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficio_id UUID NOT NULL REFERENCES public.beneficios_eventuais(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  observacao TEXT,
  autor_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.beneficios_eventuais_historico TO authenticated;
GRANT ALL ON public.beneficios_eventuais_historico TO service_role;
ALTER TABLE public.beneficios_eventuais_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Equipe social visualiza histórico de benefícios" ON public.beneficios_eventuais_historico;
CREATE POLICY "Equipe social visualiza histórico de benefícios"
ON public.beneficios_eventuais_historico FOR SELECT TO authenticated
USING (
  public.is_admin_municipal(auth.uid())
  OR public.has_any_social_role(auth.uid())
);

DROP POLICY IF EXISTS "Equipe social registra histórico de benefícios" ON public.beneficios_eventuais_historico;
CREATE POLICY "Equipe social registra histórico de benefícios"
ON public.beneficios_eventuais_historico FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin_municipal(auth.uid())
  OR public.has_any_social_role(auth.uid())
);

-- 9. Trigger para registrar mudança de status automaticamente
CREATE OR REPLACE FUNCTION public.trg_beneficio_status_historico()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.beneficios_eventuais_historico (beneficio_id, status_anterior, status_novo, autor_id)
    VALUES (NEW.id, NULL, NEW.status, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.beneficios_eventuais_historico (beneficio_id, status_anterior, status_novo, autor_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_beneficios_status_hist ON public.beneficios_eventuais;
CREATE TRIGGER trg_beneficios_status_hist
AFTER INSERT OR UPDATE OF status ON public.beneficios_eventuais
FOR EACH ROW EXECUTE FUNCTION public.trg_beneficio_status_historico();

-- 10. Índices
CREATE INDEX IF NOT EXISTS idx_user_social_roles_user ON public.user_social_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_social_roles_secretaria ON public.user_social_roles(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_familia ON public.beneficios_eventuais(familia_id);
CREATE INDEX IF NOT EXISTS idx_beneficios_status ON public.beneficios_eventuais(status);
CREATE INDEX IF NOT EXISTS idx_beneficios_tipo ON public.beneficios_eventuais(tipo_beneficio);
CREATE INDEX IF NOT EXISTS idx_beneficios_unidade ON public.beneficios_eventuais(unidade_id);
