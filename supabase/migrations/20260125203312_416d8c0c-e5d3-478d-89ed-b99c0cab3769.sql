
-- =============================================
-- PARTE 1: ENUMS PARA O SISTEMA DE CARGOS E RBAC
-- =============================================

-- Enum para tipo de cargo
CREATE TYPE public.tipo_cargo AS ENUM (
  'efetivo',
  'comissionado',
  'temporario',
  'emprego_publico'
);

-- Enum para regime de trabalho
CREATE TYPE public.regime_trabalho AS ENUM (
  'estatutario',
  'celetista',
  'temporario',
  'comissionado'
);

-- Enum para tipo de função
CREATE TYPE public.tipo_funcao AS ENUM (
  'comissionada',
  'gratificada',
  'cargo_em_comissao'
);

-- Enum para papéis sistêmicos avançados
CREATE TYPE public.papel_sistemico AS ENUM (
  'admin_municipal',
  'secretario',
  'secretario_adjunto',
  'diretor',
  'coordenador',
  'tecnico',
  'operador',
  'auditor'
);

-- Enum para tipo de permissão
CREATE TYPE public.tipo_permissao AS ENUM (
  'ver',
  'criar',
  'editar',
  'excluir',
  'aprovar',
  'publicar'
);

-- Enum para condição de permissão
CREATE TYPE public.condicao_permissao AS ENUM (
  'todos',
  'proprios',
  'subordinados',
  'mesma_unidade',
  'mesma_secretaria',
  'hierarquia_inferior'
);

-- =============================================
-- PARTE 2: TABELA DE CARGOS PÚBLICOS
-- =============================================

CREATE TABLE public.cargos_publicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id UUID REFERENCES public.municipios(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_cargo NOT NULL DEFAULT 'efetivo',
  regime regime_trabalho NOT NULL DEFAULT 'estatutario',
  
  -- Nível, classe e padrão
  nivel TEXT,
  classe TEXT,
  padrao TEXT,
  
  -- Jornada
  jornada_semanal INTEGER NOT NULL DEFAULT 40,
  jornada_diaria INTEGER DEFAULT 8,
  
  -- Requisitos legais
  escolaridade_minima TEXT,
  formacao_especifica TEXT,
  requisitos_adicionais JSONB DEFAULT '[]'::jsonb,
  lei_criacao TEXT,
  data_criacao DATE,
  
  -- Remuneração
  vencimento_base NUMERIC(12,2),
  teto_remuneratorio NUMERIC(12,2),
  
  -- Progressão
  permite_progressao_vertical BOOLEAN DEFAULT true,
  permite_progressao_horizontal BOOLEAN DEFAULT true,
  intersticio_progressao_meses INTEGER DEFAULT 36,
  criterios_progressao JSONB DEFAULT '{}'::jsonb,
  
  -- Vagas
  vagas_criadas INTEGER DEFAULT 0,
  vagas_ocupadas INTEGER DEFAULT 0,
  vagas_disponiveis INTEGER GENERATED ALWAYS AS (vagas_criadas - vagas_ocupadas) STORED,
  
  status TEXT DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(municipio_id, codigo)
);

-- =============================================
-- PARTE 3: TABELA DE FUNÇÕES ADMINISTRATIVAS
-- =============================================

CREATE TABLE public.funcoes_administrativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL,
  nome TEXT NOT NULL,
  tipo tipo_funcao NOT NULL,
  
  -- Atribuições
  descricao TEXT,
  atribuicoes TEXT,
  competencias JSONB DEFAULT '[]'::jsonb,
  
  -- Regras de ocupação
  requisitos_ocupacao TEXT,
  cargo_vinculado_id UUID REFERENCES public.cargos_publicos(id),
  exclusivo_efetivo BOOLEAN DEFAULT false,
  tempo_minimo_servico_meses INTEGER DEFAULT 0,
  
  -- Remuneração adicional
  valor_gratificacao NUMERIC(12,2),
  percentual_gratificacao NUMERIC(5,2),
  
  -- Hierarquia
  nivel_hierarquico INTEGER DEFAULT 1,
  funcao_superior_id UUID REFERENCES public.funcoes_administrativas(id),
  
  status TEXT DEFAULT 'ativa',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(secretaria_id, codigo)
);

-- =============================================
-- PARTE 4: VÍNCULOS FUNCIONAIS
-- =============================================

CREATE TABLE public.vinculos_funcionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Vínculo com cargo
  cargo_id UUID REFERENCES public.cargos_publicos(id),
  matricula TEXT,
  data_admissao DATE NOT NULL,
  data_posse DATE,
  data_exercicio DATE,
  
  -- Situação funcional
  situacao TEXT DEFAULT 'ativo',
  motivo_afastamento TEXT,
  data_afastamento DATE,
  previsao_retorno DATE,
  
  -- Lotação atual
  secretaria_id UUID REFERENCES public.secretarias(id),
  unidade_id UUID REFERENCES public.unidades_administrativas(id),
  funcao_id UUID REFERENCES public.funcoes_administrativas(id),
  
  -- Regime de trabalho
  regime regime_trabalho NOT NULL DEFAULT 'estatutario',
  jornada_semanal INTEGER DEFAULT 40,
  horario_entrada TIME,
  horario_saida TIME,
  
  -- Remuneração
  vencimento_atual NUMERIC(12,2),
  nivel_atual TEXT,
  classe_atual TEXT,
  padrao_atual TEXT,
  
  -- Progressão
  data_ultima_progressao DATE,
  proxima_progressao DATE,
  
  is_primary BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, matricula)
);

-- =============================================
-- PARTE 5: HISTÓRICO DE LOTAÇÕES
-- =============================================

CREATE TABLE public.historico_lotacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vinculo_id UUID REFERENCES public.vinculos_funcionais(id) ON DELETE CASCADE NOT NULL,
  
  -- Lotação
  secretaria_id UUID REFERENCES public.secretarias(id),
  unidade_id UUID REFERENCES public.unidades_administrativas(id),
  funcao_id UUID REFERENCES public.funcoes_administrativas(id),
  
  -- Período
  data_inicio DATE NOT NULL,
  data_fim DATE,
  
  -- Detalhes
  tipo_movimentacao TEXT NOT NULL, -- 'lotacao_inicial', 'transferencia', 'cessao', 'disposicao', 'remocao'
  motivo TEXT,
  portaria_numero TEXT,
  portaria_data DATE,
  
  observacoes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PARTE 6: MÓDULOS DO SISTEMA
-- =============================================

CREATE TABLE public.modulos_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  rota_base TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir módulos padrão
INSERT INTO public.modulos_sistema (codigo, nome, descricao, rota_base, ordem) VALUES
  ('dashboard', 'Dashboard', 'Painel principal', '/dashboard', 1),
  ('educacao', 'Educação', 'Gestão educacional', '/gestao-educacao', 2),
  ('saude', 'Saúde', 'Gestão de saúde pública', '/gestao-saude-publica', 3),
  ('financeiro', 'Financeiro', 'Gestão financeira', '/financeiro', 4),
  ('rh', 'Recursos Humanos', 'Gestão de pessoal', '/funcionarios', 5),
  ('obras', 'Obras', 'Gestão de obras e infraestrutura', '/gestao-obras', 6),
  ('social', 'Assistência Social', 'Programas sociais', '/gestao-programas-sociais', 7),
  ('cultura', 'Cultura', 'Gestão cultural', '/infraestrutura-cultural', 8),
  ('ambiental', 'Meio Ambiente', 'Gestão ambiental', '/gestao-ambiental', 9),
  ('transparencia', 'Transparência', 'Portal de transparência', '/transparencia', 10),
  ('contratos', 'Contratos', 'Gestão de contratos', '/contratos-pagamentos', 11),
  ('compras', 'Compras e Licitações', 'Gestão de compras', '/compras-licitacoes', 12);

-- =============================================
-- PARTE 7: MATRIZ DE PERMISSÕES
-- =============================================

CREATE TABLE public.permissoes_papel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  papel papel_sistemico NOT NULL,
  modulo_id UUID REFERENCES public.modulos_sistema(id) ON DELETE CASCADE,
  
  -- Permissões básicas
  pode_ver BOOLEAN DEFAULT false,
  pode_criar BOOLEAN DEFAULT false,
  pode_editar BOOLEAN DEFAULT false,
  pode_excluir BOOLEAN DEFAULT false,
  pode_aprovar BOOLEAN DEFAULT false,
  pode_publicar BOOLEAN DEFAULT false,
  
  -- Condições
  condicao_ver condicao_permissao DEFAULT 'todos',
  condicao_editar condicao_permissao DEFAULT 'proprios',
  condicao_excluir condicao_permissao DEFAULT 'proprios',
  
  -- Restrições por hierarquia
  nivel_hierarquico_minimo INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(papel, modulo_id)
);

-- =============================================
-- PARTE 8: PAPÉIS DE USUÁRIO (RBAC AVANÇADO)
-- =============================================

CREATE TABLE public.papeis_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  papel papel_sistemico NOT NULL,
  
  -- Escopo do papel
  secretaria_id UUID REFERENCES public.secretarias(id),
  unidade_id UUID REFERENCES public.unidades_administrativas(id),
  modulo_codigo TEXT,
  
  -- Validade
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  
  -- Delegação
  delegado_por UUID REFERENCES auth.users(id),
  motivo_delegacao TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PARTE 9: RESTRIÇÕES ABAC (ATTRIBUTE-BASED)
-- =============================================

CREATE TABLE public.restricoes_acesso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  papel_id UUID REFERENCES public.papeis_usuario(id) ON DELETE CASCADE,
  
  -- Restrições de horário
  horario_inicio TIME,
  horario_fim TIME,
  dias_semana INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 0=dom, 1=seg, ..., 6=sab
  
  -- Restrições de localização
  ips_permitidos TEXT[],
  localizacoes_permitidas JSONB, -- lat/long ou geofencing
  
  -- Restrições de dispositivo
  dispositivos_permitidos TEXT[], -- device fingerprints
  apenas_rede_interna BOOLEAN DEFAULT false,
  
  -- Limites financeiros
  limite_aprovacao_financeira NUMERIC(12,2),
  limite_diario NUMERIC(12,2),
  limite_mensal NUMERIC(12,2),
  
  -- Delegações temporárias
  delegacao_automatica_ausencia BOOLEAN DEFAULT false,
  delegado_substituto_id UUID REFERENCES auth.users(id),
  
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PARTE 10: LOG DE ACESSOS E AUDITORIA
-- =============================================

CREATE TABLE public.log_acessos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  
  -- Ação
  modulo TEXT,
  acao TEXT NOT NULL,
  recurso TEXT,
  recurso_id UUID,
  
  -- Resultado
  permitido BOOLEAN NOT NULL,
  motivo_negacao TEXT,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  dispositivo TEXT,
  localizacao JSONB,
  
  -- Dados
  dados_anteriores JSONB,
  dados_novos JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- PARTE 11: FUNÇÕES SECURITY DEFINER
-- =============================================

-- Função para verificar papel sistêmico
CREATE OR REPLACE FUNCTION public.has_papel_sistemico(_user_id UUID, _papel papel_sistemico)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.papeis_usuario
    WHERE user_id = _user_id
      AND papel = _papel
      AND is_active = true
      AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  )
$$;

-- Função para verificar papel em secretaria
CREATE OR REPLACE FUNCTION public.has_papel_em_secretaria(_user_id UUID, _papel papel_sistemico, _secretaria_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.papeis_usuario
    WHERE user_id = _user_id
      AND papel = _papel
      AND (secretaria_id = _secretaria_id OR secretaria_id IS NULL)
      AND is_active = true
      AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  )
$$;

-- Função para verificar permissão em módulo
CREATE OR REPLACE FUNCTION public.tem_permissao(_user_id UUID, _modulo TEXT, _acao tipo_permissao)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tem_permissao BOOLEAN := false;
BEGIN
  -- Admin tem todas as permissões
  IF has_papel_sistemico(_user_id, 'admin_municipal') THEN
    RETURN true;
  END IF;
  
  -- Auditor só pode ver
  IF has_papel_sistemico(_user_id, 'auditor') AND _acao = 'ver' THEN
    RETURN true;
  END IF;
  
  -- Verificar na matriz de permissões
  SELECT 
    CASE _acao
      WHEN 'ver' THEN pp.pode_ver
      WHEN 'criar' THEN pp.pode_criar
      WHEN 'editar' THEN pp.pode_editar
      WHEN 'excluir' THEN pp.pode_excluir
      WHEN 'aprovar' THEN pp.pode_aprovar
      WHEN 'publicar' THEN pp.pode_publicar
    END INTO v_tem_permissao
  FROM public.papeis_usuario pu
  JOIN public.permissoes_papel pp ON pp.papel = pu.papel
  JOIN public.modulos_sistema ms ON ms.id = pp.modulo_id
  WHERE pu.user_id = _user_id
    AND pu.is_active = true
    AND ms.codigo = _modulo
    AND (pu.data_fim IS NULL OR pu.data_fim >= CURRENT_DATE)
  LIMIT 1;
  
  RETURN COALESCE(v_tem_permissao, false);
END;
$$;

-- Função para verificar restrições ABAC
CREATE OR REPLACE FUNCTION public.verifica_restricoes_abac(
  _user_id UUID,
  _ip TEXT DEFAULT NULL,
  _hora TIME DEFAULT CURRENT_TIME,
  _dia_semana INTEGER DEFAULT EXTRACT(DOW FROM CURRENT_DATE)::INTEGER,
  _valor_financeiro NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restricao RECORD;
BEGIN
  -- Buscar restrições do usuário
  FOR v_restricao IN 
    SELECT * FROM public.restricoes_acesso 
    WHERE user_id = _user_id AND ativo = true
  LOOP
    -- Verificar horário
    IF v_restricao.horario_inicio IS NOT NULL AND v_restricao.horario_fim IS NOT NULL THEN
      IF _hora < v_restricao.horario_inicio OR _hora > v_restricao.horario_fim THEN
        RETURN false;
      END IF;
    END IF;
    
    -- Verificar dia da semana
    IF v_restricao.dias_semana IS NOT NULL THEN
      IF NOT (_dia_semana = ANY(v_restricao.dias_semana)) THEN
        RETURN false;
      END IF;
    END IF;
    
    -- Verificar IP
    IF v_restricao.ips_permitidos IS NOT NULL AND _ip IS NOT NULL THEN
      IF NOT (_ip = ANY(v_restricao.ips_permitidos)) THEN
        RETURN false;
      END IF;
    END IF;
    
    -- Verificar limite financeiro
    IF v_restricao.limite_aprovacao_financeira IS NOT NULL AND _valor_financeiro IS NOT NULL THEN
      IF _valor_financeiro > v_restricao.limite_aprovacao_financeira THEN
        RETURN false;
      END IF;
    END IF;
  END LOOP;
  
  RETURN true;
END;
$$;

-- Função para obter vínculo funcional do usuário
CREATE OR REPLACE FUNCTION public.get_vinculo_funcional(_user_id UUID)
RETURNS TABLE(
  vinculo_id UUID,
  cargo_nome TEXT,
  funcao_nome TEXT,
  secretaria_nome TEXT,
  unidade_nome TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    vf.id,
    cp.nome,
    fa.nome,
    s.nome,
    ua.nome
  FROM public.vinculos_funcionais vf
  LEFT JOIN public.cargos_publicos cp ON cp.id = vf.cargo_id
  LEFT JOIN public.funcoes_administrativas fa ON fa.id = vf.funcao_id
  LEFT JOIN public.secretarias s ON s.id = vf.secretaria_id
  LEFT JOIN public.unidades_administrativas ua ON ua.id = vf.unidade_id
  WHERE vf.user_id = _user_id
    AND vf.situacao = 'ativo'
  LIMIT 1
$$;

-- =============================================
-- PARTE 12: RLS POLICIES
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.cargos_publicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funcoes_administrativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vinculos_funcionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_lotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissoes_papel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.papeis_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricoes_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_acessos ENABLE ROW LEVEL SECURITY;

-- Políticas para cargos_publicos
CREATE POLICY "Admin full access cargos" ON public.cargos_publicos
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Authenticated view cargos" ON public.cargos_publicos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para funcoes_administrativas
CREATE POLICY "Admin full access funcoes" ON public.funcoes_administrativas
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Secretario manage funcoes" ON public.funcoes_administrativas
  FOR ALL USING (has_papel_em_secretaria(auth.uid(), 'secretario', secretaria_id))
  WITH CHECK (has_papel_em_secretaria(auth.uid(), 'secretario', secretaria_id));

CREATE POLICY "Authenticated view funcoes" ON public.funcoes_administrativas
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para vinculos_funcionais
CREATE POLICY "Admin full access vinculos" ON public.vinculos_funcionais
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "User view own vinculo" ON public.vinculos_funcionais
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Secretario manage vinculos" ON public.vinculos_funcionais
  FOR ALL USING (has_papel_em_secretaria(auth.uid(), 'secretario', secretaria_id))
  WITH CHECK (has_papel_em_secretaria(auth.uid(), 'secretario', secretaria_id));

-- Políticas para historico_lotacoes
CREATE POLICY "Admin full access historico" ON public.historico_lotacoes
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "User view own historico" ON public.historico_lotacoes
  FOR SELECT USING (
    vinculo_id IN (SELECT id FROM public.vinculos_funcionais WHERE user_id = auth.uid())
  );

-- Políticas para modulos_sistema
CREATE POLICY "Admin manage modulos" ON public.modulos_sistema
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Authenticated view modulos" ON public.modulos_sistema
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para permissoes_papel
CREATE POLICY "Admin manage permissoes" ON public.permissoes_papel
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Authenticated view permissoes" ON public.permissoes_papel
  FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para papeis_usuario
CREATE POLICY "Admin manage papeis" ON public.papeis_usuario
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "User view own papeis" ON public.papeis_usuario
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para restricoes_acesso
CREATE POLICY "Admin manage restricoes" ON public.restricoes_acesso
  FOR ALL USING (has_papel_sistemico(auth.uid(), 'admin_municipal'))
  WITH CHECK (has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "User view own restricoes" ON public.restricoes_acesso
  FOR SELECT USING (user_id = auth.uid());

-- Políticas para log_acessos
CREATE POLICY "Admin view logs" ON public.log_acessos
  FOR SELECT USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'auditor')
  );

CREATE POLICY "System insert logs" ON public.log_acessos
  FOR INSERT WITH CHECK (true);

-- =============================================
-- PARTE 13: TRIGGERS
-- =============================================

-- Trigger para atualizar updated_at
CREATE TRIGGER update_cargos_publicos_updated_at
  BEFORE UPDATE ON public.cargos_publicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funcoes_administrativas_updated_at
  BEFORE UPDATE ON public.funcoes_administrativas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vinculos_funcionais_updated_at
  BEFORE UPDATE ON public.vinculos_funcionais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permissoes_papel_updated_at
  BEFORE UPDATE ON public.permissoes_papel
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_papeis_usuario_updated_at
  BEFORE UPDATE ON public.papeis_usuario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_restricoes_acesso_updated_at
  BEFORE UPDATE ON public.restricoes_acesso
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- PARTE 14: INSERIR PERMISSÕES PADRÃO
-- =============================================

-- Inserir permissões para admin_municipal (acesso total)
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'admin_municipal'::papel_sistemico,
  id,
  true, true, true, true, true, true,
  'todos'::condicao_permissao,
  'todos'::condicao_permissao,
  'todos'::condicao_permissao
FROM public.modulos_sistema;

-- Inserir permissões para secretario
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'secretario'::papel_sistemico,
  id,
  true, true, true, true, true, false,
  'mesma_secretaria'::condicao_permissao,
  'mesma_secretaria'::condicao_permissao,
  'mesma_secretaria'::condicao_permissao
FROM public.modulos_sistema;

-- Inserir permissões para diretor
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'diretor'::papel_sistemico,
  id,
  true, true, true, false, true, false,
  'mesma_unidade'::condicao_permissao,
  'mesma_unidade'::condicao_permissao,
  'proprios'::condicao_permissao
FROM public.modulos_sistema;

-- Inserir permissões para tecnico
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'tecnico'::papel_sistemico,
  id,
  true, true, true, false, false, false,
  'mesma_unidade'::condicao_permissao,
  'proprios'::condicao_permissao,
  'proprios'::condicao_permissao
FROM public.modulos_sistema;

-- Inserir permissões para operador
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'operador'::papel_sistemico,
  id,
  true, true, false, false, false, false,
  'proprios'::condicao_permissao,
  'proprios'::condicao_permissao,
  'proprios'::condicao_permissao
FROM public.modulos_sistema;

-- Inserir permissões para auditor (somente leitura)
INSERT INTO public.permissoes_papel (papel, modulo_id, pode_ver, pode_criar, pode_editar, pode_excluir, pode_aprovar, pode_publicar, condicao_ver, condicao_editar, condicao_excluir)
SELECT 
  'auditor'::papel_sistemico,
  id,
  true, false, false, false, false, false,
  'todos'::condicao_permissao,
  'todos'::condicao_permissao,
  'todos'::condicao_permissao
FROM public.modulos_sistema;

-- =============================================
-- PARTE 15: ÍNDICES
-- =============================================

CREATE INDEX idx_cargos_publicos_municipio ON public.cargos_publicos(municipio_id);
CREATE INDEX idx_funcoes_administrativas_secretaria ON public.funcoes_administrativas(secretaria_id);
CREATE INDEX idx_vinculos_funcionais_user ON public.vinculos_funcionais(user_id);
CREATE INDEX idx_vinculos_funcionais_secretaria ON public.vinculos_funcionais(secretaria_id);
CREATE INDEX idx_historico_lotacoes_vinculo ON public.historico_lotacoes(vinculo_id);
CREATE INDEX idx_papeis_usuario_user ON public.papeis_usuario(user_id);
CREATE INDEX idx_papeis_usuario_papel ON public.papeis_usuario(papel);
CREATE INDEX idx_restricoes_acesso_user ON public.restricoes_acesso(user_id);
CREATE INDEX idx_log_acessos_user ON public.log_acessos(user_id);
CREATE INDEX idx_log_acessos_created ON public.log_acessos(created_at DESC);
