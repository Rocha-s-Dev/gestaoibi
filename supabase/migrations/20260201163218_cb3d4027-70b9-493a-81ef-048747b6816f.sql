
-- =========================================
-- GESTÃO FINANCEIRA PÚBLICA COMPLETA - CORRIGIDO
-- =========================================

-- =========================================
-- PARTE 0: TABELAS PREREQUISITO
-- =========================================

-- Fornecedores/Credores
CREATE TABLE public.fornecedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_pessoa VARCHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
  cpf_cnpj VARCHAR(18) NOT NULL UNIQUE,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(10),
  telefone VARCHAR(20),
  email VARCHAR(100),
  inscricao_estadual VARCHAR(20),
  inscricao_municipal VARCHAR(20),
  banco_codigo VARCHAR(10),
  banco_nome VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(20),
  tipo_conta VARCHAR(20),
  pix_chave VARCHAR(100),
  pix_tipo VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura fornecedores" ON public.fornecedores FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin fornecedores" ON public.fornecedores FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));

-- =========================================
-- PARTE 1: PPA, LDO e LOA
-- =========================================

CREATE TABLE public.ppa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  ano_inicio INTEGER NOT NULL,
  ano_fim INTEGER NOT NULL,
  lei_numero VARCHAR(50),
  lei_data DATE,
  descricao TEXT,
  status VARCHAR(20) DEFAULT 'vigente' CHECK (status IN ('elaboracao', 'aprovado', 'vigente', 'encerrado')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ppa_programas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ppa_id UUID REFERENCES public.ppa(id) ON DELETE CASCADE,
  codigo VARCHAR(20) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  objetivo TEXT,
  publico_alvo TEXT,
  indicador VARCHAR(255),
  unidade_medida VARCHAR(50),
  meta_fisica_total DECIMAL(15,2),
  meta_financeira_total DECIMAL(15,2),
  secretaria_id UUID REFERENCES public.secretarias(id),
  status VARCHAR(20) DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ppa_acoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.ppa_programas(id) ON DELETE CASCADE,
  codigo VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('projeto', 'atividade', 'operacao_especial')),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  produto VARCHAR(255),
  unidade_medida VARCHAR(50),
  meta_fisica DECIMAL(15,2),
  meta_financeira DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ldo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  ppa_id UUID REFERENCES public.ppa(id),
  exercicio INTEGER NOT NULL,
  lei_numero VARCHAR(50),
  lei_data DATE,
  meta_resultado_primario DECIMAL(15,2),
  meta_resultado_nominal DECIMAL(15,2),
  limite_despesa_pessoal DECIMAL(5,2),
  limite_divida DECIMAL(15,2),
  prioridades TEXT,
  status VARCHAR(20) DEFAULT 'vigente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ldo_metas_fiscais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ldo_id UUID REFERENCES public.ldo(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  valor_previsto DECIMAL(15,2),
  valor_realizado DECIMAL(15,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.loa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  ldo_id UUID REFERENCES public.ldo(id),
  lei_numero VARCHAR(50),
  lei_data DATE,
  valor_orcamento_fiscal DECIMAL(15,2) DEFAULT 0,
  valor_orcamento_seguridade DECIMAL(15,2) DEFAULT 0,
  valor_orcamento_investimento DECIMAL(15,2) DEFAULT 0,
  valor_total DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'vigente',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 2: CLASSIFICAÇÃO ORÇAMENTÁRIA
-- =========================================

CREATE TABLE public.natureza_receita (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL UNIQUE,
  categoria_economica CHAR(1) NOT NULL,
  origem CHAR(1) NOT NULL,
  especie CHAR(2),
  desdobramento VARCHAR(10),
  tipo VARCHAR(4),
  descricao VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.natureza_despesa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL UNIQUE,
  categoria_economica CHAR(1) NOT NULL,
  grupo CHAR(1) NOT NULL,
  modalidade CHAR(2) NOT NULL,
  elemento VARCHAR(2) NOT NULL,
  subelemento VARCHAR(2),
  descricao VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.fonte_recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(20) NOT NULL UNIQUE,
  descricao VARCHAR(255) NOT NULL,
  tipo VARCHAR(30) CHECK (tipo IN ('tesouro', 'transferencias', 'recursos_proprios', 'operacoes_credito', 'outros')),
  vinculacao VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.funcao_subfuncao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_funcao VARCHAR(2) NOT NULL,
  nome_funcao VARCHAR(100) NOT NULL,
  codigo_subfuncao VARCHAR(3),
  nome_subfuncao VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.dotacoes_orcamentarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loa_id UUID REFERENCES public.loa(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  unidade_id UUID REFERENCES public.unidades_administrativas(id),
  programa_id UUID REFERENCES public.ppa_programas(id),
  acao_id UUID REFERENCES public.ppa_acoes(id),
  funcao_subfuncao_id UUID REFERENCES public.funcao_subfuncao(id),
  natureza_despesa_id UUID REFERENCES public.natureza_despesa(id),
  fonte_recursos_id UUID REFERENCES public.fonte_recursos(id),
  codigo_reduzido VARCHAR(20),
  valor_inicial DECIMAL(15,2) DEFAULT 0,
  valor_suplementado DECIMAL(15,2) DEFAULT 0,
  valor_anulado DECIMAL(15,2) DEFAULT 0,
  valor_disponivel DECIMAL(15,2) DEFAULT 0,
  valor_empenhado DECIMAL(15,2) DEFAULT 0,
  valor_liquidado DECIMAL(15,2) DEFAULT 0,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 3: EMPENHO, LIQUIDAÇÃO E PAGAMENTO
-- =========================================

CREATE TYPE tipo_empenho AS ENUM ('ordinario', 'estimativo', 'global');
CREATE TYPE status_empenho AS ENUM ('ativo', 'anulado', 'liquidado', 'pago', 'inscrito_rap');

CREATE TABLE public.empenhos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) NOT NULL,
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  dotacao_id UUID REFERENCES public.dotacoes_orcamentarias(id),
  credor_id UUID REFERENCES public.fornecedores(id),
  tipo tipo_empenho NOT NULL DEFAULT 'ordinario',
  data_empenho DATE NOT NULL,
  valor_empenhado DECIMAL(15,2) NOT NULL,
  valor_anulado DECIMAL(15,2) DEFAULT 0,
  valor_liquidado DECIMAL(15,2) DEFAULT 0,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  saldo_empenho DECIMAL(15,2) GENERATED ALWAYS AS (valor_empenhado - valor_anulado) STORED,
  descricao TEXT NOT NULL,
  processo_licitatorio VARCHAR(50),
  contrato_id UUID REFERENCES public.contracts(id),
  status status_empenho DEFAULT 'ativo',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.empenhos_anulacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empenho_id UUID REFERENCES public.empenhos(id) ON DELETE CASCADE,
  data_anulacao DATE NOT NULL,
  valor_anulado DECIMAL(15,2) NOT NULL,
  motivo TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.liquidacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empenho_id UUID REFERENCES public.empenhos(id),
  numero VARCHAR(20) NOT NULL,
  data_liquidacao DATE NOT NULL,
  valor_liquidado DECIMAL(15,2) NOT NULL,
  documento_fiscal VARCHAR(50),
  tipo_documento VARCHAR(30),
  data_documento DATE,
  atesto TEXT,
  data_atesto DATE,
  responsavel_atesto UUID REFERENCES public.profiles(id),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'pago', 'estornado')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.retencoes_legais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  liquidacao_id UUID REFERENCES public.liquidacoes(id),
  tipo VARCHAR(50) NOT NULL,
  base_calculo DECIMAL(15,2),
  aliquota DECIMAL(5,4),
  valor_retido DECIMAL(15,2) NOT NULL,
  codigo_receita VARCHAR(20),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ordens_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(20) NOT NULL,
  liquidacao_id UUID REFERENCES public.liquidacoes(id),
  data_ordem DATE NOT NULL,
  valor_bruto DECIMAL(15,2) NOT NULL,
  valor_retencoes DECIMAL(15,2) DEFAULT 0,
  valor_liquido DECIMAL(15,2) NOT NULL,
  conta_bancaria_id UUID,
  data_pagamento DATE,
  comprovante_pagamento VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'autorizado', 'pago', 'cancelado')),
  autorizado_por UUID REFERENCES public.profiles(id),
  data_autorizacao TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 4: RESTOS A PAGAR
-- =========================================

CREATE TYPE tipo_resto_pagar AS ENUM ('processado', 'nao_processado');
CREATE TYPE status_resto_pagar AS ENUM ('inscrito', 'pago', 'cancelado', 'prescrito');

CREATE TABLE public.restos_a_pagar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empenho_id UUID REFERENCES public.empenhos(id),
  exercicio_origem INTEGER NOT NULL,
  tipo tipo_resto_pagar NOT NULL,
  valor_inscrito DECIMAL(15,2) NOT NULL,
  valor_cancelado DECIMAL(15,2) DEFAULT 0,
  valor_pago DECIMAL(15,2) DEFAULT 0,
  saldo DECIMAL(15,2) GENERATED ALWAYS AS (valor_inscrito - valor_cancelado - valor_pago) STORED,
  data_inscricao DATE NOT NULL,
  data_cancelamento DATE,
  data_pagamento DATE,
  motivo_cancelamento TEXT,
  status status_resto_pagar DEFAULT 'inscrito',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 5: CONVÊNIOS
-- =========================================

CREATE TYPE tipo_convenio AS ENUM ('recebido', 'concedido');
CREATE TYPE status_convenio AS ENUM ('vigente', 'encerrado', 'rescindido', 'em_prestacao');

CREATE TABLE public.convenios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(50) NOT NULL,
  ano INTEGER NOT NULL,
  tipo tipo_convenio NOT NULL,
  concedente VARCHAR(255) NOT NULL,
  convenente VARCHAR(255) NOT NULL,
  objeto TEXT NOT NULL,
  valor_total DECIMAL(15,2) NOT NULL,
  valor_repasse DECIMAL(15,2) NOT NULL,
  valor_contrapartida DECIMAL(15,2) DEFAULT 0,
  data_assinatura DATE NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_prestacao_contas DATE,
  secretaria_id UUID REFERENCES public.secretarias(id),
  conta_bancaria_especifica VARCHAR(50),
  banco VARCHAR(100),
  agencia VARCHAR(20),
  status status_convenio DEFAULT 'vigente',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.convenios_parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convenio_id UUID REFERENCES public.convenios(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  data_prevista DATE NOT NULL,
  data_recebimento DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'recebido', 'atrasado')),
  comprovante VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.convenios_prestacao_contas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  convenio_id UUID REFERENCES public.convenios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) CHECK (tipo IN ('parcial', 'final')),
  data_prestacao DATE NOT NULL,
  valor_prestado DECIMAL(15,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'enviado' CHECK (status IN ('elaboracao', 'enviado', 'aprovado', 'reprovado', 'com_ressalvas')),
  parecer TEXT,
  documentos JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 6: CONCILIAÇÃO BANCÁRIA
-- =========================================

CREATE TABLE public.contas_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  banco_codigo VARCHAR(10) NOT NULL,
  banco_nome VARCHAR(100) NOT NULL,
  agencia VARCHAR(20) NOT NULL,
  agencia_digito VARCHAR(2),
  conta VARCHAR(20) NOT NULL,
  conta_digito VARCHAR(2),
  tipo VARCHAR(30) CHECK (tipo IN ('corrente', 'poupanca', 'aplicacao', 'vinculada')),
  finalidade VARCHAR(100),
  fonte_recurso_id UUID REFERENCES public.fonte_recursos(id),
  saldo_atual DECIMAL(15,2) DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.movimentacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.contas_bancarias(id),
  data_movimento DATE NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('credito', 'debito')),
  valor DECIMAL(15,2) NOT NULL,
  descricao TEXT NOT NULL,
  documento VARCHAR(50),
  origem VARCHAR(30) CHECK (origem IN ('sistema', 'extrato', 'manual')),
  ordem_pagamento_id UUID REFERENCES public.ordens_pagamento(id),
  conciliado BOOLEAN DEFAULT false,
  data_conciliacao DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conciliacoes_bancarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conta_id UUID REFERENCES public.contas_bancarias(id),
  competencia DATE NOT NULL,
  saldo_extrato DECIMAL(15,2) NOT NULL,
  saldo_sistema DECIMAL(15,2) NOT NULL,
  diferenca DECIMAL(15,2) GENERATED ALWAYS AS (saldo_extrato - saldo_sistema) STORED,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'conciliado', 'divergente')),
  observacoes TEXT,
  conciliado_por UUID REFERENCES public.profiles(id),
  data_conciliacao TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.conciliacao_pendencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conciliacao_id UUID REFERENCES public.conciliacoes_bancarias(id) ON DELETE CASCADE,
  tipo VARCHAR(30) CHECK (tipo IN ('credito_pendente', 'debito_pendente', 'cheque_transito', 'taxa_bancaria', 'erro_lancamento')),
  valor DECIMAL(15,2) NOT NULL,
  descricao TEXT,
  movimentacao_id UUID REFERENCES public.movimentacoes_bancarias(id),
  resolvido BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 7: INTEGRAÇÃO COM RH E CONTRATOS
-- =========================================

ALTER TABLE public.folha_pagamento 
ADD COLUMN IF NOT EXISTS empenho_id UUID REFERENCES public.empenhos(id),
ADD COLUMN IF NOT EXISTS dotacao_id UUID REFERENCES public.dotacoes_orcamentarias(id);

ALTER TABLE public.contracts
ADD COLUMN IF NOT EXISTS modalidade_licitacao VARCHAR(50),
ADD COLUMN IF NOT EXISTS numero_licitacao VARCHAR(50),
ADD COLUMN IF NOT EXISTS dotacao_id UUID REFERENCES public.dotacoes_orcamentarias(id),
ADD COLUMN IF NOT EXISTS fonte_recursos_id UUID REFERENCES public.fonte_recursos(id),
ADD COLUMN IF NOT EXISTS programa_trabalho VARCHAR(100);

CREATE TABLE public.contratos_aditivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  numero_aditivo INTEGER NOT NULL,
  tipo VARCHAR(50) CHECK (tipo IN ('prazo', 'valor', 'objeto', 'prazo_valor')),
  data_assinatura DATE NOT NULL,
  valor_adicional DECIMAL(15,2) DEFAULT 0,
  prazo_adicional_dias INTEGER DEFAULT 0,
  nova_data_termino DATE,
  justificativa TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================================
-- PARTE 8: RLS POLICIES
-- =========================================

ALTER TABLE public.ppa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppa_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ldo_metas_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natureza_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.natureza_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fonte_recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcao_subfuncao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dotacoes_orcamentarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empenhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empenhos_anulacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liquidacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retencoes_legais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restos_a_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convenios_prestacao_contas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacoes_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conciliacao_pendencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos_aditivos ENABLE ROW LEVEL SECURITY;

-- Policies usando apenas roles válidos
CREATE POLICY "ppa_access" ON public.ppa FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "programas_access" ON public.ppa_programas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "acoes_access" ON public.ppa_acoes FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "ldo_access" ON public.ldo FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "ldo_metas_access" ON public.ldo_metas_fiscais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "loa_access" ON public.loa FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));

CREATE POLICY "natureza_receita_read" ON public.natureza_receita FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "natureza_receita_admin" ON public.natureza_receita FOR ALL USING (public.is_admin_municipal(auth.uid()));
CREATE POLICY "natureza_despesa_read" ON public.natureza_despesa FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "natureza_despesa_admin" ON public.natureza_despesa FOR ALL USING (public.is_admin_municipal(auth.uid()));
CREATE POLICY "fonte_recursos_read" ON public.fonte_recursos FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "fonte_recursos_admin" ON public.fonte_recursos FOR ALL USING (public.is_admin_municipal(auth.uid()));
CREATE POLICY "funcao_subfuncao_read" ON public.funcao_subfuncao FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "funcao_subfuncao_admin" ON public.funcao_subfuncao FOR ALL USING (public.is_admin_municipal(auth.uid()));

CREATE POLICY "dotacoes_access" ON public.dotacoes_orcamentarias FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "empenhos_access" ON public.empenhos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "anulacoes_access" ON public.empenhos_anulacoes FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "liquidacoes_access" ON public.liquidacoes FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "retencoes_access" ON public.retencoes_legais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "ordens_access" ON public.ordens_pagamento FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "rap_access" ON public.restos_a_pagar FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "convenios_access" ON public.convenios FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "parcelas_access" ON public.convenios_parcelas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "prestacao_access" ON public.convenios_prestacao_contas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "contas_access" ON public.contas_bancarias FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "movimentacoes_access" ON public.movimentacoes_bancarias FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "conciliacoes_access" ON public.conciliacoes_bancarias FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "pendencias_access" ON public.conciliacao_pendencias FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "aditivos_access" ON public.contratos_aditivos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));

-- =========================================
-- PARTE 9: TRIGGERS DE AUDITORIA
-- =========================================

CREATE TRIGGER audit_fornecedores AFTER INSERT OR UPDATE OR DELETE ON public.fornecedores FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_ppa AFTER INSERT OR UPDATE OR DELETE ON public.ppa FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_ppa_programas AFTER INSERT OR UPDATE OR DELETE ON public.ppa_programas FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_ldo AFTER INSERT OR UPDATE OR DELETE ON public.ldo FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_loa AFTER INSERT OR UPDATE OR DELETE ON public.loa FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_dotacoes AFTER INSERT OR UPDATE OR DELETE ON public.dotacoes_orcamentarias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_empenhos AFTER INSERT OR UPDATE OR DELETE ON public.empenhos FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_liquidacoes AFTER INSERT OR UPDATE OR DELETE ON public.liquidacoes FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_ordens_pagamento AFTER INSERT OR UPDATE OR DELETE ON public.ordens_pagamento FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_convenios AFTER INSERT OR UPDATE OR DELETE ON public.convenios FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_contas_bancarias AFTER INSERT OR UPDATE OR DELETE ON public.contas_bancarias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();
CREATE TRIGGER audit_conciliacoes AFTER INSERT OR UPDATE OR DELETE ON public.conciliacoes_bancarias FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

-- =========================================
-- PARTE 10: DADOS INICIAIS
-- =========================================

INSERT INTO public.funcao_subfuncao (codigo_funcao, nome_funcao, codigo_subfuncao, nome_subfuncao) VALUES
('01', 'Legislativa', '031', 'Ação Legislativa'),
('04', 'Administração', '122', 'Administração Geral'),
('04', 'Administração', '123', 'Administração Financeira'),
('10', 'Saúde', '301', 'Atenção Básica'),
('10', 'Saúde', '302', 'Assistência Hospitalar'),
('12', 'Educação', '361', 'Ensino Fundamental'),
('12', 'Educação', '365', 'Educação Infantil'),
('15', 'Urbanismo', '451', 'Infra-Estrutura Urbana'),
('28', 'Encargos Especiais', '843', 'Serviço da Dívida');

INSERT INTO public.fonte_recursos (codigo, descricao, tipo) VALUES
('100', 'Recursos Ordinários do Tesouro', 'tesouro'),
('101', 'Transferências do FUNDEB', 'transferencias'),
('114', 'Transferências do SUS', 'transferencias'),
('150', 'Recursos Próprios', 'recursos_proprios'),
('250', 'Convênios Federais', 'transferencias');

INSERT INTO public.natureza_despesa (codigo, categoria_economica, grupo, modalidade, elemento, descricao) VALUES
('3.1.90.11', '3', '1', '90', '11', 'Vencimentos e Vantagens Fixas'),
('3.1.90.13', '3', '1', '90', '13', 'Obrigações Patronais'),
('3.3.90.30', '3', '3', '90', '30', 'Material de Consumo'),
('3.3.90.39', '3', '3', '90', '39', 'Outros Serviços de Terceiros - PJ'),
('4.4.90.51', '4', '4', '90', '51', 'Obras e Instalações'),
('4.4.90.52', '4', '4', '90', '52', 'Equipamentos e Material Permanente');

INSERT INTO public.natureza_receita (codigo, categoria_economica, origem, especie, descricao) VALUES
('1.1.1.2.01', '1', '1', '12', 'IPTU'),
('1.1.1.3.03', '1', '1', '13', 'ISS'),
('1.7.2.1.01', '1', '7', '21', 'Cota-Parte do FPM'),
('1.7.2.4.01', '1', '7', '24', 'Transferências do FUNDEB');
