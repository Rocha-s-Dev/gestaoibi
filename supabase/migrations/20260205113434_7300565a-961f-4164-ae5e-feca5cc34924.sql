
-- =============================================
-- MÓDULO DO PREFEITO - TABELAS E RLS
-- =============================================

-- 1. METAS DO PLANO DE GOVERNO
CREATE TABLE IF NOT EXISTS public.metas_plano_governo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  area TEXT NOT NULL,
  secretaria_responsavel_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  indicador_nome TEXT,
  indicador_unidade TEXT,
  meta_valor NUMERIC,
  valor_atual NUMERIC DEFAULT 0,
  valor_inicial NUMERIC DEFAULT 0,
  orcamento_previsto NUMERIC DEFAULT 0,
  orcamento_executado NUMERIC DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  prazo_alerta_dias INTEGER DEFAULT 30,
  status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'atrasada', 'concluida', 'cancelada')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('critica', 'alta', 'media', 'baixa')),
  ultima_atualizacao DATE,
  proxima_atualizacao DATE,
  justificativa_desvio TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.historico_metas_governo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_id UUID NOT NULL REFERENCES public.metas_plano_governo(id) ON DELETE CASCADE,
  data_atualizacao DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_anterior NUMERIC,
  valor_novo NUMERIC,
  orcamento_executado_anterior NUMERIC,
  orcamento_executado_novo NUMERIC,
  observacoes TEXT,
  justificativa TEXT,
  responsavel_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. AGENDA GOVERNAMENTAL
CREATE TABLE IF NOT EXISTS public.agenda_governamental (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('reuniao', 'evento', 'visita', 'cerimonia', 'entrevista', 'audiencia', 'outro')),
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  local TEXT,
  endereco TEXT,
  participantes JSONB DEFAULT '[]',
  secretarias_envolvidas UUID[] DEFAULT '{}',
  documentos_apoio JSONB DEFAULT '[]',
  pauta TEXT,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'adiado')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('critica', 'alta', 'media', 'baixa')),
  publico BOOLEAN DEFAULT false,
  decisoes_tomadas TEXT,
  encaminhamentos JSONB DEFAULT '[]',
  conflito_detectado BOOLEAN DEFAULT false,
  conflito_descricao TEXT,
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. OBRAS PRIORITÁRIAS
CREATE TABLE IF NOT EXISTS public.obras_prioritarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  localizacao TEXT,
  obra_referencia_id UUID,
  contrato_id UUID REFERENCES public.contracts(id),
  secretaria_responsavel_id UUID REFERENCES public.secretarias(id),
  meta_governo_id UUID,
  municipio_id UUID REFERENCES public.municipios(id),
  data_inicio_prevista DATE,
  data_fim_prevista DATE,
  data_inicio_real DATE,
  data_fim_real DATE,
  percentual_fisico NUMERIC DEFAULT 0,
  percentual_financeiro NUMERIC DEFAULT 0,
  valor_total NUMERIC DEFAULT 0,
  valor_executado NUMERIC DEFAULT 0,
  fonte_recurso TEXT,
  status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_licitacao', 'em_execucao', 'paralisada', 'concluida', 'cancelada')),
  prioridade TEXT DEFAULT 'alta' CHECK (prioridade IN ('critica', 'alta', 'media')),
  destaque BOOLEAN DEFAULT false,
  alerta_atraso BOOLEAN DEFAULT false,
  dias_atraso INTEGER DEFAULT 0,
  justificativa_atraso TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.acompanhamento_obras_prioritarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_prioritaria_id UUID NOT NULL REFERENCES public.obras_prioritarias(id) ON DELETE CASCADE,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  percentual_fisico NUMERIC,
  percentual_financeiro NUMERIC,
  valor_medicao NUMERIC,
  fotos JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  documentos JSONB DEFAULT '[]',
  descricao_progresso TEXT,
  problemas_identificados TEXT,
  providencias_tomadas TEXT,
  responsavel_registro_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ATOS ADMINISTRATIVOS
CREATE TABLE IF NOT EXISTS public.atos_administrativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('decreto', 'portaria', 'lei', 'resolucao', 'instrucao_normativa', 'sancao', 'veto', 'outro')),
  titulo TEXT NOT NULL,
  ementa TEXT,
  conteudo TEXT NOT NULL,
  fundamentacao_legal TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_analise_juridica', 'aprovado_juridico', 'aguardando_assinatura', 'assinado', 'publicado', 'revogado')),
  analise_juridica_id UUID REFERENCES public.analises_juridicas_contratos(id),
  parecer_juridico TEXT,
  data_parecer DATE,
  aprovado_juridico BOOLEAN,
  assinatura_digital TEXT,
  data_assinatura TIMESTAMPTZ,
  assinante_id UUID REFERENCES auth.users(id),
  data_publicacao DATE,
  diario_oficial_edicao TEXT,
  diario_oficial_pagina TEXT,
  url_publicacao TEXT,
  data_vigencia_inicio DATE,
  data_vigencia_fim DATE,
  revogado BOOLEAN DEFAULT false,
  ato_revogador_id UUID,
  versao INTEGER DEFAULT 1,
  versao_anterior_id UUID,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_origem_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. COMUNICAÇÃO INSTITUCIONAL
CREATE TABLE IF NOT EXISTS public.comunicacoes_institucionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('discurso', 'pronunciamento', 'release', 'nota_oficial', 'post_rede_social', 'entrevista', 'comunicado')),
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  resumo TEXT,
  palavras_chave TEXT[],
  canal TEXT,
  veiculo TEXT,
  rede_social TEXT,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_revisao', 'aprovado', 'publicado', 'arquivado')),
  data_evento DATE,
  data_publicacao TIMESTAMPTZ,
  anexos JSONB DEFAULT '[]',
  alcance INTEGER,
  engajamento INTEGER,
  sentimento TEXT CHECK (sentimento IN ('positivo', 'neutro', 'negativo')),
  repercussao TEXT,
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- 6. ALERTAS EXECUTIVOS
CREATE TABLE IF NOT EXISTS public.alertas_executivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('financeiro', 'juridico', 'operacional', 'politico', 'urgente')),
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('critico', 'alto', 'medio', 'baixo')),
  modulo_origem TEXT,
  entidade_origem TEXT,
  entidade_id UUID,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'em_analise', 'resolvido', 'ignorado')),
  data_resolucao TIMESTAMPTZ,
  resolucao TEXT,
  resolvido_por UUID REFERENCES auth.users(id),
  dados_adicionais JSONB,
  acao_sugerida TEXT,
  prazo_acao DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. RELATÓRIOS EXECUTIVOS
CREATE TABLE IF NOT EXISTS public.relatorios_executivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('mensal', 'trimestral', 'semestral', 'anual', 'especial', 'camara', 'tce')),
  titulo TEXT NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  sumario_executivo TEXT,
  conteudo JSONB,
  indicadores JSONB,
  status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_elaboracao', 'em_revisao', 'aprovado', 'publicado')),
  assinado BOOLEAN DEFAULT false,
  data_assinatura TIMESTAMPTZ,
  assinatura_hash TEXT,
  arquivo_url TEXT,
  arquivo_hash TEXT,
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- FUNÇÃO DE ACESSO AO GABINETE
CREATE OR REPLACE FUNCTION public.has_gabinete_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.papeis_usuario
    WHERE user_id = _user_id
      AND papel IN ('admin_municipal', 'prefeito', 'vice_prefeito', 'assessor_gabinete')
      AND is_active = true
      AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  )
$$;

-- RLS
ALTER TABLE public.metas_plano_governo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_metas_governo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_governamental ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras_prioritarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.acompanhamento_obras_prioritarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atos_administrativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comunicacoes_institucionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_executivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_executivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gabinete_metas" ON public.metas_plano_governo FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_historico" ON public.historico_metas_governo FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_agenda" ON public.agenda_governamental FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_obras" ON public.obras_prioritarias FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_acompanhamento" ON public.acompanhamento_obras_prioritarias FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_atos" ON public.atos_administrativos FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_comunicacoes" ON public.comunicacoes_institucionais FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_alertas" ON public.alertas_executivos FOR ALL USING (has_gabinete_access(auth.uid()));
CREATE POLICY "gabinete_relatorios" ON public.relatorios_executivos FOR ALL USING (has_gabinete_access(auth.uid()));

-- INDEXES
CREATE INDEX idx_metas_governo_status ON public.metas_plano_governo(status);
CREATE INDEX idx_metas_governo_secretaria ON public.metas_plano_governo(secretaria_responsavel_id);
CREATE INDEX idx_agenda_data ON public.agenda_governamental(data_inicio);
CREATE INDEX idx_obras_prioritarias_status ON public.obras_prioritarias(status);
CREATE INDEX idx_atos_tipo ON public.atos_administrativos(tipo);
CREATE INDEX idx_atos_status ON public.atos_administrativos(status);
CREATE INDEX idx_alertas_prioridade ON public.alertas_executivos(prioridade);
CREATE INDEX idx_alertas_status ON public.alertas_executivos(status);

-- TRIGGERS
CREATE TRIGGER update_metas_plano_governo_updated_at BEFORE UPDATE ON public.metas_plano_governo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agenda_governamental_updated_at BEFORE UPDATE ON public.agenda_governamental FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_obras_prioritarias_updated_at BEFORE UPDATE ON public.obras_prioritarias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_atos_administrativos_updated_at BEFORE UPDATE ON public.atos_administrativos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comunicacoes_institucionais_updated_at BEFORE UPDATE ON public.comunicacoes_institucionais FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alertas_executivos_updated_at BEFORE UPDATE ON public.alertas_executivos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relatorios_executivos_updated_at BEFORE UPDATE ON public.relatorios_executivos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
