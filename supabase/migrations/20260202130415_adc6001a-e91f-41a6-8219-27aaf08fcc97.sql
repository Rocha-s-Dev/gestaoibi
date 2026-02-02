-- =============================================
-- MÓDULO DE ARRECADAÇÃO TRIBUTÁRIA MUNICIPAL
-- =============================================

-- Enums para o módulo tributário
CREATE TYPE public.tipo_contribuinte AS ENUM (
  'pessoa_fisica',
  'pessoa_juridica'
);

CREATE TYPE public.status_imovel AS ENUM (
  'ativo',
  'inativo',
  'isento',
  'imune'
);

CREATE TYPE public.tipo_uso_imovel AS ENUM (
  'residencial',
  'comercial',
  'industrial',
  'misto',
  'territorial'
);

CREATE TYPE public.status_iss AS ENUM (
  'ativo',
  'suspenso',
  'baixado',
  'isento'
);

CREATE TYPE public.regime_tributacao AS ENUM (
  'simples_nacional',
  'lucro_presumido',
  'lucro_real',
  'mei'
);

CREATE TYPE public.status_debito AS ENUM (
  'em_aberto',
  'vencido',
  'pago',
  'parcelado',
  'inscrito_divida_ativa',
  'executado',
  'prescrito',
  'cancelado'
);

CREATE TYPE public.tipo_tributo AS ENUM (
  'iptu',
  'iss',
  'itbi',
  'taxas',
  'contribuicao_melhoria',
  'multas',
  'outros'
);

CREATE TYPE public.status_divida_ativa AS ENUM (
  'inscrita',
  'parcelada',
  'em_execucao',
  'suspensa',
  'quitada',
  'prescrita',
  'cancelada'
);

CREATE TYPE public.status_parcelamento AS ENUM (
  'ativo',
  'em_dia',
  'atrasado',
  'rescindido',
  'quitado'
);

CREATE TYPE public.tipo_fiscalizacao AS ENUM (
  'programada',
  'denuncia',
  'oficio',
  'revisao'
);

CREATE TYPE public.status_fiscalizacao AS ENUM (
  'agendada',
  'em_andamento',
  'concluida',
  'cancelada'
);

CREATE TYPE public.forma_pagamento AS ENUM (
  'boleto',
  'pix',
  'cartao_credito',
  'cartao_debito',
  'dinheiro',
  'debito_automatico'
);

-- =============================================
-- TABELA DE CONTRIBUINTES
-- =============================================
CREATE TABLE public.contribuintes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Identificação
  tipo tipo_contribuinte NOT NULL,
  cpf_cnpj TEXT NOT NULL UNIQUE,
  nome_razao_social TEXT NOT NULL,
  nome_fantasia TEXT,
  inscricao_municipal TEXT UNIQUE,
  
  -- Contato
  email TEXT,
  telefone TEXT,
  celular TEXT,
  
  -- Endereço
  cep TEXT,
  logradouro TEXT,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT,
  uf TEXT,
  
  -- Dados PJ
  cnae_principal TEXT,
  data_abertura DATE,
  natureza_juridica TEXT,
  
  -- Dados PF
  data_nascimento DATE,
  rg TEXT,
  
  -- Status
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- IPTU - CADASTRO IMOBILIÁRIO
-- =============================================
CREATE TABLE public.imoveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id) ON DELETE SET NULL,
  
  -- Identificação
  inscricao_imobiliaria TEXT NOT NULL UNIQUE,
  matricula_cartorio TEXT,
  
  -- Localização
  cep TEXT,
  logradouro TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT NOT NULL,
  quadra TEXT,
  lote TEXT,
  distrito TEXT,
  setor TEXT,
  
  -- Características
  tipo_uso tipo_uso_imovel DEFAULT 'residencial',
  area_terreno DECIMAL(12,2),
  area_construida DECIMAL(12,2),
  testada DECIMAL(8,2),
  profundidade DECIMAL(8,2),
  
  -- Avaliação
  valor_venal_terreno DECIMAL(14,2),
  valor_venal_construcao DECIMAL(14,2),
  valor_venal_total DECIMAL(14,2),
  aliquota_iptu DECIMAL(6,4) DEFAULT 0.01,
  
  -- Status
  status status_imovel DEFAULT 'ativo',
  data_cadastro DATE DEFAULT CURRENT_DATE,
  motivo_isencao TEXT,
  
  -- Coordenadas GPS
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Lançamentos de IPTU
CREATE TABLE public.iptu_lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE CASCADE NOT NULL,
  contribuinte_id UUID REFERENCES public.contribuintes(id),
  exercicio INTEGER NOT NULL,
  
  -- Valores calculados
  valor_venal DECIMAL(14,2) NOT NULL,
  aliquota DECIMAL(6,4) NOT NULL,
  valor_iptu DECIMAL(12,2) NOT NULL,
  valor_taxas DECIMAL(12,2) DEFAULT 0,
  valor_total DECIMAL(12,2) NOT NULL,
  
  -- Descontos
  desconto_cota_unica DECIMAL(6,4) DEFAULT 0.10,
  valor_cota_unica DECIMAL(12,2),
  
  -- Parcelamento
  numero_parcelas INTEGER DEFAULT 10,
  
  -- Status
  status status_debito DEFAULT 'em_aberto',
  data_lancamento DATE DEFAULT CURRENT_DATE,
  data_vencimento_cota_unica DATE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(imovel_id, exercicio)
);

-- Parcelas do IPTU
CREATE TABLE public.iptu_parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lancamento_id UUID REFERENCES public.iptu_lancamentos(id) ON DELETE CASCADE NOT NULL,
  
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  
  -- Pagamento
  valor_pago DECIMAL(12,2),
  data_pagamento DATE,
  forma_pagamento forma_pagamento,
  
  -- Multa e juros
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_correcao DECIMAL(12,2) DEFAULT 0,
  valor_total_pago DECIMAL(12,2),
  
  -- Código de barras/PIX
  codigo_barras TEXT,
  pix_copia_cola TEXT,
  
  status status_debito DEFAULT 'em_aberto',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ISS - IMPOSTO SOBRE SERVIÇOS
-- =============================================
CREATE TABLE public.iss_contribuintes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribuinte_id UUID REFERENCES public.contribuintes(id) ON DELETE CASCADE NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Dados específicos ISS
  inscricao_municipal TEXT UNIQUE,
  regime_tributacao regime_tributacao NOT NULL,
  
  -- Atividades
  cnae_principal TEXT NOT NULL,
  cnae_secundarios TEXT[],
  descricao_atividade TEXT,
  
  -- Alíquota
  aliquota_iss DECIMAL(6,4) DEFAULT 0.05,
  codigo_servico TEXT,
  
  -- Retenção
  retencao_iss BOOLEAN DEFAULT false,
  
  -- Status
  status status_iss DEFAULT 'ativo',
  data_inicio_atividade DATE,
  data_encerramento DATE,
  motivo_encerramento TEXT,
  
  -- Simples Nacional
  simples_nacional BOOLEAN DEFAULT false,
  data_opcao_simples DATE,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notas Fiscais de Serviço Eletrônicas
CREATE TABLE public.nfse (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iss_contribuinte_id UUID REFERENCES public.iss_contribuintes(id) ON DELETE CASCADE NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Identificação da NFS-e
  numero_nfse SERIAL,
  codigo_verificacao TEXT NOT NULL,
  competencia DATE NOT NULL,
  
  -- Prestador
  prestador_cpf_cnpj TEXT NOT NULL,
  prestador_razao_social TEXT NOT NULL,
  
  -- Tomador
  tomador_cpf_cnpj TEXT,
  tomador_razao_social TEXT,
  tomador_email TEXT,
  tomador_endereco TEXT,
  
  -- Serviço
  codigo_servico TEXT NOT NULL,
  descricao_servico TEXT NOT NULL,
  
  -- Valores
  valor_servicos DECIMAL(14,2) NOT NULL,
  valor_deducoes DECIMAL(14,2) DEFAULT 0,
  base_calculo DECIMAL(14,2) NOT NULL,
  aliquota DECIMAL(6,4) NOT NULL,
  valor_iss DECIMAL(12,2) NOT NULL,
  valor_liquido DECIMAL(14,2) NOT NULL,
  
  -- Retenções
  iss_retido BOOLEAN DEFAULT false,
  valor_pis DECIMAL(12,2) DEFAULT 0,
  valor_cofins DECIMAL(12,2) DEFAULT 0,
  valor_inss DECIMAL(12,2) DEFAULT 0,
  valor_ir DECIMAL(12,2) DEFAULT 0,
  valor_csll DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'emitida',
  data_emissao TIMESTAMPTZ DEFAULT now(),
  data_cancelamento TIMESTAMPTZ,
  motivo_cancelamento TEXT,
  
  -- XML
  xml_nfse TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Guia de ISS
CREATE TABLE public.iss_guias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iss_contribuinte_id UUID REFERENCES public.iss_contribuintes(id) ON DELETE CASCADE NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Identificação
  numero_guia SERIAL,
  competencia DATE NOT NULL,
  
  -- Valores
  valor_servicos DECIMAL(14,2) NOT NULL,
  valor_deducoes DECIMAL(14,2) DEFAULT 0,
  base_calculo DECIMAL(14,2) NOT NULL,
  aliquota DECIMAL(6,4) NOT NULL,
  valor_iss DECIMAL(12,2) NOT NULL,
  
  -- Vencimento
  data_vencimento DATE NOT NULL,
  
  -- Pagamento
  valor_pago DECIMAL(12,2),
  data_pagamento DATE,
  forma_pagamento forma_pagamento,
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_total_pago DECIMAL(12,2),
  
  -- Códigos
  codigo_barras TEXT,
  pix_copia_cola TEXT,
  
  status status_debito DEFAULT 'em_aberto',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- DÍVIDA ATIVA
-- =============================================
CREATE TABLE public.divida_ativa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id) ON DELETE CASCADE NOT NULL,
  
  -- Identificação
  numero_inscricao TEXT NOT NULL UNIQUE,
  numero_cda TEXT, -- Certidão de Dívida Ativa
  
  -- Origem
  tipo_tributo tipo_tributo NOT NULL,
  exercicio INTEGER NOT NULL,
  origem_id UUID, -- ID do débito original (iptu_parcela, iss_guia, etc)
  origem_tabela TEXT,
  
  -- Valores
  valor_principal DECIMAL(14,2) NOT NULL,
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_correcao DECIMAL(12,2) DEFAULT 0,
  valor_honorarios DECIMAL(12,2) DEFAULT 0,
  valor_custas DECIMAL(12,2) DEFAULT 0,
  valor_total DECIMAL(14,2) NOT NULL,
  
  -- Datas
  data_inscricao DATE DEFAULT CURRENT_DATE,
  data_vencimento_original DATE,
  
  -- Status
  status status_divida_ativa DEFAULT 'inscrita',
  
  -- Execução fiscal
  numero_processo_judicial TEXT,
  data_ajuizamento DATE,
  vara_juizo TEXT,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PARCELAMENTOS E REFIS
-- =============================================
CREATE TABLE public.programas_refis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  
  -- Identificação
  nome TEXT NOT NULL,
  lei_numero TEXT,
  decreto_numero TEXT,
  
  -- Vigência
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  
  -- Benefícios
  desconto_multa DECIMAL(6,4) DEFAULT 0,
  desconto_juros DECIMAL(6,4) DEFAULT 0,
  desconto_correcao DECIMAL(6,4) DEFAULT 0,
  desconto_honorarios DECIMAL(6,4) DEFAULT 0,
  
  -- Condições
  parcelas_minima INTEGER DEFAULT 2,
  parcelas_maxima INTEGER DEFAULT 60,
  valor_parcela_minima DECIMAL(12,2) DEFAULT 50,
  entrada_minima DECIMAL(6,4) DEFAULT 0.10,
  
  -- Tipos incluídos
  tributos_incluidos tipo_tributo[] DEFAULT ARRAY['iptu', 'iss', 'taxas']::tipo_tributo[],
  
  ativo BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.parcelamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id) ON DELETE CASCADE NOT NULL,
  programa_refis_id UUID REFERENCES public.programas_refis(id),
  
  -- Identificação
  numero_termo TEXT NOT NULL UNIQUE,
  
  -- Débitos incluídos
  dividas_ativas_ids UUID[],
  debitos_ids UUID[],
  
  -- Valores originais
  valor_principal DECIMAL(14,2) NOT NULL,
  valor_multa_original DECIMAL(12,2) DEFAULT 0,
  valor_juros_original DECIMAL(12,2) DEFAULT 0,
  valor_correcao_original DECIMAL(12,2) DEFAULT 0,
  valor_total_original DECIMAL(14,2) NOT NULL,
  
  -- Descontos aplicados
  desconto_multa DECIMAL(12,2) DEFAULT 0,
  desconto_juros DECIMAL(12,2) DEFAULT 0,
  desconto_correcao DECIMAL(12,2) DEFAULT 0,
  
  -- Valor final
  valor_total_parcelado DECIMAL(14,2) NOT NULL,
  
  -- Parcelamento
  numero_parcelas INTEGER NOT NULL,
  valor_entrada DECIMAL(12,2) DEFAULT 0,
  valor_parcela DECIMAL(12,2) NOT NULL,
  
  -- Datas
  data_adesao DATE DEFAULT CURRENT_DATE,
  dia_vencimento INTEGER DEFAULT 10,
  
  -- Status
  status status_parcelamento DEFAULT 'ativo',
  parcelas_pagas INTEGER DEFAULT 0,
  parcelas_atrasadas INTEGER DEFAULT 0,
  
  -- Rescisão
  data_rescisao DATE,
  motivo_rescisao TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.parcelamento_parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcelamento_id UUID REFERENCES public.parcelamentos(id) ON DELETE CASCADE NOT NULL,
  
  numero_parcela INTEGER NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  
  -- Pagamento
  valor_pago DECIMAL(12,2),
  data_pagamento DATE,
  forma_pagamento forma_pagamento,
  
  -- Encargos
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_total_pago DECIMAL(12,2),
  
  -- Códigos
  codigo_barras TEXT,
  pix_copia_cola TEXT,
  
  status status_debito DEFAULT 'em_aberto',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FISCALIZAÇÃO
-- =============================================
CREATE TABLE public.fiscalizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id),
  imovel_id UUID REFERENCES public.imoveis(id),
  
  -- Identificação
  numero_ordem_servico TEXT NOT NULL UNIQUE,
  tipo tipo_fiscalizacao NOT NULL,
  
  -- Fiscal responsável
  fiscal_id UUID REFERENCES public.profiles(id),
  fiscal_nome TEXT,
  
  -- Agendamento
  data_agendada DATE,
  hora_agendada TIME,
  
  -- Execução
  data_inicio TIMESTAMPTZ,
  data_fim TIMESTAMPTZ,
  
  -- Localização GPS (para mobile)
  latitude_inicio DECIMAL(10,8),
  longitude_inicio DECIMAL(11,8),
  latitude_fim DECIMAL(10,8),
  longitude_fim DECIMAL(11,8),
  
  -- Resultado
  status status_fiscalizacao DEFAULT 'agendada',
  situacao_encontrada TEXT,
  irregularidades_detectadas TEXT[],
  fotos_urls TEXT[],
  
  -- Auto de infração
  auto_infracao BOOLEAN DEFAULT false,
  numero_auto_infracao TEXT,
  valor_multa DECIMAL(12,2),
  
  -- Observações
  observacoes TEXT,
  assinatura_fiscal TEXT,
  assinatura_contribuinte TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PAGAMENTOS
-- =============================================
CREATE TABLE public.pagamentos_tributarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  contribuinte_id UUID REFERENCES public.contribuintes(id),
  
  -- Origem do pagamento
  tipo_origem TEXT NOT NULL, -- iptu_parcela, iss_guia, parcelamento_parcela, divida_ativa
  origem_id UUID NOT NULL,
  
  -- Valores
  valor_original DECIMAL(14,2) NOT NULL,
  valor_multa DECIMAL(12,2) DEFAULT 0,
  valor_juros DECIMAL(12,2) DEFAULT 0,
  valor_desconto DECIMAL(12,2) DEFAULT 0,
  valor_total DECIMAL(14,2) NOT NULL,
  
  -- Pagamento
  forma_pagamento forma_pagamento NOT NULL,
  data_pagamento TIMESTAMPTZ DEFAULT now(),
  
  -- Identificadores externos
  codigo_barras TEXT,
  pix_txid TEXT,
  pix_e2e TEXT,
  cartao_nsu TEXT,
  cartao_autorizacao TEXT,
  
  -- Lote bancário
  arquivo_retorno TEXT,
  data_credito DATE,
  
  -- Comprovante
  comprovante_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_contribuintes_cpf_cnpj ON public.contribuintes(cpf_cnpj);
CREATE INDEX idx_contribuintes_inscricao ON public.contribuintes(inscricao_municipal);
CREATE INDEX idx_imoveis_inscricao ON public.imoveis(inscricao_imobiliaria);
CREATE INDEX idx_imoveis_contribuinte ON public.imoveis(contribuinte_id);
CREATE INDEX idx_iptu_exercicio ON public.iptu_lancamentos(exercicio);
CREATE INDEX idx_iptu_imovel ON public.iptu_lancamentos(imovel_id);
CREATE INDEX idx_nfse_competencia ON public.nfse(competencia);
CREATE INDEX idx_nfse_prestador ON public.nfse(prestador_cpf_cnpj);
CREATE INDEX idx_divida_contribuinte ON public.divida_ativa(contribuinte_id);
CREATE INDEX idx_divida_status ON public.divida_ativa(status);
CREATE INDEX idx_fiscalizacao_fiscal ON public.fiscalizacoes(fiscal_id);
CREATE INDEX idx_fiscalizacao_data ON public.fiscalizacoes(data_agendada);
CREATE INDEX idx_pagamentos_data ON public.pagamentos_tributarios(data_pagamento);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.contribuintes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iptu_lancamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iptu_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iss_contribuintes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nfse ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iss_guias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divida_ativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas_refis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelamento_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscalizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos_tributarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admin access contribuintes" ON public.contribuintes
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access imoveis" ON public.imoveis
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access iptu_lancamentos" ON public.iptu_lancamentos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin access iptu_parcelas" ON public.iptu_parcelas
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin access iss_contribuintes" ON public.iss_contribuintes
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access nfse" ON public.nfse
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access iss_guias" ON public.iss_guias
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access divida_ativa" ON public.divida_ativa
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access programas_refis" ON public.programas_refis
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access parcelamentos" ON public.parcelamentos
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

CREATE POLICY "Admin access parcelamento_parcelas" ON public.parcelamento_parcelas
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin access fiscalizacoes" ON public.fiscalizacoes
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id) OR
    fiscal_id = auth.uid()
  );

CREATE POLICY "Admin access pagamentos_tributarios" ON public.pagamentos_tributarios
  FOR ALL USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_secretaria_access(auth.uid(), secretaria_id)
  );

-- Triggers de updated_at
CREATE TRIGGER update_contribuintes_updated_at
  BEFORE UPDATE ON public.contribuintes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iptu_lancamentos_updated_at
  BEFORE UPDATE ON public.iptu_lancamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iptu_parcelas_updated_at
  BEFORE UPDATE ON public.iptu_parcelas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iss_contribuintes_updated_at
  BEFORE UPDATE ON public.iss_contribuintes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nfse_updated_at
  BEFORE UPDATE ON public.nfse
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_iss_guias_updated_at
  BEFORE UPDATE ON public.iss_guias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divida_ativa_updated_at
  BEFORE UPDATE ON public.divida_ativa
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_programas_refis_updated_at
  BEFORE UPDATE ON public.programas_refis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcelamentos_updated_at
  BEFORE UPDATE ON public.parcelamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_parcelamento_parcelas_updated_at
  BEFORE UPDATE ON public.parcelamento_parcelas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fiscalizacoes_updated_at
  BEFORE UPDATE ON public.fiscalizacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();