
CREATE OR REPLACE FUNCTION public.is_auditor(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_papel_sistemico(_user_id, 'auditor');
$$;

CREATE OR REPLACE FUNCTION public.can_manage_social(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_municipal(_user_id)
      OR public.is_secretario_assistencia_social(_user_id)
      OR public.has_social_role(_user_id, 'coordenador_cras')
      OR public.has_social_role(_user_id, 'coordenador_creas')
      OR public.has_social_role(_user_id, 'assistente_social')
      OR public.has_social_role(_user_id, 'psicologo_social')
      OR public.has_social_role(_user_id, 'gestor_beneficios');
$$;

CREATE OR REPLACE FUNCTION public.can_view_social(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.can_manage_social(_user_id)
      OR public.has_any_social_role(_user_id)
      OR public.is_auditor(_user_id);
$$;

DO $$ BEGIN CREATE TYPE public.status_beneficio_continuado AS ENUM ('ativo','suspenso','encerrado','cancelado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.periodicidade_beneficio AS ENUM ('mensal','bimestral','trimestral','semestral','anual','unica'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.status_paif AS ENUM ('ativo','suspenso','concluido'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.nivel_vulnerabilidade AS ENUM ('baixa','media','alta','muito_alta'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.status_plano_familiar AS ENUM ('em_elaboracao','ativo','suspenso','concluido','cancelado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.status_acao_plano AS ENUM ('pendente','em_andamento','concluida','cancelada'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.status_encaminhamento AS ENUM ('aberto','enviado','em_atendimento','concluido','sem_retorno','cancelado'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.destino_encaminhamento AS ENUM ('saude','educacao','cras','creas','conselho_tutelar','habitacao','emprego','juridico','outros'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.tipo_alerta_social AS ENUM ('familia_sem_acompanhamento','plano_vencido','beneficio_vencendo','documentacao_pendente','retorno_pendente','alta_vulnerabilidade','encaminhamento_sem_resposta'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.entidade_documento_social AS ENUM ('beneficio_eventual','beneficio_continuado','paif','paefi','plano_familiar','encaminhamento','familia'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.beneficios_continuados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  membro_id UUID REFERENCES public.membros_familia(id) ON DELETE SET NULL,
  programa TEXT NOT NULL,
  beneficio TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  valor NUMERIC(12,2) NOT NULL DEFAULT 0,
  periodicidade public.periodicidade_beneficio NOT NULL DEFAULT 'mensal',
  situacao public.status_beneficio_continuado NOT NULL DEFAULT 'ativo',
  observacoes TEXT,
  tecnico_responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.beneficios_continuados TO authenticated;
GRANT ALL ON public.beneficios_continuados TO service_role;
ALTER TABLE public.beneficios_continuados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_bc" ON public.beneficios_continuados FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_bc" ON public.beneficios_continuados FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_bc_updated BEFORE UPDATE ON public.beneficios_continuados FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.documentos_sociais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo public.entidade_documento_social NOT NULL,
  entidade_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  tamanho_bytes BIGINT,
  categoria TEXT,
  familia_id UUID REFERENCES public.familias_cadunico(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_docs_sociais_entidade ON public.documentos_sociais(entidade_tipo, entidade_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_sociais TO authenticated;
GRANT ALL ON public.documentos_sociais TO service_role;
ALTER TABLE public.documentos_sociais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_ds" ON public.documentos_sociais FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_ds" ON public.documentos_sociais FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_ds_updated BEFORE UPDATE ON public.documentos_sociais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.paif_acompanhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  tecnico_responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_encerramento DATE,
  objetivos TEXT,
  situacao public.status_paif NOT NULL DEFAULT 'ativo',
  motivo_encerramento TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paif_acompanhamentos TO authenticated;
GRANT ALL ON public.paif_acompanhamentos TO service_role;
ALTER TABLE public.paif_acompanhamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_paif" ON public.paif_acompanhamentos FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_paif" ON public.paif_acompanhamentos FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_paif_updated BEFORE UPDATE ON public.paif_acompanhamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.paif_evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paif_id UUID NOT NULL REFERENCES public.paif_acompanhamentos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paif_evolucoes TO authenticated;
GRANT ALL ON public.paif_evolucoes TO service_role;
ALTER TABLE public.paif_evolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_paif_ev" ON public.paif_evolucoes FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_paif_ev" ON public.paif_evolucoes FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_paif_ev_updated BEFORE UPDATE ON public.paif_evolucoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.paefi_acompanhamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  tecnico_responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  motivo TEXT NOT NULL,
  tipo_violacao TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_encerramento DATE,
  encaminhamentos TEXT,
  situacao public.status_paif NOT NULL DEFAULT 'ativo',
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paefi_acompanhamentos TO authenticated;
GRANT ALL ON public.paefi_acompanhamentos TO service_role;
ALTER TABLE public.paefi_acompanhamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_paefi" ON public.paefi_acompanhamentos FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_paefi" ON public.paefi_acompanhamentos FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_paefi_updated BEFORE UPDATE ON public.paefi_acompanhamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.paefi_evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paefi_id UUID NOT NULL REFERENCES public.paefi_acompanhamentos(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.paefi_evolucoes TO authenticated;
GRANT ALL ON public.paefi_evolucoes TO service_role;
ALTER TABLE public.paefi_evolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_paefi_ev" ON public.paefi_evolucoes FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_paefi_ev" ON public.paefi_evolucoes FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_paefi_ev_updated BEFORE UPDATE ON public.paefi_evolucoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vulnerabilidade_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  criterio_renda INT NOT NULL DEFAULT 0,
  criterio_desemprego INT NOT NULL DEFAULT 0,
  criterio_moradia INT NOT NULL DEFAULT 0,
  criterio_deficiencia INT NOT NULL DEFAULT 0,
  criterio_idoso INT NOT NULL DEFAULT 0,
  criterio_gestante INT NOT NULL DEFAULT 0,
  criterio_crianca INT NOT NULL DEFAULT 0,
  criterio_violencia INT NOT NULL DEFAULT 0,
  criterio_abandono INT NOT NULL DEFAULT 0,
  criterio_dependencia_quimica INT NOT NULL DEFAULT 0,
  pontuacao_total INT NOT NULL DEFAULT 0,
  nivel_calculado public.nivel_vulnerabilidade NOT NULL DEFAULT 'baixa',
  nivel_manual public.nivel_vulnerabilidade,
  justificativa_manual TEXT,
  observacoes TEXT,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vulnerabilidade_avaliacoes TO authenticated;
GRANT ALL ON public.vulnerabilidade_avaliacoes TO service_role;
ALTER TABLE public.vulnerabilidade_avaliacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_vuln" ON public.vulnerabilidade_avaliacoes FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_vuln" ON public.vulnerabilidade_avaliacoes FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_vuln_updated BEFORE UPDATE ON public.vulnerabilidade_avaliacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.trg_vulnerabilidade_calc()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_total INT;
BEGIN
  v_total := COALESCE(NEW.criterio_renda,0)+COALESCE(NEW.criterio_desemprego,0)+COALESCE(NEW.criterio_moradia,0)
    +COALESCE(NEW.criterio_deficiencia,0)+COALESCE(NEW.criterio_idoso,0)+COALESCE(NEW.criterio_gestante,0)
    +COALESCE(NEW.criterio_crianca,0)+COALESCE(NEW.criterio_violencia,0)+COALESCE(NEW.criterio_abandono,0)
    +COALESCE(NEW.criterio_dependencia_quimica,0);
  NEW.pontuacao_total := v_total;
  NEW.nivel_calculado := CASE
    WHEN v_total >= 25 THEN 'muito_alta'::public.nivel_vulnerabilidade
    WHEN v_total >= 15 THEN 'alta'::public.nivel_vulnerabilidade
    WHEN v_total >= 7 THEN 'media'::public.nivel_vulnerabilidade
    ELSE 'baixa'::public.nivel_vulnerabilidade END;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_vuln_calc BEFORE INSERT OR UPDATE ON public.vulnerabilidade_avaliacoes
FOR EACH ROW EXECUTE FUNCTION public.trg_vulnerabilidade_calc();

CREATE TABLE public.planos_acompanhamento_familiar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  tecnico_responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  objetivos TEXT,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_prevista_fim DATE,
  data_conclusao DATE,
  resultados TEXT,
  situacao public.status_plano_familiar NOT NULL DEFAULT 'em_elaboracao',
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planos_acompanhamento_familiar TO authenticated;
GRANT ALL ON public.planos_acompanhamento_familiar TO service_role;
ALTER TABLE public.planos_acompanhamento_familiar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_pl" ON public.planos_acompanhamento_familiar FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_pl" ON public.planos_acompanhamento_familiar FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_pl_updated BEFORE UPDATE ON public.planos_acompanhamento_familiar FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.plano_familiar_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES public.planos_acompanhamento_familiar(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  meta TEXT,
  responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  prazo DATE,
  status public.status_acao_plano NOT NULL DEFAULT 'pendente',
  resultado TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plano_familiar_acoes TO authenticated;
GRANT ALL ON public.plano_familiar_acoes TO service_role;
ALTER TABLE public.plano_familiar_acoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_pl_ac" ON public.plano_familiar_acoes FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_pl_ac" ON public.plano_familiar_acoes FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_pl_ac_updated BEFORE UPDATE ON public.plano_familiar_acoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.plano_familiar_evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES public.planos_acompanhamento_familiar(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  tecnico_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.plano_familiar_evolucoes TO authenticated;
GRANT ALL ON public.plano_familiar_evolucoes TO service_role;
ALTER TABLE public.plano_familiar_evolucoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_pl_ev" ON public.plano_familiar_evolucoes FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_pl_ev" ON public.plano_familiar_evolucoes FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_pl_ev_updated BEFORE UPDATE ON public.plano_familiar_evolucoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.gerar_protocolo_encaminhamento_social()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_seq INT;
BEGIN
  SELECT COALESCE(COUNT(*),0)+1 INTO v_seq FROM public.encaminhamentos_sociais;
  RETURN CONCAT('ENC-SOC-', TO_CHAR(NOW(),'YYYY'),'-',LPAD(v_seq::TEXT,5,'0'));
END; $$;

CREATE TABLE public.encaminhamentos_sociais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT UNIQUE NOT NULL DEFAULT public.gerar_protocolo_encaminhamento_social(),
  familia_id UUID REFERENCES public.familias_cadunico(id) ON DELETE SET NULL,
  membro_id UUID REFERENCES public.membros_familia(id) ON DELETE SET NULL,
  destino public.destino_encaminhamento NOT NULL,
  destino_detalhe TEXT,
  motivo TEXT NOT NULL,
  data_encaminhamento DATE NOT NULL DEFAULT CURRENT_DATE,
  responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.status_encaminhamento NOT NULL DEFAULT 'aberto',
  data_retorno DATE,
  retorno TEXT,
  observacoes TEXT,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encaminhamentos_sociais TO authenticated;
GRANT ALL ON public.encaminhamentos_sociais TO service_role;
ALTER TABLE public.encaminhamentos_sociais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_enc" ON public.encaminhamentos_sociais FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_enc" ON public.encaminhamentos_sociais FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_enc_updated BEFORE UPDATE ON public.encaminhamentos_sociais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.encaminhamentos_sociais_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encaminhamento_id UUID NOT NULL REFERENCES public.encaminhamentos_sociais(id) ON DELETE CASCADE,
  status_anterior public.status_encaminhamento,
  status_novo public.status_encaminhamento NOT NULL,
  observacao TEXT,
  autor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.encaminhamentos_sociais_historico TO authenticated;
GRANT ALL ON public.encaminhamentos_sociais_historico TO service_role;
ALTER TABLE public.encaminhamentos_sociais_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_eh" ON public.encaminhamentos_sociais_historico FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "ins_eh" ON public.encaminhamentos_sociais_historico FOR INSERT TO authenticated WITH CHECK (public.can_manage_social(auth.uid()));

CREATE OR REPLACE FUNCTION public.trg_encaminhamento_historico()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.encaminhamentos_sociais_historico(encaminhamento_id,status_anterior,status_novo,autor_id)
    VALUES (NEW.id, NULL, NEW.status, NEW.created_by);
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.encaminhamentos_sociais_historico(encaminhamento_id,status_anterior,status_novo,autor_id)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_enc_hist AFTER INSERT OR UPDATE ON public.encaminhamentos_sociais
FOR EACH ROW EXECUTE FUNCTION public.trg_encaminhamento_historico();

CREATE TABLE public.alertas_sociais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo public.tipo_alerta_social NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  familia_id UUID REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  entidade_tipo TEXT,
  entidade_id UUID,
  severidade TEXT NOT NULL DEFAULT 'media',
  resolvido BOOLEAN NOT NULL DEFAULT false,
  resolvido_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolvido_em TIMESTAMPTZ,
  observacao_resolucao TEXT,
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id) ON DELETE SET NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas_sociais TO authenticated;
GRANT ALL ON public.alertas_sociais TO service_role;
ALTER TABLE public.alertas_sociais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ver_al" ON public.alertas_sociais FOR SELECT TO authenticated USING (public.can_view_social(auth.uid()));
CREATE POLICY "gerir_al" ON public.alertas_sociais FOR ALL TO authenticated USING (public.can_manage_social(auth.uid())) WITH CHECK (public.can_manage_social(auth.uid()));
CREATE TRIGGER trg_al_updated BEFORE UPDATE ON public.alertas_sociais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
