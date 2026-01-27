
-- Enum para categorias de auditoria
CREATE TYPE public.categoria_auditoria AS ENUM (
  'seguranca',
  'dados',
  'financeiro',
  'documental'
);

-- Enum para tipos de ação
CREATE TYPE public.tipo_acao_auditoria AS ENUM (
  'criar',
  'editar',
  'excluir',
  'visualizar',
  'aprovar',
  'rejeitar',
  'login',
  'logout',
  'exportar',
  'importar',
  'reverter'
);

-- Tabela principal de auditoria global (imutável)
CREATE TABLE public.auditoria_global (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  user_nome TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id),
  secretaria_nome TEXT,
  modulo TEXT NOT NULL,
  entidade TEXT NOT NULL,
  entidade_id UUID,
  tipo_acao tipo_acao_auditoria NOT NULL,
  categoria categoria_auditoria NOT NULL DEFAULT 'dados',
  ip_address INET,
  user_agent TEXT,
  estado_anterior JSONB,
  estado_posterior JSONB,
  alteracoes JSONB, -- diff das mudanças
  metadata JSONB,
  hash_registro TEXT NOT NULL, -- hash SHA-256 para imutabilidade
  hash_anterior TEXT, -- chain de hashes para integridade
  versao INTEGER DEFAULT 1
);

-- Índices para performance
CREATE INDEX idx_auditoria_created_at ON public.auditoria_global(created_at DESC);
CREATE INDEX idx_auditoria_user_id ON public.auditoria_global(user_id);
CREATE INDEX idx_auditoria_secretaria_id ON public.auditoria_global(secretaria_id);
CREATE INDEX idx_auditoria_modulo ON public.auditoria_global(modulo);
CREATE INDEX idx_auditoria_entidade ON public.auditoria_global(entidade, entidade_id);
CREATE INDEX idx_auditoria_categoria ON public.auditoria_global(categoria);
CREATE INDEX idx_auditoria_tipo_acao ON public.auditoria_global(tipo_acao);

-- Tabela de versionamento para entidades críticas
CREATE TABLE public.entidade_versoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  versao INTEGER NOT NULL,
  dados JSONB NOT NULL,
  hash_dados TEXT NOT NULL,
  hash_anterior TEXT,
  user_id UUID REFERENCES auth.users(id),
  motivo TEXT,
  aprovado_por UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMPTZ,
  revertido BOOLEAN DEFAULT false,
  revertido_para_versao INTEGER,
  UNIQUE(entidade, entidade_id, versao)
);

CREATE INDEX idx_versoes_entidade ON public.entidade_versoes(entidade, entidade_id);
CREATE INDEX idx_versoes_versao ON public.entidade_versoes(versao DESC);

-- Tabela de solicitações de reversão
CREATE TABLE public.solicitacoes_reversao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  entidade TEXT NOT NULL,
  entidade_id UUID NOT NULL,
  versao_atual INTEGER NOT NULL,
  versao_destino INTEGER NOT NULL,
  solicitante_id UUID REFERENCES auth.users(id) NOT NULL,
  motivo TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  aprovador_id UUID REFERENCES auth.users(id),
  aprovado_em TIMESTAMPTZ,
  motivo_rejeicao TEXT
);

-- Função para gerar hash SHA-256
CREATE OR REPLACE FUNCTION public.gerar_hash_auditoria(dados JSONB)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN encode(sha256(dados::text::bytea), 'hex');
END;
$$;

-- Função para calcular diff entre estados
CREATE OR REPLACE FUNCTION public.calcular_alteracoes(estado_anterior JSONB, estado_posterior JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resultado JSONB := '{}';
  chave TEXT;
BEGIN
  IF estado_anterior IS NULL THEN
    RETURN estado_posterior;
  END IF;
  
  IF estado_posterior IS NULL THEN
    RETURN NULL;
  END IF;
  
  FOR chave IN SELECT jsonb_object_keys(estado_posterior)
  LOOP
    IF estado_anterior->chave IS DISTINCT FROM estado_posterior->chave THEN
      resultado := resultado || jsonb_build_object(
        chave, 
        jsonb_build_object(
          'anterior', estado_anterior->chave,
          'novo', estado_posterior->chave
        )
      );
    END IF;
  END LOOP;
  
  RETURN resultado;
END;
$$;

-- Função principal para registrar auditoria
CREATE OR REPLACE FUNCTION public.registrar_auditoria(
  p_user_id UUID,
  p_secretaria_id UUID,
  p_modulo TEXT,
  p_entidade TEXT,
  p_entidade_id UUID,
  p_tipo_acao tipo_acao_auditoria,
  p_categoria categoria_auditoria,
  p_estado_anterior JSONB,
  p_estado_posterior JSONB,
  p_ip TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hash TEXT;
  v_hash_anterior TEXT;
  v_alteracoes JSONB;
  v_user_email TEXT;
  v_user_nome TEXT;
  v_secretaria_nome TEXT;
  v_audit_id UUID;
BEGIN
  -- Buscar último hash para chain
  SELECT hash_registro INTO v_hash_anterior
  FROM public.auditoria_global
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calcular alterações
  v_alteracoes := calcular_alteracoes(p_estado_anterior, p_estado_posterior);
  
  -- Buscar info do usuário
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;
  SELECT name INTO v_user_nome FROM public.profiles WHERE user_id = p_user_id;
  
  -- Buscar nome da secretaria
  SELECT nome INTO v_secretaria_nome FROM public.secretarias WHERE id = p_secretaria_id;
  
  -- Gerar hash do registro
  v_hash := gerar_hash_auditoria(
    jsonb_build_object(
      'timestamp', now(),
      'user_id', p_user_id,
      'entidade', p_entidade,
      'entidade_id', p_entidade_id,
      'tipo_acao', p_tipo_acao,
      'estado_anterior', p_estado_anterior,
      'estado_posterior', p_estado_posterior,
      'hash_anterior', v_hash_anterior
    )
  );
  
  -- Inserir registro de auditoria
  INSERT INTO public.auditoria_global (
    user_id, user_email, user_nome,
    secretaria_id, secretaria_nome,
    modulo, entidade, entidade_id,
    tipo_acao, categoria,
    ip_address, user_agent,
    estado_anterior, estado_posterior, alteracoes,
    metadata, hash_registro, hash_anterior
  ) VALUES (
    p_user_id, v_user_email, v_user_nome,
    p_secretaria_id, v_secretaria_nome,
    p_modulo, p_entidade, p_entidade_id,
    p_tipo_acao, p_categoria,
    p_ip::inet, p_user_agent,
    p_estado_anterior, p_estado_posterior, v_alteracoes,
    p_metadata, v_hash, v_hash_anterior
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Função para criar versão de entidade
CREATE OR REPLACE FUNCTION public.criar_versao_entidade(
  p_entidade TEXT,
  p_entidade_id UUID,
  p_dados JSONB,
  p_user_id UUID,
  p_motivo TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_versao INTEGER;
  v_hash TEXT;
  v_hash_anterior TEXT;
BEGIN
  -- Buscar última versão
  SELECT COALESCE(MAX(versao), 0) + 1, hash_dados
  INTO v_versao, v_hash_anterior
  FROM public.entidade_versoes
  WHERE entidade = p_entidade AND entidade_id = p_entidade_id
  GROUP BY hash_dados
  ORDER BY versao DESC
  LIMIT 1;
  
  IF v_versao IS NULL THEN
    v_versao := 1;
  END IF;
  
  -- Gerar hash
  v_hash := gerar_hash_auditoria(
    jsonb_build_object(
      'entidade', p_entidade,
      'entidade_id', p_entidade_id,
      'versao', v_versao,
      'dados', p_dados,
      'hash_anterior', v_hash_anterior
    )
  );
  
  -- Inserir versão
  INSERT INTO public.entidade_versoes (
    entidade, entidade_id, versao, dados,
    hash_dados, hash_anterior, user_id, motivo
  ) VALUES (
    p_entidade, p_entidade_id, v_versao, p_dados,
    v_hash, v_hash_anterior, p_user_id, p_motivo
  );
  
  RETURN v_versao;
END;
$$;

-- Trigger genérico para auditoria automática
CREATE OR REPLACE FUNCTION public.trigger_auditoria_automatica()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tipo_acao tipo_acao_auditoria;
  v_user_id UUID;
  v_entidade_id UUID;
  v_estado_anterior JSONB;
  v_estado_posterior JSONB;
  v_categoria categoria_auditoria := 'dados';
BEGIN
  -- Determinar usuário atual
  v_user_id := auth.uid();
  
  -- Determinar tipo de ação
  IF TG_OP = 'INSERT' THEN
    v_tipo_acao := 'criar';
    v_estado_posterior := to_jsonb(NEW);
    v_entidade_id := NEW.id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_tipo_acao := 'editar';
    v_estado_anterior := to_jsonb(OLD);
    v_estado_posterior := to_jsonb(NEW);
    v_entidade_id := NEW.id;
  ELSIF TG_OP = 'DELETE' THEN
    v_tipo_acao := 'excluir';
    v_estado_anterior := to_jsonb(OLD);
    v_entidade_id := OLD.id;
  END IF;
  
  -- Determinar categoria baseado na tabela
  IF TG_TABLE_NAME IN ('financial_transactions', 'contracts', 'contract_payments', 'financial_goals') THEN
    v_categoria := 'financeiro';
  ELSIF TG_TABLE_NAME IN ('user_secretaria_roles', 'papeis_usuario', 'restricoes_acesso', 'log_acessos') THEN
    v_categoria := 'seguranca';
  END IF;
  
  -- Registrar auditoria
  PERFORM registrar_auditoria(
    v_user_id,
    NULL, -- secretaria_id seria extraído do registro se existir
    TG_TABLE_SCHEMA,
    TG_TABLE_NAME,
    v_entidade_id,
    v_tipo_acao,
    v_categoria,
    v_estado_anterior,
    v_estado_posterior
  );
  
  -- Criar versão para entidades críticas
  IF TG_OP IN ('INSERT', 'UPDATE') AND TG_TABLE_NAME IN (
    'contracts', 'financial_transactions', 'goals', 
    'cargos_publicos', 'vinculos_funcionais', 'funcoes_administrativas'
  ) THEN
    PERFORM criar_versao_entidade(
      TG_TABLE_NAME,
      v_entidade_id,
      v_estado_posterior,
      v_user_id
    );
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar triggers nas tabelas críticas
CREATE TRIGGER audit_contracts
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_financial_transactions
  AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_goals
  AFTER INSERT OR UPDATE OR DELETE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_cargos_publicos
  AFTER INSERT OR UPDATE OR DELETE ON public.cargos_publicos
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_funcoes_administrativas
  AFTER INSERT OR UPDATE OR DELETE ON public.funcoes_administrativas
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_vinculos_funcionais
  AFTER INSERT OR UPDATE OR DELETE ON public.vinculos_funcionais
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_user_secretaria_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_secretaria_roles
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_papeis_usuario
  AFTER INSERT OR UPDATE OR DELETE ON public.papeis_usuario
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_secretarias
  AFTER INSERT OR UPDATE OR DELETE ON public.secretarias
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_alunos
  AFTER INSERT OR UPDATE OR DELETE ON public.alunos
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

CREATE TRIGGER audit_escolas
  AFTER INSERT OR UPDATE OR DELETE ON public.escolas
  FOR EACH ROW EXECUTE FUNCTION trigger_auditoria_automatica();

-- RLS para auditoria (somente leitura para admins e auditores)
ALTER TABLE public.auditoria_global ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entidade_versoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacoes_reversao ENABLE ROW LEVEL SECURITY;

-- Política: Admins e auditores podem ver tudo
CREATE POLICY "Admins e auditores podem ver auditoria"
  ON public.auditoria_global FOR SELECT
  USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'auditor')
  );

-- Ninguém pode modificar auditoria (imutável)
CREATE POLICY "Auditoria é imutável"
  ON public.auditoria_global FOR ALL
  USING (false)
  WITH CHECK (false);

-- Permitir inserção apenas via função
ALTER TABLE public.auditoria_global FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins e auditores podem ver versões"
  ON public.entidade_versoes FOR SELECT
  USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    has_papel_sistemico(auth.uid(), 'auditor')
  );

CREATE POLICY "Admins podem gerenciar reversões"
  ON public.solicitacoes_reversao FOR ALL
  USING (
    has_papel_sistemico(auth.uid(), 'admin_municipal') OR
    solicitante_id = auth.uid()
  );
