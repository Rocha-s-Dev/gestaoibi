
-- ================================================
-- SECRETARIA DE TRANSPORTES E TRÂNSITO
-- ================================================

-- Enums
CREATE TYPE public.tipo_veiculo AS ENUM ('leve', 'pesado', 'onibus', 'maquina', 'motocicleta', 'utilitario');
CREATE TYPE public.situacao_veiculo AS ENUM ('ativo', 'manutencao', 'baixado', 'cedido', 'alienado');
CREATE TYPE public.tipo_manutencao AS ENUM ('preventiva', 'corretiva', 'emergencial');
CREATE TYPE public.status_ordem_servico AS ENUM ('aberta', 'em_andamento', 'aguardando_pecas', 'concluida', 'cancelada');
CREATE TYPE public.tipo_linha_transporte AS ENUM ('urbana', 'rural', 'intermunicipal', 'escolar');
CREATE TYPE public.tipo_sinalizacao AS ENUM ('vertical', 'horizontal', 'semaforica', 'eletronica');

-- 1.1 Gestão da Frota Municipal
CREATE TABLE public.veiculos_frota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  placa VARCHAR(10) NOT NULL,
  chassi VARCHAR(30),
  renavam VARCHAR(20),
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(50),
  ano_fabricacao INTEGER,
  ano_modelo INTEGER,
  tipo public.tipo_veiculo NOT NULL,
  cor VARCHAR(30),
  combustivel VARCHAR(30),
  capacidade_tanque NUMERIC(10,2),
  hodometro_atual NUMERIC(12,2) DEFAULT 0,
  secretaria_responsavel_id UUID REFERENCES public.secretarias(id),
  situacao public.situacao_veiculo DEFAULT 'ativo',
  data_aquisicao DATE,
  valor_aquisicao NUMERIC(15,2),
  numero_patrimonio VARCHAR(50),
  data_ultima_revisao DATE,
  km_proxima_revisao NUMERIC(12,2),
  data_vencimento_licenciamento DATE,
  data_vencimento_seguro DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  nome VARCHAR(200) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  cnh_numero VARCHAR(20) NOT NULL,
  cnh_categoria VARCHAR(5) NOT NULL,
  cnh_validade DATE NOT NULL,
  cnh_pontos INTEGER DEFAULT 0,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco TEXT,
  data_admissao DATE,
  vinculo_id UUID REFERENCES public.vinculos_funcionais(id),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.motoristas_veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID REFERENCES public.motoristas(id) NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos_frota(id) NOT NULL,
  data_autorizacao DATE DEFAULT CURRENT_DATE,
  data_revogacao DATE,
  autorizado_por UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(motorista_id, veiculo_id, data_autorizacao)
);

CREATE TABLE public.manutencoes_veiculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID REFERENCES public.veiculos_frota(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  tipo public.tipo_manutencao NOT NULL,
  descricao TEXT NOT NULL,
  km_realizacao NUMERIC(12,2),
  data_entrada DATE NOT NULL,
  data_saida DATE,
  fornecedor_nome VARCHAR(200),
  fornecedor_cnpj VARCHAR(18),
  valor_pecas NUMERIC(15,2) DEFAULT 0,
  valor_mao_obra NUMERIC(15,2) DEFAULT 0,
  valor_total NUMERIC(15,2) DEFAULT 0,
  numero_nota_fiscal VARCHAR(50),
  garantia_dias INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ordens_servico_frota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(30) NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos_frota(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  tipo public.tipo_manutencao NOT NULL,
  status public.status_ordem_servico DEFAULT 'aberta',
  descricao_problema TEXT NOT NULL,
  diagnostico TEXT,
  solucao_aplicada TEXT,
  km_abertura NUMERIC(12,2),
  data_abertura TIMESTAMPTZ DEFAULT now(),
  data_fechamento TIMESTAMPTZ,
  solicitante_id UUID REFERENCES public.profiles(id),
  responsavel_id UUID REFERENCES public.profiles(id),
  prioridade VARCHAR(20) DEFAULT 'normal',
  manutencao_id UUID REFERENCES public.manutencoes_veiculos(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.abastecimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID REFERENCES public.veiculos_frota(id) NOT NULL,
  motorista_id UUID REFERENCES public.motoristas(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_abastecimento TIMESTAMPTZ NOT NULL,
  km_atual NUMERIC(12,2) NOT NULL,
  km_anterior NUMERIC(12,2),
  litros NUMERIC(10,3) NOT NULL,
  valor_litro NUMERIC(10,4) NOT NULL,
  valor_total NUMERIC(15,2) NOT NULL,
  tipo_combustivel VARCHAR(30) NOT NULL,
  posto VARCHAR(100),
  numero_cupom VARCHAR(50),
  media_km_litro NUMERIC(10,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.alertas_frota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_id UUID REFERENCES public.veiculos_frota(id) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  data_limite DATE,
  km_limite NUMERIC(12,2),
  resolvido BOOLEAN DEFAULT false,
  data_resolucao TIMESTAMPTZ,
  resolvido_por UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 1.2 Escalas e Diárias
CREATE TABLE public.escalas_motoristas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID REFERENCES public.motoristas(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  data DATE NOT NULL,
  turno VARCHAR(20),
  hora_inicio TIME,
  hora_fim TIME,
  veiculo_id UUID REFERENCES public.veiculos_frota(id),
  rota TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.diarias_deslocamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  motorista_id UUID REFERENCES public.motoristas(id) NOT NULL,
  veiculo_id UUID REFERENCES public.veiculos_frota(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_saida TIMESTAMPTZ NOT NULL,
  data_retorno TIMESTAMPTZ,
  destino TEXT NOT NULL,
  motivo TEXT NOT NULL,
  km_saida NUMERIC(12,2),
  km_retorno NUMERIC(12,2),
  valor_diaria NUMERIC(10,2),
  numero_diaria VARCHAR(30),
  status VARCHAR(30) DEFAULT 'solicitada',
  aprovador_id UUID REFERENCES public.profiles(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.3 Transporte Público Municipal
CREATE TABLE public.linhas_transporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  codigo VARCHAR(20) NOT NULL,
  nome VARCHAR(200) NOT NULL,
  tipo public.tipo_linha_transporte NOT NULL,
  extensao_km NUMERIC(10,2),
  tempo_estimado_minutos INTEGER,
  tarifa_atual NUMERIC(10,2),
  ativa BOOLEAN DEFAULT true,
  empresa_operadora VARCHAR(200),
  contrato_id UUID REFERENCES public.contracts(id),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.pontos_parada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID REFERENCES public.linhas_transporte(id),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  endereco TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  ordem_na_linha INTEGER,
  acessivel BOOLEAN DEFAULT false,
  possui_abrigo BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.horarios_linhas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linha_id UUID REFERENCES public.linhas_transporte(id) NOT NULL,
  ponto_id UUID REFERENCES public.pontos_parada(id),
  dia_semana INTEGER,
  horario TIME NOT NULL,
  tipo_dia VARCHAR(20) DEFAULT 'util',
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.tarifas_gratuidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  percentual_desconto NUMERIC(5,2),
  valor_fixo NUMERIC(10,2),
  documentacao_exigida TEXT,
  vigencia_inicio DATE,
  vigencia_fim DATE,
  ativa BOOLEAN DEFAULT true,
  base_legal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Trânsito e Mobilidade
CREATE TABLE public.sinalizacao_viaria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  tipo public.tipo_sinalizacao NOT NULL,
  codigo VARCHAR(20),
  descricao TEXT NOT NULL,
  localizacao TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  data_instalacao DATE,
  estado_conservacao VARCHAR(30) DEFAULT 'bom',
  ultima_manutencao DATE,
  proxima_manutencao DATE,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.semaforos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  codigo VARCHAR(30) NOT NULL,
  localizacao TEXT NOT NULL,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  tipo VARCHAR(50),
  fabricante VARCHAR(100),
  data_instalacao DATE,
  tempo_ciclo_segundos INTEGER,
  sincronizado BOOLEAN DEFAULT false,
  estado VARCHAR(30) DEFAULT 'operando',
  ultima_manutencao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ocorrencias_transito (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  numero VARCHAR(30),
  data_ocorrencia TIMESTAMPTZ NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  localizacao TEXT NOT NULL,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  descricao TEXT,
  veiculos_envolvidos INTEGER DEFAULT 0,
  vitimas INTEGER DEFAULT 0,
  vitimas_fatais INTEGER DEFAULT 0,
  agente_responsavel VARCHAR(200),
  boletim_ocorrencia VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.campanhas_educativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  publico_alvo TEXT,
  data_inicio DATE,
  data_fim DATE,
  orcamento NUMERIC(15,2),
  contrato_id UUID REFERENCES public.contracts(id),
  responsavel_id UUID REFERENCES public.profiles(id),
  status VARCHAR(30) DEFAULT 'planejada',
  resultados TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- SECRETARIA DE AGRICULTURA, PECUÁRIA E ABASTECIMENTO
-- ================================================

CREATE TYPE public.tipo_propriedade_rural AS ENUM ('pequena', 'media', 'grande', 'assentamento', 'quilombola', 'indigena');
CREATE TYPE public.tipo_cultura AS ENUM ('temporaria', 'permanente', 'hortifruti', 'pastagem', 'florestal');
CREATE TYPE public.tipo_incentivo_rural AS ENUM ('insumos', 'maquinario', 'financeiro', 'assistencia', 'logistico');

-- 2.1 Cadastro Rural Integrado
CREATE TABLE public.produtores_rurais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  inscricao_estadual VARCHAR(30),
  dap_numero VARCHAR(50),
  dap_validade DATE,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco TEXT,
  banco VARCHAR(50),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.propriedades_rurais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produtor_id UUID REFERENCES public.produtores_rurais(id) NOT NULL,
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  codigo_car VARCHAR(50),
  matricula_imovel VARCHAR(50),
  area_total_hectares NUMERIC(15,4) NOT NULL,
  area_cultivavel_hectares NUMERIC(15,4),
  area_reserva_legal_hectares NUMERIC(15,4),
  area_app_hectares NUMERIC(15,4),
  tipo public.tipo_propriedade_rural,
  localizacao TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  possui_energia BOOLEAN DEFAULT true,
  possui_agua_encanada BOOLEAN DEFAULT false,
  acesso VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.culturas_safra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID REFERENCES public.propriedades_rurais(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  safra VARCHAR(20) NOT NULL,
  cultura VARCHAR(100) NOT NULL,
  tipo public.tipo_cultura NOT NULL,
  area_plantada_hectares NUMERIC(10,4),
  producao_estimada_toneladas NUMERIC(15,4),
  producao_real_toneladas NUMERIC(15,4),
  valor_estimado NUMERIC(15,2),
  valor_real NUMERIC(15,2),
  data_plantio DATE,
  data_colheita_prevista DATE,
  data_colheita_real DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Assistência Técnica e Extensão Rural
CREATE TABLE public.visitas_tecnicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID REFERENCES public.propriedades_rurais(id) NOT NULL,
  tecnico_id UUID REFERENCES public.profiles(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_visita TIMESTAMPTZ NOT NULL,
  tipo_atendimento VARCHAR(50),
  objetivo TEXT,
  descricao_atendimento TEXT,
  recomendacoes TEXT,
  proxima_visita DATE,
  cultura_acompanhada VARCHAR(100),
  status VARCHAR(30) DEFAULT 'realizada',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.laudos_tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES public.visitas_tecnicas(id),
  propriedade_id UUID REFERENCES public.propriedades_rurais(id) NOT NULL,
  tecnico_id UUID REFERENCES public.profiles(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  numero VARCHAR(30) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  cultura VARCHAR(100),
  diagnostico TEXT NOT NULL,
  recomendacoes TEXT,
  prazo_atendimento DATE,
  status VARCHAR(30) DEFAULT 'emitido',
  arquivo_pdf TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.controle_pragas_doencas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  propriedade_id UUID REFERENCES public.propriedades_rurais(id) NOT NULL,
  cultura_id UUID REFERENCES public.culturas_safra(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_identificacao DATE NOT NULL,
  tipo VARCHAR(30) NOT NULL,
  nome_praga_doenca VARCHAR(100) NOT NULL,
  nivel_infestacao VARCHAR(30),
  area_afetada_hectares NUMERIC(10,4),
  tratamento_aplicado TEXT,
  produto_utilizado TEXT,
  resultado TEXT,
  laudo_id UUID REFERENCES public.laudos_tecnicos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Programas de Incentivo e Subsídios
CREATE TABLE public.programas_incentivo_rural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  nome VARCHAR(200) NOT NULL,
  tipo public.tipo_incentivo_rural NOT NULL,
  descricao TEXT,
  criterios_elegibilidade TEXT,
  documentacao_exigida TEXT,
  orcamento_total NUMERIC(15,2),
  orcamento_utilizado NUMERIC(15,2) DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  base_legal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.beneficios_rurais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.programas_incentivo_rural(id) NOT NULL,
  produtor_id UUID REFERENCES public.produtores_rurais(id) NOT NULL,
  propriedade_id UUID REFERENCES public.propriedades_rurais(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_solicitacao DATE NOT NULL,
  data_aprovacao DATE,
  data_entrega DATE,
  tipo_beneficio VARCHAR(100) NOT NULL,
  descricao TEXT,
  quantidade NUMERIC(10,2),
  unidade VARCHAR(30),
  valor_unitario NUMERIC(15,2),
  valor_total NUMERIC(15,2),
  status VARCHAR(30) DEFAULT 'solicitado',
  aprovador_id UUID REFERENCES public.profiles(id),
  termo_recebimento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.horas_maquina (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id UUID REFERENCES public.programas_incentivo_rural(id),
  produtor_id UUID REFERENCES public.produtores_rurais(id) NOT NULL,
  propriedade_id UUID REFERENCES public.propriedades_rurais(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  veiculo_id UUID REFERENCES public.veiculos_frota(id),
  operador_id UUID REFERENCES public.motoristas(id),
  data_servico DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  horas_trabalhadas NUMERIC(6,2) NOT NULL,
  tipo_servico VARCHAR(100) NOT NULL,
  area_trabalhada_hectares NUMERIC(10,4),
  valor_hora NUMERIC(10,2),
  valor_total NUMERIC(15,2),
  subsidiado BOOLEAN DEFAULT true,
  percentual_subsidio NUMERIC(5,2) DEFAULT 100,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.4 Abastecimento, Feiras e Mercados
CREATE TABLE public.feiras_livres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  endereco TEXT NOT NULL,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  dias_funcionamento TEXT,
  horario_inicio TIME,
  horario_fim TIME,
  capacidade_barracas INTEGER,
  responsavel VARCHAR(200),
  telefone VARCHAR(20),
  ativa BOOLEAN DEFAULT true,
  base_legal TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.permissionarios_feiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feira_id UUID REFERENCES public.feiras_livres(id) NOT NULL,
  produtor_id UUID REFERENCES public.produtores_rurais(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  cpf_cnpj VARCHAR(18) NOT NULL,
  numero_barraca VARCHAR(20),
  produtos_comercializados TEXT,
  alvara_numero VARCHAR(50),
  alvara_validade DATE,
  taxa_mensal NUMERIC(10,2),
  data_inicio DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.fiscalizacoes_feiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feira_id UUID REFERENCES public.feiras_livres(id) NOT NULL,
  permissionario_id UUID REFERENCES public.permissionarios_feiras(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  fiscal_id UUID REFERENCES public.profiles(id),
  data_fiscalizacao TIMESTAMPTZ NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  resultado VARCHAR(50),
  irregularidades_encontradas TEXT,
  penalidades_aplicadas TEXT,
  prazo_regularizacao DATE,
  auto_infracao VARCHAR(50),
  valor_multa NUMERIC(15,2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- SECRETARIA DE TURISMO, CULTURA E EVENTOS
-- ================================================

CREATE TYPE public.tipo_ponto_turistico AS ENUM ('natural', 'historico', 'religioso', 'cultural', 'gastronomico', 'ecoturismo', 'aventura');
CREATE TYPE public.tipo_parceiro_turismo AS ENUM ('hotel', 'pousada', 'restaurante', 'guia', 'agencia', 'transporte', 'comercio');
CREATE TYPE public.status_evento AS ENUM ('planejado', 'aprovado', 'em_execucao', 'realizado', 'cancelado', 'adiado');

-- 3.1 Gestão Cultural
CREATE TABLE public.equipamentos_culturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  endereco TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  capacidade INTEGER,
  acessibilidade BOOLEAN DEFAULT false,
  horario_funcionamento TEXT,
  responsavel VARCHAR(200),
  telefone VARCHAR(20),
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agentes_culturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  cpf_cnpj VARCHAR(18),
  tipo_agente VARCHAR(50) NOT NULL,
  area_atuacao TEXT,
  curriculo TEXT,
  portfolio_url TEXT,
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.grupos_culturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  genero_artistico VARCHAR(100),
  data_fundacao DATE,
  numero_integrantes INTEGER,
  representante VARCHAR(200),
  telefone VARCHAR(20),
  email VARCHAR(100),
  endereco_sede TEXT,
  historico TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.projetos_culturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  edital_id UUID,
  titulo VARCHAR(200) NOT NULL,
  proponente_id UUID REFERENCES public.agentes_culturais(id),
  grupo_id UUID REFERENCES public.grupos_culturais(id),
  descricao TEXT,
  justificativa TEXT,
  objetivos TEXT,
  publico_alvo TEXT,
  cronograma TEXT,
  orcamento_solicitado NUMERIC(15,2),
  orcamento_aprovado NUMERIC(15,2),
  contrapartida TEXT,
  status VARCHAR(30) DEFAULT 'inscrito',
  nota_avaliacao NUMERIC(5,2),
  parecer TEXT,
  data_inicio DATE,
  data_fim DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.2 Eventos Oficiais
CREATE TABLE public.eventos_municipais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  local_id UUID REFERENCES public.equipamentos_culturais(id),
  local_externo TEXT,
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  publico_estimado INTEGER,
  publico_real INTEGER,
  orcamento_previsto NUMERIC(15,2),
  orcamento_realizado NUMERIC(15,2),
  responsavel_id UUID REFERENCES public.profiles(id),
  status public.status_evento DEFAULT 'planejado',
  justificativa TEXT,
  resultados TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.contratacoes_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos_municipais(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  tipo_contratacao VARCHAR(50) NOT NULL,
  descricao TEXT NOT NULL,
  fornecedor_nome VARCHAR(200),
  fornecedor_cnpj VARCHAR(18),
  contrato_id UUID REFERENCES public.contracts(id),
  valor NUMERIC(15,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'pendente',
  autorizacao_id UUID REFERENCES public.profiles(id),
  data_autorizacao DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.prestacoes_contas_eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID REFERENCES public.eventos_municipais(id) NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id),
  data_prestacao DATE NOT NULL,
  valor_total_gasto NUMERIC(15,2) NOT NULL,
  saldo_devolvido NUMERIC(15,2) DEFAULT 0,
  resumo_execucao TEXT,
  dificuldades TEXT,
  licoes_aprendidas TEXT,
  responsavel_id UUID REFERENCES public.profiles(id),
  aprovador_id UUID REFERENCES public.profiles(id),
  status VARCHAR(30) DEFAULT 'pendente',
  parecer TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3.3 Turismo Municipal
CREATE TABLE public.pontos_turisticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  tipo public.tipo_ponto_turistico NOT NULL,
  descricao TEXT,
  historico TEXT,
  endereco TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  horario_funcionamento TEXT,
  valor_entrada NUMERIC(10,2),
  gratuito BOOLEAN DEFAULT false,
  acessibilidade BOOLEAN DEFAULT false,
  infraestrutura TEXT,
  contato_telefone VARCHAR(20),
  website TEXT,
  foto_principal_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.roteiros_turisticos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  descricao TEXT,
  duracao_horas NUMERIC(5,2),
  distancia_km NUMERIC(10,2),
  dificuldade VARCHAR(30),
  melhor_epoca TEXT,
  valor_medio NUMERIC(10,2),
  inclui TEXT,
  recomendacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.roteiros_pontos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roteiro_id UUID REFERENCES public.roteiros_turisticos(id) NOT NULL,
  ponto_id UUID REFERENCES public.pontos_turisticos(id) NOT NULL,
  ordem INTEGER NOT NULL,
  tempo_permanencia_minutos INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.parceiros_turismo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  nome VARCHAR(200) NOT NULL,
  tipo public.tipo_parceiro_turismo NOT NULL,
  cnpj VARCHAR(18),
  endereco TEXT,
  latitude NUMERIC(10,8),
  longitude NUMERIC(11,8),
  telefone VARCHAR(20),
  email VARCHAR(100),
  website TEXT,
  descricao TEXT,
  capacidade INTEGER,
  classificacao VARCHAR(20),
  certificacoes TEXT,
  convenio BOOLEAN DEFAULT false,
  desconto_percentual NUMERIC(5,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.indicadores_turismo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  exercicio_id UUID REFERENCES public.exercicios_financeiros(id),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  visitantes_estimados INTEGER,
  visitantes_nacionais INTEGER,
  visitantes_internacionais INTEGER,
  pernoites_estimados INTEGER,
  receita_estimada NUMERIC(15,2),
  ocupacao_hoteleira_percentual NUMERIC(5,2),
  eventos_realizados INTEGER,
  fonte_dados TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================
-- ÍNDICES
-- ================================================

CREATE INDEX idx_veiculos_frota_secretaria ON public.veiculos_frota(secretaria_id);
CREATE INDEX idx_veiculos_frota_placa ON public.veiculos_frota(placa);
CREATE INDEX idx_motoristas_cnh ON public.motoristas(cnh_numero);
CREATE INDEX idx_abastecimentos_veiculo ON public.abastecimentos(veiculo_id);
CREATE INDEX idx_manutencoes_veiculo ON public.manutencoes_veiculos(veiculo_id);
CREATE INDEX idx_linhas_transporte_municipio ON public.linhas_transporte(municipio_id);
CREATE INDEX idx_produtores_cpf ON public.produtores_rurais(cpf_cnpj);
CREATE INDEX idx_propriedades_produtor ON public.propriedades_rurais(produtor_id);
CREATE INDEX idx_culturas_propriedade ON public.culturas_safra(propriedade_id);
CREATE INDEX idx_visitas_propriedade ON public.visitas_tecnicas(propriedade_id);
CREATE INDEX idx_beneficios_produtor ON public.beneficios_rurais(produtor_id);
CREATE INDEX idx_feiras_municipio ON public.feiras_livres(municipio_id);
CREATE INDEX idx_pontos_turisticos_municipio ON public.pontos_turisticos(municipio_id);
CREATE INDEX idx_eventos_municipais_data ON public.eventos_municipais(data_inicio);
CREATE INDEX idx_projetos_culturais_status ON public.projetos_culturais(status);
CREATE INDEX idx_indicadores_turismo_periodo ON public.indicadores_turismo(ano, mes);

-- ================================================
-- RLS
-- ================================================

ALTER TABLE public.veiculos_frota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motoristas_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_servico_frota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abastecimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_frota ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_motoristas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diarias_deslocamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linhas_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos_parada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_linhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas_gratuidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sinalizacao_viaria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semaforos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_educativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtores_rurais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propriedades_rurais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culturas_safra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laudos_tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controle_pragas_doencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas_incentivo_rural ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficios_rurais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horas_maquina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feiras_livres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissionarios_feiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fiscalizacoes_feiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos_culturais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agentes_culturais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grupos_culturais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos_culturais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos_municipais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratacoes_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestacoes_contas_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pontos_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roteiros_turisticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roteiros_pontos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parceiros_turismo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_turismo ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Acesso frota" ON public.veiculos_frota FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso motoristas" ON public.motoristas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso autorizacoes" ON public.motoristas_veiculos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "Acesso manutencoes" ON public.manutencoes_veiculos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso ordens" ON public.ordens_servico_frota FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso abastecimentos" ON public.abastecimentos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso alertas" ON public.alertas_frota FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "Acesso escalas" ON public.escalas_motoristas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso diarias" ON public.diarias_deslocamentos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso linhas" ON public.linhas_transporte FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso pontos" ON public.pontos_parada FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso horarios" ON public.horarios_linhas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "Acesso tarifas" ON public.tarifas_gratuidades FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso sinalizacao" ON public.sinalizacao_viaria FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso semaforos" ON public.semaforos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso ocorrencias" ON public.ocorrencias_transito FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso campanhas" ON public.campanhas_educativas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso produtores" ON public.produtores_rurais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso propriedades" ON public.propriedades_rurais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso culturas" ON public.culturas_safra FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso visitas" ON public.visitas_tecnicas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso laudos" ON public.laudos_tecnicos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso pragas" ON public.controle_pragas_doencas FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso programas" ON public.programas_incentivo_rural FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso beneficios" ON public.beneficios_rurais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso horas" ON public.horas_maquina FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso feiras" ON public.feiras_livres FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso permissionarios" ON public.permissionarios_feiras FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso fiscalizacoes" ON public.fiscalizacoes_feiras FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso equipamentos" ON public.equipamentos_culturais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso agentes" ON public.agentes_culturais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso grupos" ON public.grupos_culturais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso projetos" ON public.projetos_culturais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso eventos" ON public.eventos_municipais FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso contratacoes" ON public.contratacoes_eventos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso prestacoes" ON public.prestacoes_contas_eventos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso pontos_tur" ON public.pontos_turisticos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso roteiros" ON public.roteiros_turisticos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso roteiros_pontos" ON public.roteiros_pontos FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario'));
CREATE POLICY "Acesso parceiros" ON public.parceiros_turismo FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));
CREATE POLICY "Acesso indicadores" ON public.indicadores_turismo FOR ALL USING (public.is_admin_municipal(auth.uid()) OR public.has_secretaria_role(auth.uid(), 'secretario') OR public.has_secretaria_access(auth.uid(), secretaria_id));

-- ================================================
-- TRIGGERS
-- ================================================

CREATE TRIGGER audit_veiculos_frota AFTER INSERT OR UPDATE OR DELETE ON public.veiculos_frota FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_motoristas AFTER INSERT OR UPDATE OR DELETE ON public.motoristas FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_manutencoes_veiculos AFTER INSERT OR UPDATE OR DELETE ON public.manutencoes_veiculos FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_abastecimentos AFTER INSERT OR UPDATE OR DELETE ON public.abastecimentos FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_produtores_rurais AFTER INSERT OR UPDATE OR DELETE ON public.produtores_rurais FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_propriedades_rurais AFTER INSERT OR UPDATE OR DELETE ON public.propriedades_rurais FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_beneficios_rurais AFTER INSERT OR UPDATE OR DELETE ON public.beneficios_rurais FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_eventos_municipais AFTER INSERT OR UPDATE OR DELETE ON public.eventos_municipais FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_projetos_culturais AFTER INSERT OR UPDATE OR DELETE ON public.projetos_culturais FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER audit_pontos_turisticos AFTER INSERT OR UPDATE OR DELETE ON public.pontos_turisticos FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER update_veiculos_frota_updated_at BEFORE UPDATE ON public.veiculos_frota FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_motoristas_updated_at BEFORE UPDATE ON public.motoristas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_manutencoes_updated_at BEFORE UPDATE ON public.manutencoes_veiculos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_produtores_rurais_updated_at BEFORE UPDATE ON public.produtores_rurais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_propriedades_rurais_updated_at BEFORE UPDATE ON public.propriedades_rurais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_eventos_municipais_updated_at BEFORE UPDATE ON public.eventos_municipais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projetos_culturais_updated_at BEFORE UPDATE ON public.projetos_culturais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pontos_turisticos_updated_at BEFORE UPDATE ON public.pontos_turisticos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ================================================
-- FUNÇÕES AUXILIARES
-- ================================================

CREATE OR REPLACE FUNCTION public.gerar_numero_ordem_servico_frota()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial FROM public.ordens_servico_frota;
  RETURN CONCAT('OS-FROTA-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 5, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.gerar_numero_laudo_tecnico()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sequencial INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_sequencial FROM public.laudos_tecnicos;
  RETURN CONCAT('LT-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_sequencial::TEXT, 5, '0'));
END;
$$;

CREATE OR REPLACE FUNCTION public.calcular_media_km_litro(p_veiculo_id UUID)
RETURNS NUMERIC LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_media NUMERIC;
BEGIN
  SELECT AVG(media_km_litro) INTO v_media FROM public.abastecimentos WHERE veiculo_id = p_veiculo_id AND media_km_litro IS NOT NULL;
  RETURN COALESCE(v_media, 0);
END;
$$;
