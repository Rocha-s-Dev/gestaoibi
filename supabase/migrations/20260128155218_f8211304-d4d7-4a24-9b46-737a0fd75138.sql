-- =============================================
-- FASE 1: FUNDAÇÃO DO MÓDULO DE RH
-- =============================================

-- 1. EXPANDIR TABELA PROFILES COM DADOS PESSOAIS COMPLETOS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS rg TEXT,
ADD COLUMN IF NOT EXISTS rg_orgao_emissor TEXT,
ADD COLUMN IF NOT EXISTS rg_uf TEXT,
ADD COLUMN IF NOT EXISTS data_nascimento DATE,
ADD COLUMN IF NOT EXISTS sexo TEXT CHECK (sexo IN ('M', 'F', 'O')),
ADD COLUMN IF NOT EXISTS estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
ADD COLUMN IF NOT EXISTS nacionalidade TEXT DEFAULT 'Brasileira',
ADD COLUMN IF NOT EXISTS naturalidade TEXT,
ADD COLUMN IF NOT EXISTS nome_mae TEXT,
ADD COLUMN IF NOT EXISTS nome_pai TEXT,
ADD COLUMN IF NOT EXISTS pis_pasep TEXT,
ADD COLUMN IF NOT EXISTS titulo_eleitor TEXT,
ADD COLUMN IF NOT EXISTS zona_eleitoral TEXT,
ADD COLUMN IF NOT EXISTS secao_eleitoral TEXT,
ADD COLUMN IF NOT EXISTS ctps_numero TEXT,
ADD COLUMN IF NOT EXISTS ctps_serie TEXT,
ADD COLUMN IF NOT EXISTS ctps_uf TEXT,
ADD COLUMN IF NOT EXISTS cnh_numero TEXT,
ADD COLUMN IF NOT EXISTS cnh_categoria TEXT,
ADD COLUMN IF NOT EXISTS cnh_validade DATE,
ADD COLUMN IF NOT EXISTS telefone_residencial TEXT,
ADD COLUMN IF NOT EXISTS telefone_celular TEXT,
ADD COLUMN IF NOT EXISTS endereco_logradouro TEXT,
ADD COLUMN IF NOT EXISTS endereco_numero TEXT,
ADD COLUMN IF NOT EXISTS endereco_complemento TEXT,
ADD COLUMN IF NOT EXISTS endereco_bairro TEXT,
ADD COLUMN IF NOT EXISTS endereco_cidade TEXT,
ADD COLUMN IF NOT EXISTS endereco_uf TEXT CHECK (endereco_uf IS NULL OR LENGTH(endereco_uf) = 2),
ADD COLUMN IF NOT EXISTS endereco_cep TEXT,
ADD COLUMN IF NOT EXISTS foto_url TEXT,
ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Criar índice único para CPF
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf) WHERE cpf IS NOT NULL;

-- 2. CRIAR TABELA DE DEPENDENTES
CREATE TABLE IF NOT EXISTS public.dependentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servidor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE NOT NULL,
  parentesco TEXT NOT NULL CHECK (parentesco IN (
    'conjuge', 'filho', 'filha', 'enteado', 'enteada', 
    'pai', 'mae', 'irmao', 'irma', 'outro'
  )),
  sexo TEXT CHECK (sexo IN ('M', 'F', 'O')),
  possui_deficiencia BOOLEAN DEFAULT false,
  descricao_deficiencia TEXT,
  ir_dependente BOOLEAN DEFAULT false,
  plano_saude_dependente BOOLEAN DEFAULT false,
  salario_familia_dependente BOOLEAN DEFAULT false,
  data_inicio_dependencia DATE,
  data_fim_dependencia DATE,
  certidao_tipo TEXT CHECK (certidao_tipo IN ('nascimento', 'casamento', 'averbacao')),
  certidao_numero TEXT,
  certidao_livro TEXT,
  certidao_folha TEXT,
  certidao_cartorio TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para dependentes
CREATE INDEX IF NOT EXISTS idx_dependentes_servidor ON public.dependentes(servidor_id);
CREATE INDEX IF NOT EXISTS idx_dependentes_cpf ON public.dependentes(cpf) WHERE cpf IS NOT NULL;

-- 3. CRIAR TABELA DE DADOS BANCÁRIOS
CREATE TABLE IF NOT EXISTS public.dados_bancarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servidor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  banco_codigo TEXT NOT NULL,
  banco_nome TEXT NOT NULL,
  agencia TEXT NOT NULL,
  agencia_digito TEXT,
  conta TEXT NOT NULL,
  conta_digito TEXT,
  tipo_conta TEXT NOT NULL CHECK (tipo_conta IN ('corrente', 'poupanca', 'salario')),
  pix_tipo TEXT CHECK (pix_tipo IN ('cpf', 'email', 'telefone', 'aleatorio')),
  pix_chave TEXT,
  conta_principal BOOLEAN DEFAULT false,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_servidor_conta_principal UNIQUE (servidor_id, conta_principal) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Índices para dados bancários
CREATE INDEX IF NOT EXISTS idx_dados_bancarios_servidor ON public.dados_bancarios(servidor_id);

-- 4. HABILITAR RLS
ALTER TABLE public.dependentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dados_bancarios ENABLE ROW LEVEL SECURITY;

-- 5. POLÍTICAS RLS PARA DEPENDENTES
CREATE POLICY "Admins podem ver todos dependentes" ON public.dependentes
  FOR SELECT USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem criar dependentes" ON public.dependentes
  FOR INSERT WITH CHECK (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem editar dependentes" ON public.dependentes
  FOR UPDATE USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem deletar dependentes" ON public.dependentes
  FOR DELETE USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Secretários podem ver dependentes de sua secretaria" ON public.dependentes
  FOR SELECT USING (
    public.has_papel_sistemico(auth.uid(), 'secretario') AND
    EXISTS (
      SELECT 1 FROM public.vinculos_funcionais vf
      JOIN public.papeis_usuario pu ON pu.secretaria_id = vf.secretaria_id
      WHERE vf.user_id = dependentes.servidor_id
        AND pu.user_id = auth.uid()
        AND pu.is_active = true
    )
  );

CREATE POLICY "Servidor pode ver seus próprios dependentes" ON public.dependentes
  FOR SELECT USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 6. POLÍTICAS RLS PARA DADOS BANCÁRIOS
CREATE POLICY "Admins podem ver todos dados bancários" ON public.dados_bancarios
  FOR SELECT USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem criar dados bancários" ON public.dados_bancarios
  FOR INSERT WITH CHECK (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem editar dados bancários" ON public.dados_bancarios
  FOR UPDATE USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Admins podem deletar dados bancários" ON public.dados_bancarios
  FOR DELETE USING (public.has_papel_sistemico(auth.uid(), 'admin_municipal'));

CREATE POLICY "Servidor pode ver seus próprios dados bancários" ON public.dados_bancarios
  FOR SELECT USING (
    servidor_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- 7. TRIGGERS DE UPDATED_AT
CREATE TRIGGER update_dependentes_updated_at
  BEFORE UPDATE ON public.dependentes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dados_bancarios_updated_at
  BEFORE UPDATE ON public.dados_bancarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. TRIGGERS DE AUDITORIA
CREATE TRIGGER audit_dependentes
  AFTER INSERT OR UPDATE OR DELETE ON public.dependentes
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER audit_dados_bancarios
  AFTER INSERT OR UPDATE OR DELETE ON public.dados_bancarios
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER audit_profiles_rh
  AFTER UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();