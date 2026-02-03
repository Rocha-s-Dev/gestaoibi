-- =====================================================
-- MÓDULO: CONTROLADORIA / JURÍDICO ADMINISTRATIVO
-- =====================================================

-- 1.1 Processos Administrativos Internos
CREATE TABLE public.processos_administrativos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_processo VARCHAR(50) NOT NULL UNIQUE,
    protocolo_id UUID,
    tipo VARCHAR(100) NOT NULL,
    assunto TEXT NOT NULL,
    descricao TEXT,
    partes_envolvidas JSONB DEFAULT '[]',
    relator_id UUID REFERENCES public.profiles(id),
    relator_nome VARCHAR(255),
    secretaria_origem_id UUID REFERENCES public.secretarias(id),
    municipio_id UUID REFERENCES public.municipios(id),
    data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prazo DATE,
    prazo_dias INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'em_andamento',
    prioridade VARCHAR(20) DEFAULT 'normal',
    fundamentacao_legal TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Movimentações/Despachos do Processo
CREATE TABLE public.movimentacoes_processo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    processo_id UUID NOT NULL REFERENCES public.processos_administrativos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    responsavel_id UUID REFERENCES public.profiles(id),
    responsavel_nome VARCHAR(255),
    data_movimentacao TIMESTAMPTZ DEFAULT now(),
    prazo_resposta DATE,
    documento_anexo TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Decisões e Recursos
CREATE TABLE public.decisoes_processo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    processo_id UUID NOT NULL REFERENCES public.processos_administrativos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    numero_decisao VARCHAR(50),
    ementa TEXT,
    fundamentacao TEXT NOT NULL,
    dispositivo TEXT NOT NULL,
    relator_id UUID REFERENCES public.profiles(id),
    data_decisao DATE NOT NULL,
    publicada BOOLEAN DEFAULT false,
    data_publicacao DATE,
    permite_recurso BOOLEAN DEFAULT true,
    prazo_recurso_dias INTEGER DEFAULT 15,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Análise Jurídica de Contratos
CREATE TABLE public.analises_juridicas_contratos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES public.contracts(id),
    licitacao_numero VARCHAR(100),
    tipo_analise VARCHAR(50) NOT NULL,
    numero_parecer VARCHAR(50),
    objeto TEXT NOT NULL,
    valor_contrato NUMERIC(15,2),
    clausulas_analisadas JSONB DEFAULT '[]',
    riscos_identificados JSONB DEFAULT '[]',
    parecer_conclusivo TEXT NOT NULL,
    recomendacao VARCHAR(50),
    advogado_responsavel_id UUID REFERENCES public.profiles(id),
    advogado_nome VARCHAR(255),
    secretaria_solicitante_id UUID REFERENCES public.secretarias(id),
    municipio_id UUID REFERENCES public.municipios(id),
    data_solicitacao DATE NOT NULL,
    data_parecer DATE,
    prazo_resposta DATE,
    status VARCHAR(50) DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Controle de Vigência e Aditivos
CREATE TABLE public.alertas_vigencia_contratos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contrato_id UUID REFERENCES public.contracts(id),
    analise_id UUID REFERENCES public.analises_juridicas_contratos(id),
    tipo_alerta VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    data_referencia DATE NOT NULL,
    dias_antecedencia INTEGER DEFAULT 30,
    status VARCHAR(50) DEFAULT 'pendente',
    resolvido_por UUID REFERENCES public.profiles(id),
    data_resolucao TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3 Consultoria Jurídica às Secretarias
CREATE TABLE public.consultas_juridicas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_consulta VARCHAR(50) NOT NULL UNIQUE,
    secretaria_solicitante_id UUID REFERENCES public.secretarias(id),
    solicitante_id UUID REFERENCES public.profiles(id),
    solicitante_nome VARCHAR(255),
    assunto TEXT NOT NULL,
    descricao_consulta TEXT NOT NULL,
    tipo_consulta VARCHAR(100),
    prioridade VARCHAR(20) DEFAULT 'normal',
    prazo_resposta DATE,
    advogado_designado_id UUID REFERENCES public.profiles(id),
    advogado_nome VARCHAR(255),
    municipio_id UUID REFERENCES public.municipios(id),
    status VARCHAR(50) DEFAULT 'pendente',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pareceres Jurídicos
CREATE TABLE public.pareceres_juridicos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    consulta_id UUID REFERENCES public.consultas_juridicas(id),
    processo_id UUID REFERENCES public.processos_administrativos(id),
    numero_parecer VARCHAR(50) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    ementa TEXT,
    fundamentacao_legal TEXT NOT NULL,
    conclusao TEXT NOT NULL,
    advogado_id UUID REFERENCES public.profiles(id),
    advogado_nome VARCHAR(255),
    revisor_id UUID REFERENCES public.profiles(id),
    data_parecer DATE NOT NULL,
    reutilizavel BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]',
    secretaria_id UUID REFERENCES public.secretarias(id),
    municipio_id UUID REFERENCES public.municipios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Banco de Pareceres Reutilizáveis (Modelos)
CREATE TABLE public.modelos_parecer (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    categoria VARCHAR(100),
    ementa_modelo TEXT,
    fundamentacao_modelo TEXT NOT NULL,
    conclusao_modelo TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT true,
    criado_por UUID REFERENCES public.profiles(id),
    municipio_id UUID REFERENCES public.municipios(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.processos_administrativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisoes_processo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_juridicas_contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_vigencia_contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_juridicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pareceres_juridicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modelos_parecer ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view processos_administrativos"
    ON public.processos_administrativos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage processos_administrativos"
    ON public.processos_administrativos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view movimentacoes_processo"
    ON public.movimentacoes_processo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage movimentacoes_processo"
    ON public.movimentacoes_processo FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view decisoes_processo"
    ON public.decisoes_processo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage decisoes_processo"
    ON public.decisoes_processo FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view analises_juridicas_contratos"
    ON public.analises_juridicas_contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage analises_juridicas_contratos"
    ON public.analises_juridicas_contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view alertas_vigencia_contratos"
    ON public.alertas_vigencia_contratos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage alertas_vigencia_contratos"
    ON public.alertas_vigencia_contratos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view consultas_juridicas"
    ON public.consultas_juridicas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage consultas_juridicas"
    ON public.consultas_juridicas FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view pareceres_juridicos"
    ON public.pareceres_juridicos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage pareceres_juridicos"
    ON public.pareceres_juridicos FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can view modelos_parecer"
    ON public.modelos_parecer FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage modelos_parecer"
    ON public.modelos_parecer FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Índices
CREATE INDEX idx_processos_administrativos_status ON public.processos_administrativos(status);
CREATE INDEX idx_processos_administrativos_secretaria ON public.processos_administrativos(secretaria_origem_id);
CREATE INDEX idx_consultas_juridicas_status ON public.consultas_juridicas(status);
CREATE INDEX idx_consultas_juridicas_secretaria ON public.consultas_juridicas(secretaria_solicitante_id);
CREATE INDEX idx_pareceres_juridicos_consulta ON public.pareceres_juridicos(consulta_id);
CREATE INDEX idx_analises_juridicas_contrato ON public.analises_juridicas_contratos(contrato_id);

-- Triggers
CREATE TRIGGER update_processos_administrativos_updated_at
    BEFORE UPDATE ON public.processos_administrativos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analises_juridicas_contratos_updated_at
    BEFORE UPDATE ON public.analises_juridicas_contratos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultas_juridicas_updated_at
    BEFORE UPDATE ON public.consultas_juridicas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modelos_parecer_updated_at
    BEFORE UPDATE ON public.modelos_parecer
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();