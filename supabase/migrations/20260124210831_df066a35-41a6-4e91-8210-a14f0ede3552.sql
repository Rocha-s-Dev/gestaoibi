-- =====================================================
-- SISTEMA DE GESTÃO MUNICIPAL - ARQUITETURA FUNDAMENTAL
-- Fase 1: Enums e Tipos
-- =====================================================

-- Tipo de secretaria
CREATE TYPE secretaria_tipo AS ENUM ('finalistico', 'administrativo');

-- Papel do usuário na secretaria
CREATE TYPE secretaria_role AS ENUM (
  'admin_municipal',
  'secretario',
  'secretario_adjunto',
  'diretor',
  'coordenador',
  'supervisor',
  'servidor',
  'estagiario'
);

-- Status do exercício financeiro
CREATE TYPE exercicio_status AS ENUM ('aberto', 'bloqueado', 'encerrado');

-- Tipo de período fiscal
CREATE TYPE periodo_tipo AS ENUM ('bimestre', 'trimestre', 'quadrimestre', 'semestre');

-- Tipo de feriado
CREATE TYPE feriado_tipo AS ENUM ('nacional', 'estadual', 'municipal', 'ponto_facultativo');

-- Tipo de unidade administrativa
CREATE TYPE unidade_tipo AS ENUM ('administrativa', 'operacional', 'tecnica');

-- =====================================================
-- Fase 2: Tabela Município (Multi-tenancy Ready)
-- =====================================================

CREATE TABLE public.municipios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  uf CHAR(2) NOT NULL,
  cnpj TEXT UNIQUE,
  codigo_ibge TEXT UNIQUE,
  prefeito TEXT,
  vice_prefeito TEXT,
  email_institucional TEXT,
  telefone_principal TEXT,
  telefone_secundario TEXT,
  endereco_sede TEXT,
  cep TEXT,
  brasao_url TEXT,
  bandeira_url TEXT,
  data_fundacao DATE,
  populacao_estimada INTEGER,
  area_km2 DECIMAL(12,2),
  site_oficial TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Fase 3: Exercícios Financeiros e Períodos
-- =====================================================

CREATE TABLE public.exercicios_financeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  ano INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status exercicio_status NOT NULL DEFAULT 'aberto',
  loa_aprovada BOOLEAN DEFAULT false,
  valor_orcamento DECIMAL(18,2),
  observacoes TEXT,
  encerrado_por UUID,
  encerrado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT exercicio_unico UNIQUE (municipio_id, ano)
);

CREATE TABLE public.periodos_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercicio_id UUID NOT NULL REFERENCES public.exercicios_financeiros(id) ON DELETE CASCADE,
  tipo periodo_tipo NOT NULL,
  numero INTEGER NOT NULL CHECK (numero >= 1 AND numero <= 6),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status exercicio_status NOT NULL DEFAULT 'aberto',
  bloqueado_por UUID,
  bloqueado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT periodo_unico UNIQUE (exercicio_id, tipo, numero)
);

-- =====================================================
-- Fase 4: Feriados
-- =====================================================

CREATE TABLE public.feriados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data DATE NOT NULL,
  tipo feriado_tipo NOT NULL,
  recorrente BOOLEAN NOT NULL DEFAULT true,
  uf CHAR(2),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Fase 5: Secretarias (Entidade Central)
-- =====================================================

CREATE TABLE public.secretarias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  municipio_id UUID NOT NULL REFERENCES public.municipios(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  sigla TEXT NOT NULL,
  tipo secretaria_tipo NOT NULL DEFAULT 'finalistico',
  codigo_orcamentario TEXT,
  nivel_hierarquico INTEGER NOT NULL DEFAULT 1,
  responsavel_id UUID,
  email_institucional TEXT,
  telefone_principal TEXT,
  telefone_secundario TEXT,
  endereco TEXT,
  cep TEXT,
  bairro TEXT,
  missao TEXT,
  competencias TEXT,
  base_legal TEXT,
  data_criacao DATE,
  status TEXT NOT NULL DEFAULT 'ativa',
  icone TEXT DEFAULT 'Building2',
  cor_tema TEXT DEFAULT '#3B82F6',
  ordem_exibicao INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT secretaria_sigla_unica UNIQUE (municipio_id, sigla)
);

-- Histórico de alterações de secretarias
CREATE TABLE public.secretarias_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID NOT NULL REFERENCES public.secretarias(id) ON DELETE CASCADE,
  acao TEXT NOT NULL,
  motivo TEXT,
  responsavel_id UUID,
  data_vigencia DATE NOT NULL DEFAULT CURRENT_DATE,
  dados_anteriores JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Fase 6: Unidades Administrativas (Árvore Hierárquica)
-- =====================================================

CREATE TABLE public.unidades_administrativas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID NOT NULL REFERENCES public.secretarias(id) ON DELETE CASCADE,
  unidade_superior_id UUID REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  sigla TEXT,
  tipo unidade_tipo NOT NULL DEFAULT 'administrativa',
  nivel INTEGER NOT NULL DEFAULT 1,
  codigo TEXT,
  missao TEXT,
  atribuicoes TEXT,
  qtd_cargos_previstos INTEGER DEFAULT 0,
  qtd_cargos_ocupados INTEGER DEFAULT 0,
  responsavel_id UUID,
  email TEXT,
  telefone TEXT,
  localizacao TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Fase 7: Sistema de Roles por Secretaria
-- =====================================================

CREATE TABLE public.user_secretaria_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  unidade_id UUID REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  role secretaria_role NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_secretaria_role_unique UNIQUE (user_id, secretaria_id, role)
);

-- =====================================================
-- Fase 8: Tabelas Auxiliares para Financeiro (corrigir build errors)
-- =====================================================

CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  description TEXT,
  manager_id UUID,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  code TEXT,
  parent_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'expense',
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reference_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  contract_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  contractor_name TEXT NOT NULL,
  contractor_cnpj TEXT,
  value DECIMAL(18,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  payment_terms TEXT,
  object TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contract_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  paid_amount DECIMAL(18,2),
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  last_message TEXT,
  unread_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- Fase 9: Funções de Segurança (SECURITY DEFINER)
-- =====================================================

-- Verifica se usuário é admin municipal
CREATE OR REPLACE FUNCTION public.is_admin_municipal(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND role = 'admin_municipal'
  )
$$;

-- Lista secretarias do usuário
CREATE OR REPLACE FUNCTION public.get_user_secretaria_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT secretaria_id
  FROM public.user_secretaria_roles
  WHERE user_id = _user_id
    AND secretaria_id IS NOT NULL
$$;

-- Verifica acesso à secretaria
CREATE OR REPLACE FUNCTION public.has_secretaria_access(_user_id UUID, _secretaria_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND (secretaria_id = _secretaria_id OR role = 'admin_municipal')
  )
$$;

-- Verifica papel na secretaria
CREATE OR REPLACE FUNCTION public.has_secretaria_role(_user_id UUID, _role secretaria_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Verifica se é secretário de determinada secretaria
CREATE OR REPLACE FUNCTION public.is_secretario_of(_user_id UUID, _secretaria_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_secretaria_roles
    WHERE user_id = _user_id
      AND secretaria_id = _secretaria_id
      AND role IN ('secretario', 'secretario_adjunto')
  )
$$;

-- =====================================================
-- Fase 10: Triggers de updated_at
-- =====================================================

CREATE TRIGGER update_municipios_updated_at
  BEFORE UPDATE ON public.municipios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercicios_financeiros_updated_at
  BEFORE UPDATE ON public.exercicios_financeiros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_secretarias_updated_at
  BEFORE UPDATE ON public.secretarias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unidades_administrativas_updated_at
  BEFORE UPDATE ON public.unidades_administrativas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_categories_updated_at
  BEFORE UPDATE ON public.financial_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contract_payments_updated_at
  BEFORE UPDATE ON public.contract_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Fase 11: Índices de Performance
-- =====================================================

CREATE INDEX idx_secretarias_municipio ON public.secretarias(municipio_id);
CREATE INDEX idx_secretarias_status ON public.secretarias(status);
CREATE INDEX idx_unidades_secretaria ON public.unidades_administrativas(secretaria_id);
CREATE INDEX idx_unidades_superior ON public.unidades_administrativas(unidade_superior_id);
CREATE INDEX idx_user_secretaria_roles_user ON public.user_secretaria_roles(user_id);
CREATE INDEX idx_user_secretaria_roles_secretaria ON public.user_secretaria_roles(secretaria_id);
CREATE INDEX idx_financial_transactions_secretaria ON public.financial_transactions(secretaria_id);
CREATE INDEX idx_contracts_secretaria ON public.contracts(secretaria_id);
CREATE INDEX idx_conversations_sender ON public.conversations(sender_id);
CREATE INDEX idx_conversations_receiver ON public.conversations(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);

-- =====================================================
-- Fase 12: RLS Policies
-- =====================================================

ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.periodos_fiscais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feriados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secretarias_historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unidades_administrativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_secretaria_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Municipios: Admin full access, outros podem ver
CREATE POLICY "Admin full access municipios" ON public.municipios
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Authenticated view municipios" ON public.municipios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Exercícios: Admin e secretários
CREATE POLICY "Admin full access exercicios" ON public.exercicios_financeiros
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Authenticated view exercicios" ON public.exercicios_financeiros
  FOR SELECT USING (auth.role() = 'authenticated');

-- Períodos: segue exercício
CREATE POLICY "Admin full access periodos" ON public.periodos_fiscais
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Authenticated view periodos" ON public.periodos_fiscais
  FOR SELECT USING (auth.role() = 'authenticated');

-- Feriados: Admin gerencia, todos veem
CREATE POLICY "Admin full access feriados" ON public.feriados
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Authenticated view feriados" ON public.feriados
  FOR SELECT USING (auth.role() = 'authenticated');

-- Secretarias: Admin full, secretários gerenciam a sua
CREATE POLICY "Admin full access secretarias" ON public.secretarias
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretario manage own" ON public.secretarias
  FOR UPDATE USING (is_secretario_of(auth.uid(), id));

CREATE POLICY "Authenticated view secretarias" ON public.secretarias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Histórico secretarias
CREATE POLICY "Admin full access historico" ON public.secretarias_historico
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretario view own historico" ON public.secretarias_historico
  FOR SELECT USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- Unidades: Admin, secretário da secretaria mãe
CREATE POLICY "Admin full access unidades" ON public.unidades_administrativas
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretario manage unidades" ON public.unidades_administrativas
  FOR ALL USING (is_secretario_of(auth.uid(), secretaria_id))
  WITH CHECK (is_secretario_of(auth.uid(), secretaria_id));

CREATE POLICY "Staff view unidades" ON public.unidades_administrativas
  FOR SELECT USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- User secretaria roles: Admin full, usuário vê próprio
CREATE POLICY "Admin full access user_roles" ON public.user_secretaria_roles
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "User view own roles" ON public.user_secretaria_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Secretario manage secretaria roles" ON public.user_secretaria_roles
  FOR ALL USING (is_secretario_of(auth.uid(), secretaria_id) AND role NOT IN ('admin_municipal', 'secretario'))
  WITH CHECK (is_secretario_of(auth.uid(), secretaria_id) AND role NOT IN ('admin_municipal', 'secretario'));

-- Departments
CREATE POLICY "Admin full access departments" ON public.departments
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage departments" ON public.departments
  FOR ALL USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())))
  WITH CHECK (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- Financial categories
CREATE POLICY "Admin full access fin_categories" ON public.financial_categories
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage categories" ON public.financial_categories
  FOR ALL USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())))
  WITH CHECK (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- Financial transactions
CREATE POLICY "Admin full access transactions" ON public.financial_transactions
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage transactions" ON public.financial_transactions
  FOR ALL USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())))
  WITH CHECK (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- Contracts
CREATE POLICY "Admin full access contracts" ON public.contracts
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage contracts" ON public.contracts
  FOR ALL USING (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())))
  WITH CHECK (secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid())));

-- Contract payments
CREATE POLICY "Admin full access payments" ON public.contract_payments
  FOR ALL USING (is_admin_municipal(auth.uid()))
  WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "Secretaria staff manage payments" ON public.contract_payments
  FOR ALL USING (
    contract_id IN (
      SELECT id FROM public.contracts 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  )
  WITH CHECK (
    contract_id IN (
      SELECT id FROM public.contracts 
      WHERE secretaria_id IN (SELECT get_user_secretaria_ids(auth.uid()))
    )
  );

-- Conversations
CREATE POLICY "User access own conversations" ON public.conversations
  FOR ALL USING (sender_id = auth.uid() OR receiver_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Messages
CREATE POLICY "User access conversation messages" ON public.messages
  FOR ALL USING (
    conversation_id IN (
      SELECT id FROM public.conversations 
      WHERE sender_id = auth.uid() OR receiver_id = auth.uid()
    )
  )
  WITH CHECK (sender_id = auth.uid());