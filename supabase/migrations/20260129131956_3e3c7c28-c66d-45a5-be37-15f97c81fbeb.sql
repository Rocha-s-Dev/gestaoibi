-- =====================================================
-- FASE 2: FOLHA DE PAGAMENTO PÚBLICA
-- =====================================================

-- Enum para tipo de evento (rubrica)
DO $$ BEGIN
  CREATE TYPE tipo_evento_folha AS ENUM (
    'vencimento',
    'gratificacao',
    'adicional',
    'beneficio',
    'desconto_obrigatorio',
    'desconto_facultativo',
    'outros'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para status da folha
DO $$ BEGIN
  CREATE TYPE status_folha AS ENUM (
    'aberta',
    'calculada',
    'conferida',
    'fechada',
    'reprocessada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para tipo de incidência
DO $$ BEGIN
  CREATE TYPE tipo_incidencia AS ENUM (
    'inss',
    'irrf',
    'fgts',
    'base_ferias',
    'base_13',
    'nenhuma'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Tabela de Eventos/Rubricas da Folha
-- =====================================================
CREATE TABLE IF NOT EXISTS public.eventos_folha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_evento_folha NOT NULL,
  natureza TEXT NOT NULL CHECK (natureza IN ('provento', 'desconto')),
  
  -- Cálculo
  formula TEXT, -- Fórmula de cálculo (ex: "SALARIO_BASE * 0.1")
  valor_fixo NUMERIC(15,2),
  percentual NUMERIC(5,2),
  referencia_horas BOOLEAN DEFAULT false,
  
  -- Incidências
  incide_inss BOOLEAN DEFAULT false,
  incide_irrf BOOLEAN DEFAULT false,
  incide_fgts BOOLEAN DEFAULT false,
  incide_base_ferias BOOLEAN DEFAULT false,
  incide_base_13 BOOLEAN DEFAULT false,
  
  -- Aplicabilidade
  aplica_estatutario BOOLEAN DEFAULT true,
  aplica_clt BOOLEAN DEFAULT true,
  aplica_temporario BOOLEAN DEFAULT true,
  
  -- Controle
  ativo BOOLEAN DEFAULT true,
  obrigatorio BOOLEAN DEFAULT false,
  permite_edicao_valor BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Tabelas de INSS e IRRF
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tabela_inss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  faixa INTEGER NOT NULL,
  valor_inicial NUMERIC(15,2) NOT NULL,
  valor_final NUMERIC(15,2),
  aliquota NUMERIC(5,2) NOT NULL,
  parcela_deduzir NUMERIC(15,2) DEFAULT 0,
  teto_contribuicao NUMERIC(15,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tabela_irrf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,
  faixa INTEGER NOT NULL,
  valor_inicial NUMERIC(15,2) NOT NULL,
  valor_final NUMERIC(15,2),
  aliquota NUMERIC(5,2) NOT NULL,
  parcela_deduzir NUMERIC(15,2) NOT NULL DEFAULT 0,
  deducao_dependente NUMERIC(15,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Folha de Pagamento Mensal
-- =====================================================
CREATE TABLE IF NOT EXISTS public.folha_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  competencia DATE NOT NULL, -- Mês/Ano (sempre dia 01)
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Status e Controle
  status status_folha DEFAULT 'aberta',
  
  -- Datas de Controle
  data_abertura TIMESTAMPTZ DEFAULT now(),
  data_calculo TIMESTAMPTZ,
  data_conferencia TIMESTAMPTZ,
  data_fechamento TIMESTAMPTZ,
  
  -- Usuários responsáveis
  calculado_por UUID REFERENCES auth.users(id),
  conferido_por UUID REFERENCES auth.users(id),
  fechado_por UUID REFERENCES auth.users(id),
  
  -- Totais
  total_bruto NUMERIC(15,2) DEFAULT 0,
  total_descontos NUMERIC(15,2) DEFAULT 0,
  total_liquido NUMERIC(15,2) DEFAULT 0,
  total_inss_patronal NUMERIC(15,2) DEFAULT 0,
  total_fgts NUMERIC(15,2) DEFAULT 0,
  quantidade_servidores INTEGER DEFAULT 0,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(competencia, secretaria_id)
);

-- =====================================================
-- Lançamentos Individuais por Servidor
-- =====================================================
CREATE TABLE IF NOT EXISTS public.folha_servidor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  folha_id UUID NOT NULL REFERENCES public.folha_pagamento(id) ON DELETE CASCADE,
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  vinculo_id UUID REFERENCES public.vinculos_funcionais(id),
  
  -- Dados do Servidor no Momento
  cargo_nome TEXT,
  funcao_nome TEXT,
  salario_base NUMERIC(15,2) NOT NULL,
  jornada_mensal NUMERIC(5,2),
  
  -- Totais Individuais
  total_proventos NUMERIC(15,2) DEFAULT 0,
  total_descontos NUMERIC(15,2) DEFAULT 0,
  salario_liquido NUMERIC(15,2) DEFAULT 0,
  
  -- Bases de Cálculo
  base_inss NUMERIC(15,2) DEFAULT 0,
  base_irrf NUMERIC(15,2) DEFAULT 0,
  base_fgts NUMERIC(15,2) DEFAULT 0,
  
  -- Valores Calculados
  valor_inss NUMERIC(15,2) DEFAULT 0,
  valor_irrf NUMERIC(15,2) DEFAULT 0,
  valor_fgts NUMERIC(15,2) DEFAULT 0,
  
  -- Dados Bancários (snapshot)
  banco_codigo TEXT,
  banco_nome TEXT,
  agencia TEXT,
  conta TEXT,
  
  -- Controle
  processado BOOLEAN DEFAULT false,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(folha_id, servidor_id)
);

-- =====================================================
-- Itens/Rubricas de Cada Servidor
-- =====================================================
CREATE TABLE IF NOT EXISTS public.folha_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  folha_servidor_id UUID NOT NULL REFERENCES public.folha_servidor(id) ON DELETE CASCADE,
  evento_id UUID REFERENCES public.eventos_folha(id),
  
  -- Identificação do Evento
  codigo_evento TEXT NOT NULL,
  nome_evento TEXT NOT NULL,
  natureza TEXT NOT NULL CHECK (natureza IN ('provento', 'desconto')),
  
  -- Valores
  referencia NUMERIC(10,2), -- Quantidade, horas, dias, etc.
  valor NUMERIC(15,2) NOT NULL,
  
  -- Incidências aplicadas
  incide_inss BOOLEAN DEFAULT false,
  incide_irrf BOOLEAN DEFAULT false,
  incide_fgts BOOLEAN DEFAULT false,
  
  -- Controle
  lancamento_manual BOOLEAN DEFAULT false,
  justificativa TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Histórico de Reprocessamentos
-- =====================================================
CREATE TABLE IF NOT EXISTS public.folha_reprocessamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folha_id UUID NOT NULL REFERENCES public.folha_pagamento(id),
  
  motivo TEXT NOT NULL,
  estado_anterior JSONB,
  estado_posterior JSONB,
  
  reprocessado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Contracheques Gerados (PDF)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.contracheques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  folha_servidor_id UUID NOT NULL REFERENCES public.folha_servidor(id),
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  competencia DATE NOT NULL,
  
  -- Arquivo
  arquivo_url TEXT,
  hash_documento TEXT,
  
  -- Envio
  enviado_email BOOLEAN DEFAULT false,
  data_envio TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FASE 3: FREQUÊNCIA E JORNADA
-- =====================================================

-- Enum para tipo de registro de ponto
DO $$ BEGIN
  CREATE TYPE tipo_registro_ponto AS ENUM (
    'entrada',
    'saida_intervalo',
    'retorno_intervalo',
    'saida'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para tipo de jornada
DO $$ BEGIN
  CREATE TYPE tipo_jornada AS ENUM (
    'presencial',
    'teletrabalho',
    'hibrido',
    'sobreaviso',
    'plantao'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para status de justificativa
DO $$ BEGIN
  CREATE TYPE status_justificativa AS ENUM (
    'pendente',
    'aprovada',
    'rejeitada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Registro de Ponto
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ponto_servidor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  data DATE NOT NULL,
  
  -- Registros
  entrada TIMESTAMPTZ,
  saida_intervalo TIMESTAMPTZ,
  retorno_intervalo TIMESTAMPTZ,
  saida TIMESTAMPTZ,
  
  -- Tipo de Jornada
  tipo_jornada tipo_jornada DEFAULT 'presencial',
  
  -- Horas Calculadas
  horas_trabalhadas NUMERIC(5,2) DEFAULT 0,
  horas_extras NUMERIC(5,2) DEFAULT 0,
  horas_faltantes NUMERIC(5,2) DEFAULT 0,
  horas_noturnas NUMERIC(5,2) DEFAULT 0,
  
  -- Controle
  jornada_esperada NUMERIC(5,2) DEFAULT 8,
  falta BOOLEAN DEFAULT false,
  abono BOOLEAN DEFAULT false,
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(servidor_id, data)
);

-- =====================================================
-- Justificativas de Ponto
-- =====================================================
CREATE TABLE IF NOT EXISTS public.justificativas_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  ponto_id UUID REFERENCES public.ponto_servidor(id),
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  data DATE NOT NULL,
  
  -- Justificativa
  tipo TEXT NOT NULL, -- 'falta', 'atraso', 'saida_antecipada', 'ausencia_intervalo'
  motivo TEXT NOT NULL,
  documento_url TEXT,
  
  -- Aprovação
  status status_justificativa DEFAULT 'pendente',
  aprovado_por UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Banco de Horas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.banco_horas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Período
  competencia DATE NOT NULL, -- Mês/Ano
  
  -- Saldos
  saldo_anterior NUMERIC(8,2) DEFAULT 0,
  horas_creditadas NUMERIC(8,2) DEFAULT 0,
  horas_debitadas NUMERIC(8,2) DEFAULT 0,
  saldo_atual NUMERIC(8,2) DEFAULT 0,
  
  -- Limites
  limite_acumulado NUMERIC(8,2) DEFAULT 40, -- Limite legal
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(servidor_id, competencia)
);

-- =====================================================
-- Movimentações do Banco de Horas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.banco_horas_movimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  banco_horas_id UUID NOT NULL REFERENCES public.banco_horas(id) ON DELETE CASCADE,
  
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('credito', 'debito')),
  horas NUMERIC(5,2) NOT NULL,
  motivo TEXT NOT NULL,
  
  ponto_id UUID REFERENCES public.ponto_servidor(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FASE 4: FÉRIAS E LICENÇAS
-- =====================================================

-- Enum para status de férias/licença
DO $$ BEGIN
  CREATE TYPE status_solicitacao AS ENUM (
    'rascunho',
    'enviada',
    'aprovada_chefia',
    'aprovada_rh',
    'rejeitada',
    'cancelada',
    'em_gozo',
    'concluida'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para tipo de licença
DO $$ BEGIN
  CREATE TYPE tipo_licenca AS ENUM (
    'saude',
    'maternidade',
    'paternidade',
    'casamento',
    'luto',
    'capacitacao',
    'interesse_particular',
    'premio',
    'outros'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Períodos Aquisitivos de Férias
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ferias_periodos_aquisitivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Período Aquisitivo
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  
  -- Direito
  dias_direito INTEGER DEFAULT 30,
  dias_usufruidos INTEGER DEFAULT 0,
  dias_vendidos INTEGER DEFAULT 0,
  dias_saldo INTEGER GENERATED ALWAYS AS (dias_direito - dias_usufruidos - dias_vendidos) STORED,
  
  -- Status
  vencido BOOLEAN DEFAULT false,
  data_vencimento DATE,
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(servidor_id, inicio)
);

-- =====================================================
-- Solicitações de Férias
-- =====================================================
CREATE TABLE IF NOT EXISTS public.ferias_solicitacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  periodo_aquisitivo_id UUID REFERENCES public.ferias_periodos_aquisitivos(id),
  
  -- Período Solicitado
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_solicitados INTEGER NOT NULL,
  
  -- Abono Pecuniário (venda de 1/3)
  abono_pecuniario BOOLEAN DEFAULT false,
  dias_abono INTEGER DEFAULT 0,
  
  -- 13º Antecipado
  antecipacao_13 BOOLEAN DEFAULT false,
  
  -- Valores Calculados
  valor_ferias NUMERIC(15,2),
  valor_terco_constitucional NUMERIC(15,2),
  valor_abono NUMERIC(15,2),
  valor_13_antecipado NUMERIC(15,2),
  valor_total NUMERIC(15,2),
  
  -- Fluxo de Aprovação
  status status_solicitacao DEFAULT 'rascunho',
  
  -- Chefia Imediata
  aprovado_chefia_por UUID REFERENCES auth.users(id),
  data_aprovacao_chefia TIMESTAMPTZ,
  
  -- RH
  aprovado_rh_por UUID REFERENCES auth.users(id),
  data_aprovacao_rh TIMESTAMPTZ,
  
  motivo_rejeicao TEXT,
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Licenças
-- =====================================================
CREATE TABLE IF NOT EXISTS public.licencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  servidor_id UUID NOT NULL REFERENCES public.profiles(id),
  
  -- Tipo e Período
  tipo tipo_licenca NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_totais INTEGER NOT NULL,
  
  -- Documentação
  cid TEXT, -- CID para licença saúde
  documento_url TEXT,
  atestado_pericia BOOLEAN DEFAULT false,
  
  -- Remuneração
  remunerada BOOLEAN DEFAULT true,
  percentual_remuneracao NUMERIC(5,2) DEFAULT 100,
  
  -- Fluxo de Aprovação
  status status_solicitacao DEFAULT 'enviada',
  
  aprovado_por UUID REFERENCES auth.users(id),
  data_aprovacao TIMESTAMPTZ,
  motivo_rejeicao TEXT,
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FASE 5: PROCESSOS TRABALHISTAS
-- =====================================================

-- Enum para status do processo
DO $$ BEGIN
  CREATE TYPE status_processo_trabalhista AS ENUM (
    'ativo',
    'suspenso',
    'arquivado',
    'transitado_julgado',
    'acordo',
    'extinto'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para fase processual
DO $$ BEGIN
  CREATE TYPE fase_processual AS ENUM (
    'inicial',
    'instrucao',
    'julgamento',
    'recursos',
    'execucao',
    'encerrado'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =====================================================
-- Processos Trabalhistas
-- =====================================================
CREATE TABLE IF NOT EXISTS public.processos_trabalhistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Partes
  servidor_id UUID REFERENCES public.profiles(id), -- Pode ser ex-servidor
  nome_reclamante TEXT NOT NULL,
  cpf_reclamante TEXT,
  
  -- Dados do Processo
  numero_processo TEXT NOT NULL UNIQUE,
  vara TEXT,
  comarca TEXT,
  tribunal TEXT,
  
  -- Valores
  valor_causa NUMERIC(15,2),
  valor_condenacao NUMERIC(15,2),
  valor_acordo NUMERIC(15,2),
  valor_provisionado NUMERIC(15,2) DEFAULT 0,
  
  -- Status
  status status_processo_trabalhista DEFAULT 'ativo',
  fase fase_processual DEFAULT 'inicial',
  
  -- Datas
  data_distribuicao DATE,
  data_citacao DATE,
  data_sentenca DATE,
  data_transito_julgado DATE,
  
  -- Responsável
  advogado_responsavel TEXT,
  oab_advogado TEXT,
  
  -- Secretaria
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Audiências
-- =====================================================
CREATE TABLE IF NOT EXISTS public.processos_audiencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  processo_id UUID NOT NULL REFERENCES public.processos_trabalhistas(id) ON DELETE CASCADE,
  
  data_hora TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL, -- 'inicial', 'instrucao', 'julgamento', 'conciliacao'
  local TEXT,
  
  -- Resultado
  realizada BOOLEAN DEFAULT false,
  resultado TEXT,
  houve_acordo BOOLEAN DEFAULT false,
  valor_acordo NUMERIC(15,2),
  
  -- Próximos Passos
  proxima_audiencia DATE,
  prazo TEXT,
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Movimentações Processuais
-- =====================================================
CREATE TABLE IF NOT EXISTS public.processos_movimentacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  processo_id UUID NOT NULL REFERENCES public.processos_trabalhistas(id) ON DELETE CASCADE,
  
  data DATE NOT NULL,
  descricao TEXT NOT NULL,
  documento_url TEXT,
  
  -- Prazos
  tem_prazo BOOLEAN DEFAULT false,
  data_prazo DATE,
  prazo_cumprido BOOLEAN,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- Provisionamentos Financeiros
-- =====================================================
CREATE TABLE IF NOT EXISTS public.processos_provisionamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  processo_id UUID NOT NULL REFERENCES public.processos_trabalhistas(id) ON DELETE CASCADE,
  
  data DATE NOT NULL,
  valor NUMERIC(15,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('constituicao', 'aumento', 'reducao', 'baixa')),
  motivo TEXT NOT NULL,
  
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- FASE 6: RELATÓRIOS LEGAIS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.relatorios_legais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  tipo TEXT NOT NULL, -- 'RAIS', 'CAGED', 'GFIP', 'DIRF', 'TCE'
  competencia DATE NOT NULL,
  
  -- Dados
  dados JSONB,
  
  -- Arquivo Gerado
  arquivo_url TEXT,
  hash_arquivo TEXT,
  
  -- Transmissão
  transmitido BOOLEAN DEFAULT false,
  data_transmissao TIMESTAMPTZ,
  protocolo TEXT,
  
  -- Controle
  gerado_por UUID REFERENCES auth.users(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Eventos Folha
ALTER TABLE public.eventos_folha ENABLE ROW LEVEL SECURITY;

CREATE POLICY "eventos_folha_select_all" ON public.eventos_folha
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "eventos_folha_admin" ON public.eventos_folha
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

-- Tabelas INSS/IRRF
ALTER TABLE public.tabela_inss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tabela_irrf ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tabela_inss_select" ON public.tabela_inss
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tabela_irrf_select" ON public.tabela_irrf
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "tabela_inss_admin" ON public.tabela_inss
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "tabela_irrf_admin" ON public.tabela_irrf
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

-- Folha de Pagamento
ALTER TABLE public.folha_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folha_servidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folha_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folha_reprocessamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracheques ENABLE ROW LEVEL SECURITY;

CREATE POLICY "folha_pagamento_admin" ON public.folha_pagamento
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "folha_servidor_admin" ON public.folha_servidor
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "folha_servidor_proprio" ON public.folha_servidor
  FOR SELECT TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "folha_itens_admin" ON public.folha_itens
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "contracheques_admin" ON public.contracheques
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "contracheques_proprio" ON public.contracheques
  FOR SELECT TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Ponto
ALTER TABLE public.ponto_servidor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.justificativas_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banco_horas_movimentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ponto_admin" ON public.ponto_servidor
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "ponto_proprio" ON public.ponto_servidor
  FOR ALL TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "justificativas_admin" ON public.justificativas_ponto
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "justificativas_proprio" ON public.justificativas_ponto
  FOR ALL TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "banco_horas_admin" ON public.banco_horas
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "banco_horas_proprio" ON public.banco_horas
  FOR SELECT TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "banco_horas_movimentos_admin" ON public.banco_horas_movimentos
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

-- Férias e Licenças
ALTER TABLE public.ferias_periodos_aquisitivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ferias_solicitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licencas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ferias_periodos_admin" ON public.ferias_periodos_aquisitivos
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "ferias_periodos_proprio" ON public.ferias_periodos_aquisitivos
  FOR SELECT TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "ferias_solicitacoes_admin" ON public.ferias_solicitacoes
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "ferias_solicitacoes_proprio" ON public.ferias_solicitacoes
  FOR ALL TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "licencas_admin" ON public.licencas
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "licencas_proprio" ON public.licencas
  FOR ALL TO authenticated USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Processos Trabalhistas
ALTER TABLE public.processos_trabalhistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_audiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_provisionamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "processos_admin" ON public.processos_trabalhistas
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'secretario')
  );

CREATE POLICY "processos_audiencias_admin" ON public.processos_audiencias
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "processos_movimentacoes_admin" ON public.processos_movimentacoes
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

CREATE POLICY "processos_provisionamentos_admin" ON public.processos_provisionamentos
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

-- Relatórios Legais
ALTER TABLE public.relatorios_legais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "relatorios_legais_admin" ON public.relatorios_legais
  FOR ALL TO authenticated USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal')
  );

-- =====================================================
-- TRIGGERS DE AUDITORIA
-- =====================================================

CREATE TRIGGER audit_folha_pagamento
  AFTER INSERT OR UPDATE OR DELETE ON public.folha_pagamento
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_folha_servidor
  AFTER INSERT OR UPDATE OR DELETE ON public.folha_servidor
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_ponto_servidor
  AFTER INSERT OR UPDATE OR DELETE ON public.ponto_servidor
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_ferias_solicitacoes
  AFTER INSERT OR UPDATE OR DELETE ON public.ferias_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_licencas
  AFTER INSERT OR UPDATE OR DELETE ON public.licencas
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_processos_trabalhistas
  AFTER INSERT OR UPDATE OR DELETE ON public.processos_trabalhistas
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

-- =====================================================
-- TRIGGERS DE UPDATED_AT
-- =====================================================

CREATE TRIGGER update_eventos_folha_updated_at
  BEFORE UPDATE ON public.eventos_folha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_pagamento_updated_at
  BEFORE UPDATE ON public.folha_pagamento
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_folha_servidor_updated_at
  BEFORE UPDATE ON public.folha_servidor
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ponto_servidor_updated_at
  BEFORE UPDATE ON public.ponto_servidor
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_justificativas_ponto_updated_at
  BEFORE UPDATE ON public.justificativas_ponto
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banco_horas_updated_at
  BEFORE UPDATE ON public.banco_horas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ferias_periodos_updated_at
  BEFORE UPDATE ON public.ferias_periodos_aquisitivos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ferias_solicitacoes_updated_at
  BEFORE UPDATE ON public.ferias_solicitacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licencas_updated_at
  BEFORE UPDATE ON public.licencas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processos_trabalhistas_updated_at
  BEFORE UPDATE ON public.processos_trabalhistas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relatorios_legais_updated_at
  BEFORE UPDATE ON public.relatorios_legais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Eventos de Folha Padrão
INSERT INTO public.eventos_folha (codigo, nome, tipo, natureza, incide_inss, incide_irrf, incide_fgts, obrigatorio) VALUES
  ('001', 'Vencimento Base', 'vencimento', 'provento', true, true, true, true),
  ('002', 'Adicional por Tempo de Serviço', 'adicional', 'provento', true, true, true, false),
  ('003', 'Gratificação de Função', 'gratificacao', 'provento', true, true, false, false),
  ('004', 'Adicional Noturno', 'adicional', 'provento', true, true, true, false),
  ('005', 'Adicional de Insalubridade', 'adicional', 'provento', true, true, true, false),
  ('006', 'Adicional de Periculosidade', 'adicional', 'provento', true, true, true, false),
  ('007', 'Horas Extras 50%', 'adicional', 'provento', true, true, true, false),
  ('008', 'Horas Extras 100%', 'adicional', 'provento', true, true, true, false),
  ('009', 'Férias', 'vencimento', 'provento', true, true, true, false),
  ('010', '1/3 Constitucional de Férias', 'adicional', 'provento', true, true, true, false),
  ('011', '13º Salário - 1ª Parcela', 'vencimento', 'provento', false, false, true, false),
  ('012', '13º Salário - 2ª Parcela', 'vencimento', 'provento', true, true, true, false),
  ('101', 'INSS', 'desconto_obrigatorio', 'desconto', false, false, false, true),
  ('102', 'IRRF', 'desconto_obrigatorio', 'desconto', false, false, false, true),
  ('103', 'Pensão Alimentícia', 'desconto_obrigatorio', 'desconto', false, false, false, false),
  ('104', 'Consignação Bancária', 'desconto_facultativo', 'desconto', false, false, false, false),
  ('105', 'Plano de Saúde', 'desconto_facultativo', 'desconto', false, false, false, false),
  ('106', 'Previdência Complementar', 'desconto_facultativo', 'desconto', false, false, false, false),
  ('107', 'Faltas', 'desconto_obrigatorio', 'desconto', false, false, false, false),
  ('108', 'Atrasos', 'desconto_obrigatorio', 'desconto', false, false, false, false)
ON CONFLICT (codigo) DO NOTHING;

-- Tabela INSS 2024 (valores ilustrativos)
INSERT INTO public.tabela_inss (vigencia_inicio, faixa, valor_inicial, valor_final, aliquota, teto_contribuicao) VALUES
  ('2024-01-01', 1, 0, 1412.00, 7.5, NULL),
  ('2024-01-01', 2, 1412.01, 2666.68, 9.0, NULL),
  ('2024-01-01', 3, 2666.69, 4000.03, 12.0, NULL),
  ('2024-01-01', 4, 4000.04, 7786.02, 14.0, 908.85)
ON CONFLICT DO NOTHING;

-- Tabela IRRF 2024 (valores ilustrativos)
INSERT INTO public.tabela_irrf (vigencia_inicio, faixa, valor_inicial, valor_final, aliquota, parcela_deduzir, deducao_dependente) VALUES
  ('2024-01-01', 1, 0, 2259.20, 0, 0, 189.59),
  ('2024-01-01', 2, 2259.21, 2826.65, 7.5, 169.44, 189.59),
  ('2024-01-01', 3, 2826.66, 3751.05, 15.0, 381.44, 189.59),
  ('2024-01-01', 4, 3751.06, 4664.68, 22.5, 662.77, 189.59),
  ('2024-01-01', 5, 4664.69, NULL, 27.5, 896.00, 189.59)
ON CONFLICT DO NOTHING;