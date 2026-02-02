
-- ===========================================================
-- MÓDULO ISSQN ELETRÔNICO - GESTÃO TRIBUTÁRIA MUNICIPAL
-- (Versão corrigida - usando roles corretas)
-- ===========================================================

-- Enum para status de declaração (se não existir)
DO $$ BEGIN
  CREATE TYPE public.status_declaracao_iss AS ENUM (
    'rascunho',
    'transmitida',
    'retificada',
    'cancelada'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para tipo de auto de infração (se não existir)
DO $$ BEGIN
  CREATE TYPE public.tipo_auto_infracao AS ENUM (
    'omissao_declaracao',
    'subfaturamento',
    'atividade_irregular',
    'descumprimento_obrigacao_acessoria',
    'outros'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Enum para status do processo fiscal (se não existir)
DO $$ BEGIN
  CREATE TYPE public.status_processo_fiscal AS ENUM (
    'aberto',
    'em_analise',
    'pendente_defesa',
    'julgado_procedente',
    'julgado_improcedente',
    'arquivado',
    'encaminhado_divida_ativa'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ===========================================================
-- 1. LISTA DE SERVIÇOS (LC 116/2003)
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.lista_servicos_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_municipal TEXT NOT NULL,
  codigo_lc116 TEXT,
  descricao TEXT NOT NULL,
  aliquota_padrao DECIMAL(5,2) NOT NULL DEFAULT 5.00,
  aliquota_minima DECIMAL(5,2) DEFAULT 2.00,
  aliquota_maxima DECIMAL(5,2) DEFAULT 5.00,
  base_calculo_descricao TEXT,
  deducoes_permitidas JSONB DEFAULT '[]'::jsonb,
  exige_retencao BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lista_servicos_codigo ON public.lista_servicos_iss(codigo_municipal);
CREATE INDEX IF NOT EXISTS idx_lista_servicos_lc116 ON public.lista_servicos_iss(codigo_lc116);

-- ===========================================================
-- 2. ATIVIDADES ECONÔMICAS DOS CONTRIBUINTES
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.contribuinte_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.lista_servicos_iss(id),
  cnae_codigo TEXT,
  aliquota_especifica DECIMAL(5,2),
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contribuinte_atividades_contribuinte ON public.contribuinte_atividades(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_contribuinte_atividades_servico ON public.contribuinte_atividades(servico_id);

-- ===========================================================
-- 3. DECLARAÇÕES MENSAIS DE ISS
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.declaracoes_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  competencia TEXT NOT NULL,
  numero_declaracao TEXT NOT NULL,
  status TEXT DEFAULT 'rascunho',
  valor_servicos_prestados DECIMAL(14,2) DEFAULT 0,
  valor_deducoes DECIMAL(14,2) DEFAULT 0,
  base_calculo DECIMAL(14,2) DEFAULT 0,
  valor_iss_devido DECIMAL(14,2) DEFAULT 0,
  valor_iss_retido DECIMAL(14,2) DEFAULT 0,
  valor_iss_pagar DECIMAL(14,2) DEFAULT 0,
  data_transmissao TIMESTAMPTZ,
  data_vencimento DATE,
  declaracao_retificadora_de UUID,
  motivo_retificacao TEXT,
  hash_declaracao TEXT,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_declaracoes_iss_contribuinte ON public.declaracoes_iss(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_declaracoes_iss_competencia ON public.declaracoes_iss(competencia);
CREATE INDEX IF NOT EXISTS idx_declaracoes_iss_status ON public.declaracoes_iss(status);

-- ===========================================================
-- 4. ITENS DA DECLARAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.itens_declaracao_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaracao_id UUID NOT NULL REFERENCES public.declaracoes_iss(id) ON DELETE CASCADE,
  servico_id UUID REFERENCES public.lista_servicos_iss(id),
  nfse_id UUID,
  tomador_cpf_cnpj TEXT,
  tomador_nome TEXT,
  descricao_servico TEXT,
  valor_servico DECIMAL(14,2) NOT NULL,
  valor_deducao DECIMAL(14,2) DEFAULT 0,
  base_calculo DECIMAL(14,2) NOT NULL,
  aliquota DECIMAL(5,2) NOT NULL,
  valor_iss DECIMAL(14,2) NOT NULL,
  iss_retido BOOLEAN DEFAULT false,
  local_prestacao TEXT,
  data_servico DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itens_declaracao_declaracao ON public.itens_declaracao_iss(declaracao_id);
CREATE INDEX IF NOT EXISTS idx_itens_declaracao_servico ON public.itens_declaracao_iss(servico_id);

-- ===========================================================
-- 5. GUIAS DE PAGAMENTO ISS
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.guias_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  declaracao_id UUID REFERENCES public.declaracoes_iss(id),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  numero_guia TEXT NOT NULL,
  competencia TEXT NOT NULL,
  valor_principal DECIMAL(14,2) NOT NULL,
  valor_multa DECIMAL(14,2) DEFAULT 0,
  valor_juros DECIMAL(14,2) DEFAULT 0,
  valor_correcao DECIMAL(14,2) DEFAULT 0,
  valor_total DECIMAL(14,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago DECIMAL(14,2),
  codigo_barras TEXT,
  linha_digitavel TEXT,
  qrcode_pix TEXT,
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_guias_iss_declaracao ON public.guias_iss(declaracao_id);
CREATE INDEX IF NOT EXISTS idx_guias_iss_contribuinte ON public.guias_iss(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_guias_iss_competencia ON public.guias_iss(competencia);
CREATE INDEX IF NOT EXISTS idx_guias_iss_status ON public.guias_iss(status);

-- ===========================================================
-- 6. ATUALIZAR TABELA NFSE EXISTENTE
-- ===========================================================
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.lista_servicos_iss(id);
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS codigo_servico TEXT;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS discriminacao TEXT;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_deducoes DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_pis DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_cofins DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_inss DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_ir DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_csll DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS outras_retencoes DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS desconto_incondicionado DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS desconto_condicionado DECIMAL(14,2) DEFAULT 0;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS base_calculo DECIMAL(14,2);
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS aliquota DECIMAL(5,2);
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_iss DECIMAL(14,2);
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS iss_retido BOOLEAN DEFAULT false;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS valor_liquido DECIMAL(14,2);
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS nfse_substituida_id UUID;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS motivo_cancelamento TEXT;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS data_cancelamento TIMESTAMPTZ;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS municipio_incidencia TEXT;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS xml_nfse TEXT;
ALTER TABLE public.nfse ADD COLUMN IF NOT EXISTS pdf_url TEXT;

CREATE INDEX IF NOT EXISTS idx_nfse_competencia ON public.nfse(competencia);
CREATE INDEX IF NOT EXISTS idx_nfse_data_emissao ON public.nfse(data_emissao);

-- ===========================================================
-- 7. FISCALIZAÇÃO ISS
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.fiscalizacao_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  numero_ordem_servico TEXT NOT NULL,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_fim DATE,
  periodo_fiscalizado_inicio TEXT,
  periodo_fiscalizado_fim TEXT,
  fiscal_responsavel_id UUID REFERENCES public.profiles(id),
  tipo_fiscalizacao TEXT DEFAULT 'rotina',
  motivo TEXT,
  total_servicos_apurados DECIMAL(14,2) DEFAULT 0,
  total_iss_apurado DECIMAL(14,2) DEFAULT 0,
  total_iss_declarado DECIMAL(14,2) DEFAULT 0,
  diferenca_apurada DECIMAL(14,2) DEFAULT 0,
  alertas_omissao JSONB DEFAULT '[]'::jsonb,
  divergencias_encontradas JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'em_andamento',
  conclusao TEXT,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fiscalizacao_iss_contribuinte ON public.fiscalizacao_iss(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_fiscalizacao_iss_fiscal ON public.fiscalizacao_iss(fiscal_responsavel_id);
CREATE INDEX IF NOT EXISTS idx_fiscalizacao_iss_status ON public.fiscalizacao_iss(status);

-- ===========================================================
-- 8. AUTOS DE INFRAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.autos_infracao_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscalizacao_id UUID REFERENCES public.fiscalizacao_iss(id),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  numero_auto TEXT NOT NULL,
  data_lavratura DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL,
  descricao_infracao TEXT NOT NULL,
  fundamentacao_legal TEXT,
  periodo_infracao_inicio DATE,
  periodo_infracao_fim DATE,
  valor_principal DECIMAL(14,2) NOT NULL,
  valor_multa DECIMAL(14,2) NOT NULL,
  valor_juros DECIMAL(14,2) DEFAULT 0,
  valor_total DECIMAL(14,2) NOT NULL,
  prazo_defesa_dias INTEGER DEFAULT 30,
  data_limite_defesa DATE,
  data_ciencia DATE,
  forma_ciencia TEXT,
  status TEXT DEFAULT 'lavrado',
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_autos_infracao_contribuinte ON public.autos_infracao_iss(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_autos_infracao_fiscalizacao ON public.autos_infracao_iss(fiscalizacao_id);
CREATE INDEX IF NOT EXISTS idx_autos_infracao_status ON public.autos_infracao_iss(status);

-- ===========================================================
-- 9. PROCESSOS ADMINISTRATIVOS FISCAIS
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.processos_administrativos_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_infracao_id UUID REFERENCES public.autos_infracao_iss(id),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  numero_processo TEXT NOT NULL,
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'aberto',
  data_defesa DATE,
  defesa_texto TEXT,
  defesa_anexos JSONB DEFAULT '[]'::jsonb,
  relator_id UUID REFERENCES public.profiles(id),
  data_julgamento DATE,
  decisao TEXT,
  fundamentacao_decisao TEXT,
  tem_recurso BOOLEAN DEFAULT false,
  data_recurso DATE,
  recurso_texto TEXT,
  decisao_recurso TEXT,
  inscrito_divida_ativa BOOLEAN DEFAULT false,
  data_inscricao_divida_ativa DATE,
  divida_ativa_id UUID,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_processos_fiscais_auto ON public.processos_administrativos_fiscais(auto_infracao_id);
CREATE INDEX IF NOT EXISTS idx_processos_fiscais_contribuinte ON public.processos_administrativos_fiscais(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_processos_fiscais_status ON public.processos_administrativos_fiscais(status);

-- ===========================================================
-- 10. MOVIMENTAÇÕES DO PROCESSO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.movimentacoes_processo_fiscal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  processo_id UUID NOT NULL REFERENCES public.processos_administrativos_fiscais(id) ON DELETE CASCADE,
  data_movimentacao TIMESTAMPTZ DEFAULT now(),
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  responsavel_id UUID REFERENCES public.profiles(id),
  anexos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimentacoes_processo ON public.movimentacoes_processo_fiscal(processo_id);

-- ===========================================================
-- 11. ALERTAS DE FISCALIZAÇÃO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.alertas_fiscalizacao_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  tipo TEXT NOT NULL,
  competencia TEXT,
  descricao TEXT NOT NULL,
  valor_esperado DECIMAL(14,2),
  valor_declarado DECIMAL(14,2),
  diferenca DECIMAL(14,2),
  data_geracao TIMESTAMPTZ DEFAULT now(),
  analisado BOOLEAN DEFAULT false,
  data_analise TIMESTAMPTZ,
  analista_id UUID REFERENCES public.profiles(id),
  resultado_analise TEXT,
  gera_fiscalizacao BOOLEAN DEFAULT false,
  fiscalizacao_id UUID REFERENCES public.fiscalizacao_iss(id),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alertas_fiscalizacao_contribuinte ON public.alertas_fiscalizacao_iss(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_alertas_fiscalizacao_tipo ON public.alertas_fiscalizacao_iss(tipo);
CREATE INDEX IF NOT EXISTS idx_alertas_fiscalizacao_analisado ON public.alertas_fiscalizacao_iss(analisado);

-- ===========================================================
-- 12. CONFIGURAÇÕES ISS
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.config_iss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercicio INTEGER NOT NULL,
  dia_vencimento_guia INTEGER DEFAULT 15,
  multa_atraso_percentual DECIMAL(5,2) DEFAULT 2.00,
  juros_mora_mensal DECIMAL(5,2) DEFAULT 1.00,
  prazo_retificacao_dias INTEGER DEFAULT 180,
  prazo_defesa_auto_dias INTEGER DEFAULT 30,
  permite_declaracao_sem_movimento BOOLEAN DEFAULT true,
  obriga_nfse_para_declaracao BOOLEAN DEFAULT false,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ===========================================================
-- HABILITAR RLS
-- ===========================================================
ALTER TABLE public.lista_servicos_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuinte_atividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.declaracoes_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_declaracao_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guias_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscalizacao_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autos_infracao_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos_administrativos_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_processo_fiscal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_fiscalizacao_iss ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_iss ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- POLÍTICAS RLS (usando roles corretas)
-- ===========================================================

-- Lista de Serviços
DROP POLICY IF EXISTS "Leitura pública lista serviços" ON public.lista_servicos_iss;
DROP POLICY IF EXISTS "Gestão lista serviços" ON public.lista_servicos_iss;

CREATE POLICY "Leitura pública lista serviços" ON public.lista_servicos_iss
  FOR SELECT USING (true);

CREATE POLICY "Gestão lista serviços" ON public.lista_servicos_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario')
  );

-- Atividades do contribuinte
DROP POLICY IF EXISTS "Admin e Financeiro gerenciam atividades" ON public.contribuinte_atividades;
CREATE POLICY "Admin e Financeiro gerenciam atividades" ON public.contribuinte_atividades
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Declarações ISS
DROP POLICY IF EXISTS "Admin e Financeiro gerenciam declarações" ON public.declaracoes_iss;
CREATE POLICY "Admin e Financeiro gerenciam declarações" ON public.declaracoes_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Itens da declaração
DROP POLICY IF EXISTS "Admin e Financeiro gerenciam itens declaração" ON public.itens_declaracao_iss;
CREATE POLICY "Admin e Financeiro gerenciam itens declaração" ON public.itens_declaracao_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Guias ISS
DROP POLICY IF EXISTS "Admin e Financeiro gerenciam guias" ON public.guias_iss;
CREATE POLICY "Admin e Financeiro gerenciam guias" ON public.guias_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Fiscalização
DROP POLICY IF EXISTS "Fiscais gerenciam fiscalização" ON public.fiscalizacao_iss;
CREATE POLICY "Fiscais gerenciam fiscalização" ON public.fiscalizacao_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Autos de Infração
DROP POLICY IF EXISTS "Fiscais gerenciam autos" ON public.autos_infracao_iss;
CREATE POLICY "Fiscais gerenciam autos" ON public.autos_infracao_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Processos Administrativos
DROP POLICY IF EXISTS "Gestão processos fiscais" ON public.processos_administrativos_fiscais;
CREATE POLICY "Gestão processos fiscais" ON public.processos_administrativos_fiscais
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario')
  );

-- Movimentações do Processo
DROP POLICY IF EXISTS "Gestão movimentações processo" ON public.movimentacoes_processo_fiscal;
CREATE POLICY "Gestão movimentações processo" ON public.movimentacoes_processo_fiscal
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Alertas de Fiscalização
DROP POLICY IF EXISTS "Fiscais gerenciam alertas" ON public.alertas_fiscalizacao_iss;
CREATE POLICY "Fiscais gerenciam alertas" ON public.alertas_fiscalizacao_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario') OR
    public.has_secretaria_role(auth.uid(), 'servidor')
  );

-- Configurações ISS
DROP POLICY IF EXISTS "Admin gerencia config ISS" ON public.config_iss;
CREATE POLICY "Admin gerencia config ISS" ON public.config_iss
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_role(auth.uid(), 'secretario')
  );

-- ===========================================================
-- TRIGGERS DE AUDITORIA
-- ===========================================================
DROP TRIGGER IF EXISTS audit_lista_servicos_iss ON public.lista_servicos_iss;
CREATE TRIGGER audit_lista_servicos_iss
  AFTER INSERT OR UPDATE OR DELETE ON public.lista_servicos_iss
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

DROP TRIGGER IF EXISTS audit_declaracoes_iss ON public.declaracoes_iss;
CREATE TRIGGER audit_declaracoes_iss
  AFTER INSERT OR UPDATE OR DELETE ON public.declaracoes_iss
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

DROP TRIGGER IF EXISTS audit_fiscalizacao_iss ON public.fiscalizacao_iss;
CREATE TRIGGER audit_fiscalizacao_iss
  AFTER INSERT OR UPDATE OR DELETE ON public.fiscalizacao_iss
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

DROP TRIGGER IF EXISTS audit_autos_infracao_iss ON public.autos_infracao_iss;
CREATE TRIGGER audit_autos_infracao_iss
  AFTER INSERT OR UPDATE OR DELETE ON public.autos_infracao_iss
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

DROP TRIGGER IF EXISTS audit_processos_fiscais ON public.processos_administrativos_fiscais;
CREATE TRIGGER audit_processos_fiscais
  AFTER INSERT OR UPDATE OR DELETE ON public.processos_administrativos_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

-- Triggers de updated_at
DROP TRIGGER IF EXISTS update_lista_servicos_updated_at ON public.lista_servicos_iss;
CREATE TRIGGER update_lista_servicos_updated_at
  BEFORE UPDATE ON public.lista_servicos_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_declaracoes_iss_updated_at ON public.declaracoes_iss;
CREATE TRIGGER update_declaracoes_iss_updated_at
  BEFORE UPDATE ON public.declaracoes_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_guias_iss_updated_at ON public.guias_iss;
CREATE TRIGGER update_guias_iss_updated_at
  BEFORE UPDATE ON public.guias_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_fiscalizacao_iss_updated_at ON public.fiscalizacao_iss;
CREATE TRIGGER update_fiscalizacao_iss_updated_at
  BEFORE UPDATE ON public.fiscalizacao_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_autos_infracao_updated_at ON public.autos_infracao_iss;
CREATE TRIGGER update_autos_infracao_updated_at
  BEFORE UPDATE ON public.autos_infracao_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_processos_fiscais_updated_at ON public.processos_administrativos_fiscais;
CREATE TRIGGER update_processos_fiscais_updated_at
  BEFORE UPDATE ON public.processos_administrativos_fiscais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_config_iss_updated_at ON public.config_iss;
CREATE TRIGGER update_config_iss_updated_at
  BEFORE UPDATE ON public.config_iss
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===========================================================
-- FUNÇÕES AUXILIARES
-- ===========================================================
CREATE OR REPLACE FUNCTION public.gerar_numero_declaracao_iss(p_contribuinte_id UUID, p_competencia TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inscricao TEXT;
  v_sequencial INTEGER;
BEGIN
  SELECT inscricao_municipal INTO v_inscricao 
  FROM public.contribuintes 
  WHERE id = p_contribuinte_id;
  
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial
  FROM public.declaracoes_iss
  WHERE contribuinte_id = p_contribuinte_id;
  
  RETURN CONCAT('DEC-', COALESCE(v_inscricao, 'SEM-IM'), '-', p_competencia, '-', LPAD(v_sequencial::TEXT, 4, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_numero_guia_iss(p_declaracao_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial
  FROM public.guias_iss;
  
  RETURN CONCAT('GUIA-ISS-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 6, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_numero_auto_infracao()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial
  FROM public.autos_infracao_iss;
  
  RETURN CONCAT('AI-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 6, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_numero_processo_fiscal()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial
  FROM public.processos_administrativos_fiscais;
  
  RETURN CONCAT('PAF-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 6, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_numero_ordem_servico_fiscalizacao()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial
  FROM public.fiscalizacao_iss;
  
  RETURN CONCAT('OS-FISC-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 5, '0'));
END;
$$;
