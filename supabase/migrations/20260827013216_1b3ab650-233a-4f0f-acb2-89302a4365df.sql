-- HELPERS (idempotentes)
CREATE OR REPLACE FUNCTION public.has_infrastructure_role(_user_id uuid, _role public.infrastructure_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_infrastructure_roles WHERE user_id=_user_id AND role=_role)
$$;

CREATE OR REPLACE FUNCTION public.has_any_infrastructure_role(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_infrastructure_roles WHERE user_id=_user_id)
$$;

CREATE OR REPLACE FUNCTION public.is_secretario_infraestrutura(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_infrastructure_role(_user_id,'secretario_infraestrutura')
$$;

CREATE OR REPLACE FUNCTION public.is_diretor_obras(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.has_infrastructure_role(_user_id,'diretor_obras')
$$;

CREATE OR REPLACE FUNCTION public.can_manage_infrastructure(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
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
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT public.can_manage_infrastructure(_user_id)
      OR public.has_any_infrastructure_role(_user_id)
      OR public.is_auditor(_user_id)
      OR public.has_gabinete_access(_user_id)
$$;

-- ENUMS
DO $$ BEGIN
  CREATE TYPE public.servico_status AS ENUM ('aberta','em_analise','aguardando_material','em_execucao','pausada','concluida','cancelada');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.servico_prioridade AS ENUM ('baixa','media','alta','urgente','emergencial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 1. TIPOS DE SERVICO
CREATE TABLE IF NOT EXISTS public.servicos_tipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  categoria TEXT,
  unidade_medida TEXT,
  descricao TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_tipos TO authenticated;
GRANT ALL ON public.servicos_tipos TO service_role;
ALTER TABLE public.servicos_tipos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_tipos_view" ON public.servicos_tipos;
CREATE POLICY "servicos_tipos_view" ON public.servicos_tipos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_tipos_manage" ON public.servicos_tipos;
CREATE POLICY "servicos_tipos_manage" ON public.servicos_tipos FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 2. EQUIPES
CREATE TABLE IF NOT EXISTS public.servicos_equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  especialidade TEXT,
  supervisor_id UUID,
  supervisor_nome TEXT,
  veiculo_id UUID,
  veiculo_descricao TEXT,
  equipamentos TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  em_campo BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_equipes TO authenticated;
GRANT ALL ON public.servicos_equipes TO service_role;
ALTER TABLE public.servicos_equipes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_equipes_view" ON public.servicos_equipes;
CREATE POLICY "servicos_equipes_view" ON public.servicos_equipes FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_equipes_manage" ON public.servicos_equipes;
CREATE POLICY "servicos_equipes_manage" ON public.servicos_equipes FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

CREATE TABLE IF NOT EXISTS public.servicos_equipe_membros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipe_id UUID NOT NULL REFERENCES public.servicos_equipes(id) ON DELETE CASCADE,
  profile_id UUID,
  nome TEXT NOT NULL,
  funcao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_equipe_membros TO authenticated;
GRANT ALL ON public.servicos_equipe_membros TO service_role;
ALTER TABLE public.servicos_equipe_membros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_equipe_membros_view" ON public.servicos_equipe_membros;
CREATE POLICY "servicos_equipe_membros_view" ON public.servicos_equipe_membros FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_equipe_membros_manage" ON public.servicos_equipe_membros;
CREATE POLICY "servicos_equipe_membros_manage" ON public.servicos_equipe_membros FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 3. EQUIPAMENTOS
CREATE TABLE IF NOT EXISTS public.servicos_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT,
  patrimonio TEXT,
  patrimonio_id UUID,
  veiculo_id UUID,
  situacao TEXT NOT NULL DEFAULT 'ativo',
  horimetro NUMERIC,
  quilometragem NUMERIC,
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  localizacao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_equipamentos TO authenticated;
GRANT ALL ON public.servicos_equipamentos TO service_role;
ALTER TABLE public.servicos_equipamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_equipamentos_view" ON public.servicos_equipamentos;
CREATE POLICY "servicos_equipamentos_view" ON public.servicos_equipamentos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_equipamentos_manage" ON public.servicos_equipamentos;
CREATE POLICY "servicos_equipamentos_manage" ON public.servicos_equipamentos FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 4. ORDENS
CREATE TABLE IF NOT EXISTS public.servicos_ordens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT,
  tipo_id UUID REFERENCES public.servicos_tipos(id),
  tipo_nome TEXT,
  categoria TEXT,
  prioridade public.servico_prioridade NOT NULL DEFAULT 'media',
  status public.servico_status NOT NULL DEFAULT 'aberta',
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_prevista DATE,
  data_conclusao DATE,
  solicitante_nome TEXT,
  solicitante_contato TEXT,
  secretaria_solicitante_id UUID,
  secretaria_id UUID,
  bairro TEXT,
  endereco TEXT,
  referencia TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  descricao TEXT,
  observacoes TEXT,
  equipe_id UUID REFERENCES public.servicos_equipes(id) ON DELETE SET NULL,
  responsavel_id UUID,
  quantidade_prevista NUMERIC,
  quantidade_executada NUMERIC,
  valor_estimado NUMERIC,
  valor_executado NUMERIC,
  solicitacao_iluminacao_id UUID,
  obra_id UUID,
  contract_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens TO authenticated;
GRANT ALL ON public.servicos_ordens TO service_role;
ALTER TABLE public.servicos_ordens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_ordens_view" ON public.servicos_ordens;
CREATE POLICY "servicos_ordens_view" ON public.servicos_ordens FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_ordens_manage" ON public.servicos_ordens;
CREATE POLICY "servicos_ordens_manage" ON public.servicos_ordens FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 5. DESIGNACOES
CREATE TABLE IF NOT EXISTS public.servicos_ordens_designacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES public.servicos_equipes(id) ON DELETE SET NULL,
  equipe_nome TEXT,
  responsavel_nome TEXT,
  data_designacao DATE NOT NULL DEFAULT CURRENT_DATE,
  prazo DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens_designacoes TO authenticated;
GRANT ALL ON public.servicos_ordens_designacoes TO service_role;
ALTER TABLE public.servicos_ordens_designacoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_designacoes_view" ON public.servicos_ordens_designacoes;
CREATE POLICY "servicos_designacoes_view" ON public.servicos_ordens_designacoes FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_designacoes_manage" ON public.servicos_ordens_designacoes;
CREATE POLICY "servicos_designacoes_manage" ON public.servicos_ordens_designacoes FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 6. EXECUCOES
CREATE TABLE IF NOT EXISTS public.servicos_ordens_execucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_inicio TIME,
  hora_fim TIME,
  equipe_id UUID REFERENCES public.servicos_equipes(id) ON DELETE SET NULL,
  equipe_presente TEXT,
  quantidade_executada NUMERIC,
  unidade TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens_execucoes TO authenticated;
GRANT ALL ON public.servicos_ordens_execucoes TO service_role;
ALTER TABLE public.servicos_ordens_execucoes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_execucoes_view" ON public.servicos_ordens_execucoes;
CREATE POLICY "servicos_execucoes_view" ON public.servicos_ordens_execucoes FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_execucoes_manage" ON public.servicos_ordens_execucoes;
CREATE POLICY "servicos_execucoes_manage" ON public.servicos_ordens_execucoes FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 7. MATERIAIS
CREATE TABLE IF NOT EXISTS public.servicos_ordens_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  execucao_id UUID REFERENCES public.servicos_ordens_execucoes(id) ON DELETE SET NULL,
  material TEXT NOT NULL,
  almoxarifado_item_id UUID,
  quantidade NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT,
  valor_estimado NUMERIC,
  valor_utilizado NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens_materiais TO authenticated;
GRANT ALL ON public.servicos_ordens_materiais TO service_role;
ALTER TABLE public.servicos_ordens_materiais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_materiais_view" ON public.servicos_ordens_materiais;
CREATE POLICY "servicos_materiais_view" ON public.servicos_ordens_materiais FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_materiais_manage" ON public.servicos_ordens_materiais;
CREATE POLICY "servicos_materiais_manage" ON public.servicos_ordens_materiais FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 8. EQUIPAMENTOS UTILIZADOS
CREATE TABLE IF NOT EXISTS public.servicos_ordens_equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  execucao_id UUID REFERENCES public.servicos_ordens_execucoes(id) ON DELETE SET NULL,
  equipamento_id UUID REFERENCES public.servicos_equipamentos(id) ON DELETE SET NULL,
  equipamento_nome TEXT,
  horas_utilizadas NUMERIC,
  km_utilizados NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens_equipamentos TO authenticated;
GRANT ALL ON public.servicos_ordens_equipamentos TO service_role;
ALTER TABLE public.servicos_ordens_equipamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_os_equip_view" ON public.servicos_ordens_equipamentos;
CREATE POLICY "servicos_os_equip_view" ON public.servicos_ordens_equipamentos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_os_equip_manage" ON public.servicos_ordens_equipamentos;
CREATE POLICY "servicos_os_equip_manage" ON public.servicos_ordens_equipamentos FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 9. FOTOS
CREATE TABLE IF NOT EXISTS public.servicos_ordens_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  execucao_id UUID REFERENCES public.servicos_ordens_execucoes(id) ON DELETE SET NULL,
  categoria TEXT,
  legenda TEXT,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_ordens_fotos TO authenticated;
GRANT ALL ON public.servicos_ordens_fotos TO service_role;
ALTER TABLE public.servicos_ordens_fotos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_fotos_view" ON public.servicos_ordens_fotos;
CREATE POLICY "servicos_fotos_view" ON public.servicos_ordens_fotos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_fotos_manage" ON public.servicos_ordens_fotos;
CREATE POLICY "servicos_fotos_manage" ON public.servicos_ordens_fotos FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 10. HISTORICO
CREATE TABLE IF NOT EXISTS public.servicos_ordens_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_id UUID NOT NULL REFERENCES public.servicos_ordens(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.servicos_ordens_historico TO authenticated;
GRANT ALL ON public.servicos_ordens_historico TO service_role;
ALTER TABLE public.servicos_ordens_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_historico_view" ON public.servicos_ordens_historico;
CREATE POLICY "servicos_historico_view" ON public.servicos_ordens_historico FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_historico_insert" ON public.servicos_ordens_historico;
CREATE POLICY "servicos_historico_insert" ON public.servicos_ordens_historico FOR INSERT TO authenticated WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- 11. DOCUMENTOS
CREATE TABLE IF NOT EXISTS public.servicos_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  tipo TEXT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT,
  arquivo_tipo TEXT,
  arquivo_tamanho BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.servicos_documentos TO authenticated;
GRANT ALL ON public.servicos_documentos TO service_role;
ALTER TABLE public.servicos_documentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "servicos_documentos_view" ON public.servicos_documentos;
CREATE POLICY "servicos_documentos_view" ON public.servicos_documentos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
DROP POLICY IF EXISTS "servicos_documentos_manage" ON public.servicos_documentos;
CREATE POLICY "servicos_documentos_manage" ON public.servicos_documentos FOR ALL TO authenticated USING (public.can_manage_infrastructure(auth.uid())) WITH CHECK (public.can_manage_infrastructure(auth.uid()));

-- NUMERO AUTOMATICO
CREATE OR REPLACE FUNCTION public.gerar_numero_os()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*),0)+1 INTO v_seq FROM public.servicos_ordens;
  RETURN CONCAT('OS-', TO_CHAR(NOW(),'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END; $$;

CREATE OR REPLACE FUNCTION public.trg_servicos_ordens_numero()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.numero_os IS NULL OR NEW.numero_os = '' THEN
    NEW.numero_os := public.gerar_numero_os();
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS servicos_ordens_numero ON public.servicos_ordens;
CREATE TRIGGER servicos_ordens_numero BEFORE INSERT ON public.servicos_ordens FOR EACH ROW EXECUTE FUNCTION public.trg_servicos_ordens_numero();

CREATE OR REPLACE FUNCTION public.trg_servicos_ordens_historico()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.servicos_ordens_historico(ordem_id,tipo,titulo,descricao,user_id)
      VALUES (NEW.id,'criacao','Ordem de serviço criada', NEW.numero_os, auth.uid());
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.servicos_ordens_historico(ordem_id,tipo,titulo,descricao,user_id)
        VALUES (NEW.id,'mudanca_status','Mudança de situação',
                COALESCE(OLD.status::TEXT,'') || ' -> ' || COALESCE(NEW.status::TEXT,''), auth.uid());
    END IF;
    IF OLD.equipe_id IS DISTINCT FROM NEW.equipe_id THEN
      INSERT INTO public.servicos_ordens_historico(ordem_id,tipo,titulo,descricao,user_id)
        VALUES (NEW.id,'designacao','Equipe alterada', NEW.equipe_id::TEXT, auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS servicos_ordens_historico_trg ON public.servicos_ordens;
CREATE TRIGGER servicos_ordens_historico_trg AFTER INSERT OR UPDATE ON public.servicos_ordens FOR EACH ROW EXECUTE FUNCTION public.trg_servicos_ordens_historico();

-- UPDATED_AT
DROP TRIGGER IF EXISTS upd_servicos_tipos ON public.servicos_tipos;
CREATE TRIGGER upd_servicos_tipos BEFORE UPDATE ON public.servicos_tipos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_equipes ON public.servicos_equipes;
CREATE TRIGGER upd_servicos_equipes BEFORE UPDATE ON public.servicos_equipes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_equipamentos ON public.servicos_equipamentos;
CREATE TRIGGER upd_servicos_equipamentos BEFORE UPDATE ON public.servicos_equipamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_ordens ON public.servicos_ordens;
CREATE TRIGGER upd_servicos_ordens BEFORE UPDATE ON public.servicos_ordens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_execucoes ON public.servicos_ordens_execucoes;
CREATE TRIGGER upd_servicos_execucoes BEFORE UPDATE ON public.servicos_ordens_execucoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_materiais ON public.servicos_ordens_materiais;
CREATE TRIGGER upd_servicos_materiais BEFORE UPDATE ON public.servicos_ordens_materiais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS upd_servicos_documentos ON public.servicos_documentos;
CREATE TRIGGER upd_servicos_documentos BEFORE UPDATE ON public.servicos_documentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDITORIA GLOBAL
DROP TRIGGER IF EXISTS aud_servicos_ordens ON public.servicos_ordens;
CREATE TRIGGER aud_servicos_ordens AFTER INSERT OR UPDATE OR DELETE ON public.servicos_ordens FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
DROP TRIGGER IF EXISTS aud_servicos_equipes ON public.servicos_equipes;
CREATE TRIGGER aud_servicos_equipes AFTER INSERT OR UPDATE OR DELETE ON public.servicos_equipes FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
DROP TRIGGER IF EXISTS aud_servicos_equipamentos ON public.servicos_equipamentos;
CREATE TRIGGER aud_servicos_equipamentos AFTER INSERT OR UPDATE OR DELETE ON public.servicos_equipamentos FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_servicos_ordens_status ON public.servicos_ordens(status);
CREATE INDEX IF NOT EXISTS idx_servicos_ordens_equipe ON public.servicos_ordens(equipe_id);
CREATE INDEX IF NOT EXISTS idx_servicos_ordens_bairro ON public.servicos_ordens(bairro);
CREATE INDEX IF NOT EXISTS idx_servicos_documentos_entidade ON public.servicos_documentos(entidade, entidade_id);

-- SEED TIPOS
INSERT INTO public.servicos_tipos (nome, categoria, unidade_medida) VALUES
 ('Tapa-buraco','Pavimentação','m²'),
 ('Pavimentação','Pavimentação','m²'),
 ('Patrolamento','Estradas','km'),
 ('Cascalhamento','Estradas','m³'),
 ('Limpeza urbana','Limpeza','m²'),
 ('Capina','Limpeza','m²'),
 ('Poda de árvores','Áreas verdes','un'),
 ('Roçagem','Limpeza','m²'),
 ('Drenagem','Drenagem','m'),
 ('Rede pluvial','Drenagem','m'),
 ('Meio-fio','Pavimentação','m'),
 ('Calçadas','Pavimentação','m²'),
 ('Pintura','Predial','m²'),
 ('Iluminação pública','Iluminação','un'),
 ('Manutenção predial','Predial','un'),
 ('Reforma','Predial','un'),
 ('Limpeza de terrenos públicos','Limpeza','m²'),
 ('Coleta de entulho','Limpeza','m³'),
 ('Recuperação de pontes','Estradas','un'),
 ('Recuperação de estradas vicinais','Estradas','km'),
 ('Outros','Diversos','un')
ON CONFLICT (nome) DO NOTHING;