-- =====================================================
-- MÓDULO 1: SISTEMA DE ALERTAS EDUCACIONAIS
-- =====================================================

-- Enum para tipos de alerta
CREATE TYPE public.tipo_alerta_educacional AS ENUM ('faltas_excessivas', 'nota_baixa', 'risco_reprovacao', 'evasao');
CREATE TYPE public.nivel_alerta AS ENUM ('info', 'warning', 'critical');

-- Tabela de configurações de alertas
CREATE TABLE public.configuracoes_alertas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    percentual_faltas_warning integer NOT NULL DEFAULT 15,
    percentual_faltas_critical integer NOT NULL DEFAULT 25,
    nota_minima numeric(4,2) NOT NULL DEFAULT 6.0,
    dias_sem_frequencia_evasao integer NOT NULL DEFAULT 30,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de alertas educacionais
CREATE TABLE public.alertas_educacionais (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo tipo_alerta_educacional NOT NULL,
    nivel nivel_alerta NOT NULL DEFAULT 'warning',
    mensagem text NOT NULL,
    dados_adicionais jsonb,
    lido boolean DEFAULT false,
    resolvido boolean DEFAULT false,
    data_resolucao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS para alertas
ALTER TABLE public.alertas_educacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view alertas" ON public.alertas_educacionais
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert alertas" ON public.alertas_educacionais
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update alertas" ON public.alertas_educacionais
    FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete alertas" ON public.alertas_educacionais
    FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view configuracoes" ON public.configuracoes_alertas
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update configuracoes" ON public.configuracoes_alertas
    FOR UPDATE USING (true);

-- Inserir configuração padrão
INSERT INTO public.configuracoes_alertas (percentual_faltas_warning, percentual_faltas_critical, nota_minima, dias_sem_frequencia_evasao)
VALUES (15, 25, 6.0, 30);

-- =====================================================
-- MÓDULO 3: PORTAL DO RESPONSÁVEL
-- =====================================================

-- Tabela para vincular usuários auth a responsáveis
CREATE TABLE public.usuarios_responsaveis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    responsavel_id uuid NOT NULL REFERENCES public.responsaveis(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, responsavel_id)
);

-- Tabela de justificativas de faltas
CREATE TABLE public.justificativas_faltas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    falta_id uuid NOT NULL REFERENCES public.faltas(id) ON DELETE CASCADE,
    responsavel_id uuid NOT NULL REFERENCES public.responsaveis(id) ON DELETE CASCADE,
    motivo text NOT NULL,
    documento_url text,
    status varchar(20) DEFAULT 'pendente',
    data_analise timestamp with time zone,
    observacao_analise text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.usuarios_responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justificativas_faltas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view usuarios_responsaveis" ON public.usuarios_responsaveis
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert usuarios_responsaveis" ON public.usuarios_responsaveis
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can delete usuarios_responsaveis" ON public.usuarios_responsaveis
    FOR DELETE USING (true);

CREATE POLICY "Authenticated users can view justificativas" ON public.justificativas_faltas
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert justificativas" ON public.justificativas_faltas
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update justificativas" ON public.justificativas_faltas
    FOR UPDATE USING (true);

-- =====================================================
-- MÓDULO 4: SISTEMA DE MATRÍCULA ONLINE
-- =====================================================

CREATE TYPE public.status_solicitacao_matricula AS ENUM ('pendente', 'em_analise', 'aprovada', 'rejeitada', 'lista_espera');

CREATE TABLE public.solicitacoes_matricula (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    protocolo varchar(20) NOT NULL UNIQUE,
    status status_solicitacao_matricula DEFAULT 'pendente',
    dados_aluno jsonb NOT NULL,
    dados_responsavel jsonb NOT NULL,
    escola_preferida_id uuid REFERENCES public.escolas(id),
    turma_sugerida_id uuid REFERENCES public.turmas(id),
    ano_letivo integer NOT NULL,
    serie_pretendida varchar(50) NOT NULL,
    documentos jsonb,
    observacoes text,
    motivo_rejeicao text,
    aluno_criado_id uuid REFERENCES public.alunos(id),
    data_processamento timestamp with time zone,
    processado_por uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.documentos_matricula (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    solicitacao_id uuid NOT NULL REFERENCES public.solicitacoes_matricula(id) ON DELETE CASCADE,
    tipo_documento varchar(100) NOT NULL,
    nome_arquivo varchar(255) NOT NULL,
    arquivo_url text NOT NULL,
    validado boolean DEFAULT false,
    observacao text,
    created_at timestamp with time zone DEFAULT now()
);

-- RLS
ALTER TABLE public.solicitacoes_matricula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos_matricula ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert solicitacoes" ON public.solicitacoes_matricula
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view solicitacoes" ON public.solicitacoes_matricula
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update solicitacoes" ON public.solicitacoes_matricula
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert documentos" ON public.documentos_matricula
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view documentos" ON public.documentos_matricula
    FOR SELECT USING (true);
CREATE POLICY "Authenticated users can update documentos" ON public.documentos_matricula
    FOR UPDATE USING (true);

-- Função para gerar protocolo de matrícula
CREATE OR REPLACE FUNCTION public.gerar_protocolo_matricula()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    ano text;
    sequencial integer;
    protocolo text;
BEGIN
    ano := to_char(now(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(protocolo FROM 6) AS integer)), 0) + 1
    INTO sequencial
    FROM public.solicitacoes_matricula
    WHERE protocolo LIKE 'MAT' || ano || '%';
    
    protocolo := 'MAT' || ano || LPAD(sequencial::text, 6, '0');
    RETURN protocolo;
END;
$$;

-- =====================================================
-- MÓDULO 5: TRANSPORTE ESCOLAR
-- =====================================================

CREATE TYPE public.status_rota AS ENUM ('ativa', 'inativa', 'em_manutencao');
CREATE TYPE public.status_veiculo AS ENUM ('disponivel', 'em_uso', 'manutencao', 'inativo');

CREATE TABLE public.rotas_transporte (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome varchar(100) NOT NULL,
    descricao text,
    pontos_parada jsonb,
    horario_inicio time,
    horario_fim time,
    km_estimado numeric(10,2),
    status status_rota DEFAULT 'ativa',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.veiculos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    placa varchar(10) NOT NULL UNIQUE,
    modelo varchar(100) NOT NULL,
    ano integer,
    capacidade integer NOT NULL,
    motorista_nome varchar(255),
    motorista_cnh varchar(20),
    motorista_telefone varchar(20),
    status status_veiculo DEFAULT 'disponivel',
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.alunos_rotas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    rota_id uuid NOT NULL REFERENCES public.rotas_transporte(id) ON DELETE CASCADE,
    veiculo_id uuid REFERENCES public.veiculos(id),
    ponto_embarque varchar(255),
    ponto_desembarque varchar(255),
    horario_embarque time,
    turno varchar(20),
    ativo boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(aluno_id, rota_id, turno)
);

-- RLS Transporte
ALTER TABLE public.rotas_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alunos_rotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage rotas" ON public.rotas_transporte FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage veiculos" ON public.veiculos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage alunos_rotas" ON public.alunos_rotas FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- MÓDULO 5: MERENDA ESCOLAR
-- =====================================================

CREATE TYPE public.tipo_refeicao AS ENUM ('cafe_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar');

CREATE TABLE public.cardapios (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id uuid REFERENCES public.escolas(id) ON DELETE CASCADE,
    data date NOT NULL,
    refeicao tipo_refeicao NOT NULL,
    itens jsonb NOT NULL,
    calorias_estimadas integer,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.estoque_alimentos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    escola_id uuid REFERENCES public.escolas(id) ON DELETE CASCADE,
    item varchar(255) NOT NULL,
    quantidade numeric(10,2) NOT NULL,
    unidade varchar(20) NOT NULL,
    data_validade date,
    fornecedor varchar(255),
    lote varchar(50),
    preco_unitario numeric(10,2),
    estoque_minimo numeric(10,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.restricoes_alimentares (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo_restricao varchar(100) NOT NULL,
    descricao text,
    alimentos_proibidos jsonb,
    orientacoes_medicas text,
    documento_medico_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS Merenda
ALTER TABLE public.cardapios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque_alimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricoes_alimentares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage cardapios" ON public.cardapios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage estoque" ON public.estoque_alimentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage restricoes" ON public.restricoes_alimentares FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- MÓDULO 6: HISTÓRICO ESCOLAR E TRANSFERÊNCIAS
-- =====================================================

CREATE TYPE public.situacao_ano_letivo AS ENUM ('aprovado', 'reprovado', 'transferido', 'em_curso', 'evadido');
CREATE TYPE public.status_transferencia AS ENUM ('solicitada', 'em_analise', 'aprovada', 'rejeitada', 'cancelada', 'concluida');
CREATE TYPE public.tipo_transferencia AS ENUM ('interna_turma', 'interna_escola', 'externa_entrada', 'externa_saida');

CREATE TABLE public.historico_escolar (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    ano_letivo integer NOT NULL,
    serie varchar(50) NOT NULL,
    turma_nome varchar(100),
    escola_nome varchar(255) NOT NULL,
    escola_id uuid REFERENCES public.escolas(id),
    notas_finais jsonb,
    media_geral numeric(4,2),
    total_faltas integer DEFAULT 0,
    percentual_frequencia numeric(5,2),
    situacao situacao_ano_letivo NOT NULL,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(aluno_id, ano_letivo)
);

CREATE TABLE public.transferencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aluno_id uuid NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
    tipo tipo_transferencia NOT NULL,
    escola_origem_id uuid REFERENCES public.escolas(id),
    escola_destino_id uuid REFERENCES public.escolas(id),
    turma_origem_id uuid REFERENCES public.turmas(id),
    turma_destino_id uuid REFERENCES public.turmas(id),
    escola_externa_origem varchar(255),
    escola_externa_destino varchar(255),
    motivo text,
    status status_transferencia DEFAULT 'solicitada',
    data_solicitacao timestamp with time zone DEFAULT now(),
    data_efetivacao timestamp with time zone,
    solicitado_por uuid,
    aprovado_por uuid,
    documentos_gerados jsonb,
    observacoes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- RLS Histórico e Transferências
ALTER TABLE public.historico_escolar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transferencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage historico" ON public.historico_escolar FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can manage transferencias" ON public.transferencias FOR ALL USING (true) WITH CHECK (true);

-- Índices para performance
CREATE INDEX idx_alertas_aluno ON public.alertas_educacionais(aluno_id);
CREATE INDEX idx_alertas_tipo ON public.alertas_educacionais(tipo);
CREATE INDEX idx_alertas_resolvido ON public.alertas_educacionais(resolvido);
CREATE INDEX idx_solicitacoes_status ON public.solicitacoes_matricula(status);
CREATE INDEX idx_solicitacoes_protocolo ON public.solicitacoes_matricula(protocolo);
CREATE INDEX idx_historico_aluno ON public.historico_escolar(aluno_id);
CREATE INDEX idx_transferencias_aluno ON public.transferencias(aluno_id);
CREATE INDEX idx_transferencias_status ON public.transferencias(status);
CREATE INDEX idx_cardapios_data ON public.cardapios(data);
CREATE INDEX idx_estoque_escola ON public.estoque_alimentos(escola_id);