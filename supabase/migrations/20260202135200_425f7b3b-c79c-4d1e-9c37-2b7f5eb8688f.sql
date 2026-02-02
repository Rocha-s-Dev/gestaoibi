-- =============================================
-- MELHORIAS COMPLETAS NO MÓDULO DE IPTU
-- =============================================

-- Criar enum para tipo de imóvel (urbano/rural)
CREATE TYPE public.tipo_imovel AS ENUM ('urbano', 'rural', 'edificado', 'terreno');

-- Criar enum para padrão construtivo
CREATE TYPE public.padrao_construtivo AS ENUM ('luxo', 'alto', 'medio', 'baixo', 'popular', 'precario');

-- Criar enum para tipo de revisão IPTU
CREATE TYPE public.tipo_revisao_iptu AS ENUM ('valor_venal', 'aliquota', 'isencao', 'imunidade', 'area', 'uso');

-- Criar enum para status revisão
CREATE TYPE public.status_revisao AS ENUM ('pendente', 'em_analise', 'deferida', 'indeferida', 'cancelada');

-- =============================================
-- PLANTA GENÉRICA DE VALORES (PGV)
-- =============================================
CREATE TABLE public.planta_generica_valores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio INTEGER NOT NULL,
  codigo_logradouro TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  bairro TEXT NOT NULL,
  setor TEXT,
  zona_fiscal TEXT,
  valor_m2_terreno DECIMAL(12,2) NOT NULL,
  valor_m2_construcao DECIMAL(12,2),
  fator_localizacao DECIMAL(5,4) DEFAULT 1.0,
  fator_infraestrutura DECIMAL(5,4) DEFAULT 1.0,
  aprovado BOOLEAN DEFAULT false,
  data_aprovacao DATE,
  lei_regulamentacao TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(municipio_id, codigo_logradouro, exercicio)
);

-- =============================================
-- FATORES DE CORREÇÃO (por uso, padrão, etc.)
-- =============================================
CREATE TABLE public.fatores_correcao_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio INTEGER NOT NULL,
  tipo TEXT NOT NULL, -- 'uso', 'padrao', 'idade', 'conservacao'
  codigo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  fator DECIMAL(5,4) NOT NULL DEFAULT 1.0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(municipio_id, exercicio, tipo, codigo)
);

-- =============================================
-- PADRÕES CONSTRUTIVOS
-- =============================================
CREATE TABLE public.padroes_construtivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  padrao public.padrao_construtivo NOT NULL,
  valor_m2_base DECIMAL(12,2),
  caracteristicas JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(municipio_id, codigo)
);

-- =============================================
-- ADICIONAR COLUNAS FALTANTES EM IMÓVEIS
-- =============================================
ALTER TABLE public.imoveis 
  ADD COLUMN IF NOT EXISTS tipo_imovel public.tipo_imovel DEFAULT 'urbano',
  ADD COLUMN IF NOT EXISTS padrao_construtivo_id UUID REFERENCES public.padroes_construtivos(id),
  ADD COLUMN IF NOT EXISTS ano_construcao INTEGER,
  ADD COLUMN IF NOT EXISTS estado_conservacao TEXT DEFAULT 'bom',
  ADD COLUMN IF NOT EXISTS frente_logradouro DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS topografia TEXT DEFAULT 'plano',
  ADD COLUMN IF NOT EXISTS situacao_terreno TEXT DEFAULT 'meio_quadra',
  ADD COLUMN IF NOT EXISTS data_ultima_avaliacao DATE,
  ADD COLUMN IF NOT EXISTS responsavel_tributario_id UUID REFERENCES public.contribuintes(id),
  ADD COLUMN IF NOT EXISTS isento BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS imune BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS lei_isencao TEXT,
  ADD COLUMN IF NOT EXISTS data_isencao_inicio DATE,
  ADD COLUMN IF NOT EXISTS data_isencao_fim DATE,
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- =============================================
-- HISTÓRICO DE VALORES VENAIS
-- =============================================
CREATE TABLE public.historico_valores_venais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id),
  exercicio INTEGER NOT NULL,
  valor_venal_terreno DECIMAL(15,2),
  valor_venal_construcao DECIMAL(15,2),
  valor_venal_total DECIMAL(15,2) NOT NULL,
  area_terreno DECIMAL(12,2),
  area_construida DECIMAL(12,2),
  valor_m2_terreno DECIMAL(12,2),
  valor_m2_construcao DECIMAL(12,2),
  fatores_aplicados JSONB DEFAULT '{}',
  aliquota DECIMAL(6,4),
  fonte_calculo TEXT DEFAULT 'automatico', -- 'automatico', 'manual', 'revisao'
  responsavel_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(imovel_id, exercicio)
);

-- =============================================
-- HISTÓRICO DE PROPRIETÁRIOS/TRANSFERÊNCIAS
-- =============================================
CREATE TABLE public.historico_proprietarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id),
  contribuinte_id UUID NOT NULL REFERENCES public.contribuintes(id),
  tipo_transferencia TEXT NOT NULL, -- 'compra_venda', 'doacao', 'heranca', 'permuta', 'adjudicacao'
  data_transferencia DATE NOT NULL,
  documento_titulo TEXT,
  numero_matricula TEXT,
  cartorio TEXT,
  livro TEXT,
  folha TEXT,
  valor_transacao DECIMAL(15,2),
  observacoes TEXT,
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- SOLICITAÇÕES DE REVISÃO
-- =============================================
CREATE TABLE public.revisoes_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id),
  lancamento_id UUID REFERENCES public.iptu_lancamentos(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id),
  protocolo TEXT NOT NULL UNIQUE,
  tipo public.tipo_revisao_iptu NOT NULL,
  exercicio INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  fundamentacao TEXT,
  valor_atual DECIMAL(15,2),
  valor_pleiteado DECIMAL(15,2),
  documentos JSONB DEFAULT '[]',
  status public.status_revisao DEFAULT 'pendente',
  data_solicitacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_analise DATE,
  analista_id UUID,
  parecer TEXT,
  data_decisao DATE,
  decisor_id UUID,
  decisao TEXT,
  recurso BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CONFIGURAÇÃO DE LANÇAMENTO ANUAL
-- =============================================
CREATE TABLE public.config_lancamento_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio INTEGER NOT NULL,
  data_vencimento_cota_unica DATE NOT NULL,
  desconto_cota_unica DECIMAL(5,2) DEFAULT 10.00,
  numero_parcelas INTEGER DEFAULT 10,
  dia_vencimento_parcelas INTEGER DEFAULT 10,
  primeira_parcela_mes INTEGER DEFAULT 2, -- Fevereiro
  aliquota_residencial DECIMAL(6,4) DEFAULT 0.01,
  aliquota_comercial DECIMAL(6,4) DEFAULT 0.015,
  aliquota_industrial DECIMAL(6,4) DEFAULT 0.02,
  aliquota_territorial DECIMAL(6,4) DEFAULT 0.03,
  aliquota_progressiva BOOLEAN DEFAULT false,
  taxa_expediente DECIMAL(12,2) DEFAULT 0,
  taxa_limpeza_publica DECIMAL(12,2) DEFAULT 0,
  taxa_iluminacao DECIMAL(12,2) DEFAULT 0,
  bloqueado BOOLEAN DEFAULT false,
  data_bloqueio DATE,
  status TEXT DEFAULT 'configurando', -- 'configurando', 'aprovado', 'lancando', 'finalizado'
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(municipio_id, exercicio)
);

-- =============================================
-- LOTES DE LANÇAMENTO
-- =============================================
CREATE TABLE public.lotes_lancamento_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio INTEGER NOT NULL,
  numero_lote INTEGER NOT NULL,
  data_geracao TIMESTAMPTZ DEFAULT now(),
  total_imoveis INTEGER DEFAULT 0,
  total_lancado DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'processando', -- 'processando', 'finalizado', 'erro'
  erros JSONB DEFAULT '[]',
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- CARNÊS GERADOS
-- =============================================
CREATE TABLE public.carnes_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id UUID NOT NULL REFERENCES public.iptu_lancamentos(id),
  numero_carne TEXT NOT NULL UNIQUE,
  codigo_barras TEXT,
  linha_digitavel TEXT,
  qrcode_pix TEXT,
  chave_pix TEXT,
  arquivo_pdf TEXT,
  data_geracao TIMESTAMPTZ DEFAULT now(),
  data_envio DATE,
  forma_envio TEXT, -- 'correios', 'email', 'portal'
  status TEXT DEFAULT 'gerado' -- 'gerado', 'enviado', 'entregue', 'devolvido'
);

-- =============================================
-- BAIXAS MANUAIS (depósito judicial, etc)
-- =============================================
CREATE TABLE public.baixas_manuais_iptu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcela_id UUID NOT NULL REFERENCES public.iptu_parcelas(id),
  lancamento_id UUID NOT NULL REFERENCES public.iptu_lancamentos(id),
  tipo_baixa TEXT NOT NULL, -- 'deposito_judicial', 'compensacao', 'prescricao', 'remissao', 'outros'
  motivo TEXT NOT NULL,
  numero_processo TEXT,
  valor_original DECIMAL(15,2) NOT NULL,
  valor_baixado DECIMAL(15,2) NOT NULL,
  documento_autorizacao TEXT,
  autorizado_por UUID,
  data_baixa DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- INADIMPLÊNCIA AUTOMÁTICA
-- =============================================
CREATE TABLE public.config_inadimplencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  dias_para_notificacao INTEGER DEFAULT 30,
  dias_para_divida_ativa INTEGER DEFAULT 90,
  multa_atraso_percentual DECIMAL(5,2) DEFAULT 2.00,
  juros_mora_mensal DECIMAL(5,4) DEFAULT 0.01,
  correcao_monetaria TEXT DEFAULT 'IPCA',
  modelo_notificacao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PORTAL DO CIDADÃO - CONSULTAS
-- =============================================
CREATE TABLE public.consultas_cidadao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL, -- 'debitos', 'segunda_via', 'historico', 'revisao'
  cpf_cnpj TEXT NOT NULL,
  inscricao_imobiliaria TEXT,
  imovel_id UUID REFERENCES public.imoveis(id),
  ip_address INET,
  user_agent TEXT,
  resultado JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ADICIONAR COLUNAS EM IPTU_LANCAMENTOS
-- =============================================
ALTER TABLE public.iptu_lancamentos
  ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS data_bloqueio DATE,
  ADD COLUMN IF NOT EXISTS lote_lancamento_id UUID REFERENCES public.lotes_lancamento_iptu(id),
  ADD COLUMN IF NOT EXISTS taxa_expediente DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxa_limpeza DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxa_iluminacao DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS isencao_percentual DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_isento DECIMAL(15,2) DEFAULT 0;

-- =============================================
-- ADICIONAR COLUNAS EM IPTU_PARCELAS  
-- =============================================
ALTER TABLE public.iptu_parcelas
  ADD COLUMN IF NOT EXISTS codigo_barras TEXT,
  ADD COLUMN IF NOT EXISTS linha_digitavel TEXT,
  ADD COLUMN IF NOT EXISTS qrcode_pix TEXT,
  ADD COLUMN IF NOT EXISTS multa DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS juros DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correcao DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS honorarios DECIMAL(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS inscrito_divida_ativa BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS divida_ativa_id UUID REFERENCES public.divida_ativa(id);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_imoveis_inscricao ON public.imoveis(inscricao_imobiliaria);
CREATE INDEX IF NOT EXISTS idx_imoveis_bairro ON public.imoveis(bairro);
CREATE INDEX IF NOT EXISTS idx_imoveis_contribuinte ON public.imoveis(contribuinte_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON public.imoveis(status);
CREATE INDEX IF NOT EXISTS idx_historico_valores_imovel ON public.historico_valores_venais(imovel_id, exercicio);
CREATE INDEX IF NOT EXISTS idx_historico_proprietarios_imovel ON public.historico_proprietarios(imovel_id);
CREATE INDEX IF NOT EXISTS idx_revisoes_protocolo ON public.revisoes_iptu(protocolo);
CREATE INDEX IF NOT EXISTS idx_revisoes_status ON public.revisoes_iptu(status);
CREATE INDEX IF NOT EXISTS idx_pgv_logradouro ON public.planta_generica_valores(codigo_logradouro, exercicio);
CREATE INDEX IF NOT EXISTS idx_carnes_lancamento ON public.carnes_iptu(lancamento_id);
CREATE INDEX IF NOT EXISTS idx_consultas_cpf ON public.consultas_cidadao(cpf_cnpj);

-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.planta_generica_valores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatores_correcao_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.padroes_construtivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_valores_venais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_proprietarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revisoes_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_lancamento_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_lancamento_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carnes_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baixas_manuais_iptu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.config_inadimplencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas_cidadao ENABLE ROW LEVEL SECURITY;

-- Políticas para admin e secretaria financeira
CREATE POLICY "Admin e Financeiro podem gerenciar PGV" ON public.planta_generica_valores
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin e Financeiro podem gerenciar fatores" ON public.fatores_correcao_iptu
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin e Financeiro podem gerenciar padrões" ON public.padroes_construtivos
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin e Financeiro podem ver histórico valores" ON public.historico_valores_venais
  FOR ALL USING (true);

CREATE POLICY "Admin e Financeiro podem gerenciar histórico proprietários" ON public.historico_proprietarios
  FOR ALL USING (true);

CREATE POLICY "Admin e Financeiro podem gerenciar revisões" ON public.revisoes_iptu
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin e Financeiro podem gerenciar config lançamento" ON public.config_lancamento_iptu
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin e Financeiro podem gerenciar lotes" ON public.lotes_lancamento_iptu
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Acesso a carnês" ON public.carnes_iptu
  FOR ALL USING (true);

CREATE POLICY "Admin pode gerenciar baixas manuais" ON public.baixas_manuais_iptu
  FOR ALL USING (public.is_admin_municipal(auth.uid()));

CREATE POLICY "Admin e Financeiro podem gerenciar config inadimplência" ON public.config_inadimplencia
  FOR ALL USING (
    public.is_admin_municipal(auth.uid()) OR 
    public.has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Consultas cidadão são públicas para inserção" ON public.consultas_cidadao
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin pode ver consultas cidadão" ON public.consultas_cidadao
  FOR SELECT USING (public.is_admin_municipal(auth.uid()));

-- =============================================
-- TRIGGERS PARA AUDITORIA
-- =============================================
CREATE TRIGGER trigger_audit_planta_generica
  AFTER INSERT OR UPDATE OR DELETE ON public.planta_generica_valores
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER trigger_audit_revisoes_iptu
  AFTER INSERT OR UPDATE OR DELETE ON public.revisoes_iptu
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER trigger_audit_historico_proprietarios
  AFTER INSERT OR UPDATE OR DELETE ON public.historico_proprietarios
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER trigger_audit_baixas_manuais
  AFTER INSERT OR UPDATE OR DELETE ON public.baixas_manuais_iptu
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

-- Triggers para updated_at
CREATE TRIGGER update_planta_generica_valores_updated_at
  BEFORE UPDATE ON public.planta_generica_valores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_revisoes_iptu_updated_at
  BEFORE UPDATE ON public.revisoes_iptu
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_lancamento_iptu_updated_at
  BEFORE UPDATE ON public.config_lancamento_iptu
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_config_inadimplencia_updated_at
  BEFORE UPDATE ON public.config_inadimplencia
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();