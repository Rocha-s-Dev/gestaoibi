-- =========================
-- ENUMS
-- =========================
CREATE TYPE public.patrimonio_role AS ENUM (
  'gestor_patrimonio',
  'agente_patrimonio',
  'almoxarife',
  'conferente_inventario',
  'fiscal_patrimonio',
  'secretario_administracao',
  'auditor_patrimonio'
);

CREATE TYPE public.status_bem_patrimonial AS ENUM (
  'ativo','em_uso','em_manutencao','ocioso','em_transferencia','baixado','alienado','extraviado'
);

CREATE TYPE public.estado_conservacao_bem AS ENUM (
  'novo','bom','regular','ruim','inservivel'
);

CREATE TYPE public.tipo_movimentacao_bem AS ENUM (
  'transferencia_secretaria','transferencia_unidade','troca_responsavel','mudanca_localizacao'
);

CREATE TYPE public.status_movimentacao_bem AS ENUM (
  'pendente','aprovada','recusada','concluida','cancelada'
);

-- =========================
-- PAPÉIS / EQUIPE
-- =========================
CREATE TABLE public.user_patrimonio_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.patrimonio_role NOT NULL,
  secretaria_id uuid REFERENCES public.secretarias(id) ON DELETE SET NULL,
  unidade_id uuid REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  UNIQUE (user_id, role, secretaria_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_patrimonio_roles TO authenticated;
GRANT ALL ON public.user_patrimonio_roles TO service_role;
ALTER TABLE public.user_patrimonio_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_upr_user ON public.user_patrimonio_roles(user_id);
CREATE INDEX idx_upr_secretaria ON public.user_patrimonio_roles(secretaria_id);

-- Funções de permissão
CREATE OR REPLACE FUNCTION public.has_patrimonio_role(_user_id uuid, _role public.patrimonio_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_patrimonio_roles
    WHERE user_id = _user_id AND role = _role AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_patrimonio(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_municipal(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.user_patrimonio_roles
        WHERE user_id = _user_id AND is_active = true
          AND role IN ('gestor_patrimonio','agente_patrimonio','secretario_administracao')
      );
$$;

CREATE OR REPLACE FUNCTION public.can_view_patrimonio(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_admin_municipal(_user_id)
      OR public.is_auditor(_user_id)
      OR EXISTS (
        SELECT 1 FROM public.user_patrimonio_roles
        WHERE user_id = _user_id AND is_active = true
      );
$$;

CREATE POLICY "Patrimonio roles visiveis para equipe"
ON public.user_patrimonio_roles FOR SELECT TO authenticated
USING (public.can_view_patrimonio(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Gestores gerenciam papeis de patrimonio"
ON public.user_patrimonio_roles FOR ALL TO authenticated
USING (public.is_admin_municipal(auth.uid()) OR public.has_patrimonio_role(auth.uid(), 'gestor_patrimonio'))
WITH CHECK (public.is_admin_municipal(auth.uid()) OR public.has_patrimonio_role(auth.uid(), 'gestor_patrimonio'));

-- =========================
-- CATEGORIAS
-- =========================
CREATE TABLE public.bens_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  nome text NOT NULL,
  codigo text,
  descricao text,
  vida_util_padrao_anos integer,
  depreciavel boolean NOT NULL DEFAULT true,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bens_categorias TO authenticated;
GRANT ALL ON public.bens_categorias TO service_role;
ALTER TABLE public.bens_categorias ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bens_categorias_municipio ON public.bens_categorias(municipio_id);

CREATE POLICY "Categorias visiveis para autenticados"
ON public.bens_categorias FOR SELECT TO authenticated USING (true);

CREATE POLICY "Gestores gerenciam categorias"
ON public.bens_categorias FOR ALL TO authenticated
USING (public.can_manage_patrimonio(auth.uid()))
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

-- =========================
-- BENS PATRIMONIAIS
-- =========================
CREATE TABLE public.bens_patrimoniais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  numero_tombamento text NOT NULL,
  descricao text NOT NULL,
  categoria_id uuid REFERENCES public.bens_categorias(id) ON DELETE SET NULL,
  categoria text,
  tipo_bem text NOT NULL DEFAULT 'movel',
  marca text,
  modelo text,
  numero_serie text,
  estado_conservacao public.estado_conservacao_bem NOT NULL DEFAULT 'bom',
  status public.status_bem_patrimonial NOT NULL DEFAULT 'ativo',
  data_aquisicao date,
  data_tombamento date NOT NULL DEFAULT CURRENT_DATE,
  valor_aquisicao numeric(15,2),
  valor_atual numeric(15,2),
  vida_util_anos integer,
  depreciavel boolean NOT NULL DEFAULT false,
  valor_depreciacao_acumulada numeric(15,2) NOT NULL DEFAULT 0,
  secretaria_id uuid REFERENCES public.secretarias(id) ON DELETE SET NULL,
  unidade_id uuid REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  responsavel_id uuid,
  localizacao text,
  observacoes text,
  qr_code text,
  motivo_baixa text,
  data_baixa date,
  empenho_id uuid REFERENCES public.empenhos(id) ON DELETE SET NULL,
  contrato_id uuid REFERENCES public.contracts(id) ON DELETE SET NULL,
  convenio_id uuid REFERENCES public.convenios(id) ON DELETE SET NULL,
  fornecedor_id uuid REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  veiculo_id uuid REFERENCES public.veiculos_frota(id) ON DELETE SET NULL,
  servico_equipamento_id uuid REFERENCES public.servicos_equipamentos(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT uq_bens_tombamento_municipio UNIQUE (municipio_id, numero_tombamento)
);

GRANT SELECT, INSERT, UPDATE ON public.bens_patrimoniais TO authenticated;
GRANT ALL ON public.bens_patrimoniais TO service_role;
ALTER TABLE public.bens_patrimoniais ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_bens_municipio ON public.bens_patrimoniais(municipio_id);
CREATE INDEX idx_bens_secretaria ON public.bens_patrimoniais(secretaria_id);
CREATE INDEX idx_bens_unidade ON public.bens_patrimoniais(unidade_id);
CREATE INDEX idx_bens_tombamento ON public.bens_patrimoniais(numero_tombamento);
CREATE INDEX idx_bens_status ON public.bens_patrimoniais(status);
CREATE INDEX idx_bens_categoria ON public.bens_patrimoniais(categoria_id);
CREATE INDEX idx_bens_responsavel ON public.bens_patrimoniais(responsavel_id);

CREATE POLICY "Equipe visualiza bens"
ON public.bens_patrimoniais FOR SELECT TO authenticated
USING (
  public.can_view_patrimonio(auth.uid())
  OR responsavel_id = auth.uid()
  OR (secretaria_id IS NOT NULL AND public.has_secretaria_access(auth.uid(), secretaria_id))
);

CREATE POLICY "Gestores cadastram bens"
ON public.bens_patrimoniais FOR INSERT TO authenticated
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

CREATE POLICY "Gestores atualizam bens"
ON public.bens_patrimoniais FOR UPDATE TO authenticated
USING (
  public.can_manage_patrimonio(auth.uid())
  OR (secretaria_id IS NOT NULL AND public.is_secretario_of(auth.uid(), secretaria_id))
)
WITH CHECK (
  public.can_manage_patrimonio(auth.uid())
  OR (secretaria_id IS NOT NULL AND public.is_secretario_of(auth.uid(), secretaria_id))
);

-- =========================
-- TERMOS DE RESPONSABILIDADE
-- =========================
CREATE TABLE public.bens_termos_responsabilidade (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  bem_id uuid NOT NULL REFERENCES public.bens_patrimoniais(id) ON DELETE RESTRICT,
  responsavel_id uuid NOT NULL,
  secretaria_id uuid REFERENCES public.secretarias(id) ON DELETE SET NULL,
  unidade_id uuid REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  data_inicio date NOT NULL DEFAULT CURRENT_DATE,
  data_fim date,
  observacoes text,
  documento_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE ON public.bens_termos_responsabilidade TO authenticated;
GRANT ALL ON public.bens_termos_responsabilidade TO service_role;
ALTER TABLE public.bens_termos_responsabilidade ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_termos_bem ON public.bens_termos_responsabilidade(bem_id);
CREATE INDEX idx_termos_responsavel ON public.bens_termos_responsabilidade(responsavel_id);
CREATE INDEX idx_termos_secretaria ON public.bens_termos_responsabilidade(secretaria_id);

CREATE POLICY "Equipe visualiza termos"
ON public.bens_termos_responsabilidade FOR SELECT TO authenticated
USING (public.can_view_patrimonio(auth.uid()) OR responsavel_id = auth.uid());

CREATE POLICY "Gestores criam termos"
ON public.bens_termos_responsabilidade FOR INSERT TO authenticated
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

CREATE POLICY "Gestores atualizam termos"
ON public.bens_termos_responsabilidade FOR UPDATE TO authenticated
USING (public.can_manage_patrimonio(auth.uid()))
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

-- =========================
-- MOVIMENTAÇÕES
-- =========================
CREATE TABLE public.bens_movimentacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid REFERENCES public.municipios(id) ON DELETE SET NULL,
  bem_id uuid NOT NULL REFERENCES public.bens_patrimoniais(id) ON DELETE RESTRICT,
  tipo_movimentacao public.tipo_movimentacao_bem NOT NULL,
  secretaria_origem_id uuid REFERENCES public.secretarias(id) ON DELETE SET NULL,
  secretaria_destino_id uuid REFERENCES public.secretarias(id) ON DELETE SET NULL,
  unidade_origem_id uuid REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  unidade_destino_id uuid REFERENCES public.unidades_administrativas(id) ON DELETE SET NULL,
  responsavel_origem_id uuid,
  responsavel_destino_id uuid,
  local_origem text,
  local_destino text,
  data_movimentacao date NOT NULL DEFAULT CURRENT_DATE,
  motivo text,
  observacoes text,
  solicitado_por uuid,
  aprovado_por uuid,
  status public.status_movimentacao_bem NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);

GRANT SELECT, INSERT, UPDATE ON public.bens_movimentacoes TO authenticated;
GRANT ALL ON public.bens_movimentacoes TO service_role;
ALTER TABLE public.bens_movimentacoes ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_mov_bem ON public.bens_movimentacoes(bem_id);
CREATE INDEX idx_mov_status ON public.bens_movimentacoes(status);
CREATE INDEX idx_mov_sec_origem ON public.bens_movimentacoes(secretaria_origem_id);
CREATE INDEX idx_mov_sec_destino ON public.bens_movimentacoes(secretaria_destino_id);

CREATE POLICY "Equipe visualiza movimentacoes"
ON public.bens_movimentacoes FOR SELECT TO authenticated
USING (
  public.can_view_patrimonio(auth.uid())
  OR (secretaria_origem_id IS NOT NULL AND public.has_secretaria_access(auth.uid(), secretaria_origem_id))
  OR (secretaria_destino_id IS NOT NULL AND public.has_secretaria_access(auth.uid(), secretaria_destino_id))
);

CREATE POLICY "Gestores registram movimentacoes"
ON public.bens_movimentacoes FOR INSERT TO authenticated
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

CREATE POLICY "Gestores atualizam movimentacoes"
ON public.bens_movimentacoes FOR UPDATE TO authenticated
USING (public.can_manage_patrimonio(auth.uid()))
WITH CHECK (public.can_manage_patrimonio(auth.uid()));

-- =========================
-- TRIGGERS: updated_at
-- =========================
CREATE TRIGGER trg_bens_categorias_updated BEFORE UPDATE ON public.bens_categorias
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bens_patrimoniais_updated BEFORE UPDATE ON public.bens_patrimoniais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bens_termos_updated BEFORE UPDATE ON public.bens_termos_responsabilidade
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bens_mov_updated BEFORE UPDATE ON public.bens_movimentacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_upr_updated BEFORE UPDATE ON public.user_patrimonio_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- AUDITORIA GLOBAL
-- =========================
CREATE TRIGGER trg_auditoria_bens_patrimoniais
AFTER INSERT OR UPDATE ON public.bens_patrimoniais
FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER trg_auditoria_bens_movimentacoes
AFTER INSERT OR UPDATE ON public.bens_movimentacoes
FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

CREATE TRIGGER trg_auditoria_bens_termos
AFTER INSERT OR UPDATE ON public.bens_termos_responsabilidade
FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

-- =========================
-- NUMERAÇÃO AUTOMÁTICA DE TOMBAMENTO
-- =========================
CREATE OR REPLACE FUNCTION public.gerar_numero_tombamento(p_municipio_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ano text := to_char(now(), 'YYYY');
  v_seq integer;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(numero_tombamento, '^\d{4}-', ''), '')::integer), 0) + 1
  INTO v_seq
  FROM public.bens_patrimoniais
  WHERE (p_municipio_id IS NULL OR municipio_id = p_municipio_id)
    AND numero_tombamento ~ ('^' || v_ano || '-\d+$');

  RETURN v_ano || '-' || lpad(v_seq::text, 6, '0');
END;
$$;

-- =========================
-- PROTEÇÃO CONTRA EXCLUSÃO FÍSICA (nenhum grant de DELETE concedido)
-- =========================
CREATE OR REPLACE FUNCTION public.bloquear_delete_bem()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Bens patrimoniais não podem ser excluídos. Realize a baixa do bem.';
END;
$$;

CREATE TRIGGER trg_bloquear_delete_bem
BEFORE DELETE ON public.bens_patrimoniais
FOR EACH ROW EXECUTE FUNCTION public.bloquear_delete_bem();

-- =========================
-- INTEGRAÇÃO SEGURA: servicos_equipamentos.patrimonio_id
-- =========================
ALTER TABLE public.servicos_equipamentos
ADD CONSTRAINT fk_servicos_equipamentos_patrimonio
FOREIGN KEY (patrimonio_id) REFERENCES public.bens_patrimoniais(id) ON DELETE SET NULL;

-- =========================
-- CATEGORIAS PADRÃO
-- =========================
INSERT INTO public.bens_categorias (nome, codigo, vida_util_padrao_anos, depreciavel)
VALUES
  ('Móveis', 'MOV', 10, true),
  ('Equipamentos de Informática', 'INF', 5, true),
  ('Equipamentos Eletrônicos', 'ELE', 5, true),
  ('Máquinas', 'MAQ', 10, true),
  ('Ferramentas', 'FER', 5, true),
  ('Veículos', 'VEI', 10, true),
  ('Equipamentos Médicos', 'MED', 10, true),
  ('Equipamentos Escolares', 'ESC', 10, true),
  ('Mobiliário Escolar', 'MBE', 10, true),
  ('Equipamentos Esportivos', 'ESP', 10, true),
  ('Equipamentos Administrativos', 'ADM', 10, true),
  ('Outros', 'OUT', NULL, false);