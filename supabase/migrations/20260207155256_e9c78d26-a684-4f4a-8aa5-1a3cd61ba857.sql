
-- ============================================================
-- PARTE 2: REESTRUTURAÇÃO RH (CORRIGIDA v3 - colunas corretas)
-- ============================================================

-- 1. ADICIONAR NOVOS CAMPOS NA TABELA PROFILES PARA CONTROLE RH
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS criado_pelo_rh BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rh_responsavel_id UUID,
  ADD COLUMN IF NOT EXISTS data_cadastro_rh TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_cadastral TEXT DEFAULT 'pendente_regularizacao',
  ADD COLUMN IF NOT EXISTS tipo_usuario TEXT DEFAULT 'funcionario',
  ADD COLUMN IF NOT EXISTS requer_troca_senha BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS primeiro_acesso BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_ultimo_login TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS data_inativacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS motivo_inativacao TEXT,
  ADD COLUMN IF NOT EXISTS inativado_por UUID;

-- 2. ADICIONAR SOFT DELETE NA TABELA SECRETARIAS
ALTER TABLE public.secretarias
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS data_inativacao TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS inativado_por UUID,
  ADD COLUMN IF NOT EXISTS motivo_inativacao TEXT;

-- 3. ADICIONAR secretaria_id à tabela cargos_publicos
ALTER TABLE public.cargos_publicos
  ADD COLUMN IF NOT EXISTS secretaria_id UUID REFERENCES public.secretarias(id);

-- 4. CRIAR TABELA DE HISTÓRICO DE VÍNCULOS
CREATE TABLE IF NOT EXISTS public.historico_vinculos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vinculo_id UUID NOT NULL,
  user_id UUID NOT NULL,
  secretaria_id UUID,
  cargo_id UUID,
  funcao_id UUID,
  unidade_id UUID,
  tipo_alteracao TEXT NOT NULL,
  dados_anteriores JSONB,
  dados_novos JSONB,
  motivo TEXT,
  responsavel_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. CRIAR TABELA DE LOG DE ACESSOS
CREATE TABLE IF NOT EXISTS public.log_acessos_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo_acesso TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  secretaria_acessada_id UUID,
  modulo_acessado TEXT,
  bloqueado BOOLEAN DEFAULT false,
  motivo_bloqueio TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. FUNÇÕES DE SEGURANÇA
CREATE OR REPLACE FUNCTION public.is_gestor_rh(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.papeis_usuario
    WHERE user_id = _user_id AND papel IN ('admin_municipal', 'gestor_rh')
      AND is_active = true AND (data_fim IS NULL OR data_fim >= CURRENT_DATE)
  )
$$;

CREATE OR REPLACE FUNCTION public.has_vinculo_funcional_ativo(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.vinculos_funcionais WHERE user_id = _user_id AND situacao = 'ativo')
$$;

CREATE OR REPLACE FUNCTION public.is_usuario_regularizado(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = _user_id
      AND (criado_pelo_rh = true OR status_cadastral != 'pendente_regularizacao')
      AND status_cadastral IN ('ativo', 'pendente_regularizacao')
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_secretaria(_user_id UUID)
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT secretaria_id FROM public.vinculos_funcionais
  WHERE user_id = _user_id AND situacao = 'ativo' AND is_primary = true LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.pode_acessar_secretaria(_user_id UUID, _secretaria_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT CASE WHEN is_admin_municipal(_user_id) THEN true
    ELSE EXISTS (SELECT 1 FROM public.vinculos_funcionais WHERE user_id = _user_id AND secretaria_id = _secretaria_id AND situacao = 'ativo')
  END
$$;

CREATE OR REPLACE FUNCTION public.has_full_system_access(_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_profile RECORD;
BEGIN
  SELECT * INTO v_profile FROM public.profiles WHERE user_id = _user_id;
  IF is_admin_municipal(_user_id) THEN RETURN true; END IF;
  IF v_profile.status_cadastral NOT IN ('ativo') THEN RETURN false; END IF;
  IF NOT v_profile.criado_pelo_rh AND v_profile.status_cadastral = 'pendente_regularizacao' THEN RETURN false; END IF;
  IF NOT has_vinculo_funcional_ativo(_user_id) THEN RETURN false; END IF;
  RETURN true;
END;
$$;

-- 7. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_profiles_status_cadastral ON public.profiles(status_cadastral);
CREATE INDEX IF NOT EXISTS idx_profiles_criado_pelo_rh ON public.profiles(criado_pelo_rh);
CREATE INDEX IF NOT EXISTS idx_vinculos_funcionais_user_situacao ON public.vinculos_funcionais(user_id, situacao);
CREATE INDEX IF NOT EXISTS idx_vinculos_funcionais_secretaria ON public.vinculos_funcionais(secretaria_id);
CREATE INDEX IF NOT EXISTS idx_historico_vinculos_user ON public.historico_vinculos(user_id);
CREATE INDEX IF NOT EXISTS idx_log_acessos_usuarios_user ON public.log_acessos_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_secretarias_ativo ON public.secretarias(ativo);
CREATE INDEX IF NOT EXISTS idx_cargos_publicos_secretaria ON public.cargos_publicos(secretaria_id);

-- 8. RLS
ALTER TABLE public.historico_vinculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_acessos_usuarios ENABLE ROW LEVEL SECURITY;

-- 9. Histórico vinculos RLS
CREATE POLICY "rh_historico_select_admin" ON public.historico_vinculos FOR SELECT TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));
CREATE POLICY "rh_historico_select_own" ON public.historico_vinculos FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "rh_historico_insert" ON public.historico_vinculos FOR INSERT TO authenticated
WITH CHECK (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));

-- 10. Log acessos RLS
CREATE POLICY "rh_log_select_admin" ON public.log_acessos_usuarios FOR SELECT TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));
CREATE POLICY "rh_log_select_own" ON public.log_acessos_usuarios FOR SELECT TO authenticated
USING (user_id = auth.uid());
CREATE POLICY "rh_log_insert" ON public.log_acessos_usuarios FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- 11. Profiles RLS
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "rh_profiles_select" ON public.profiles FOR SELECT TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "rh_profiles_insert" ON public.profiles FOR INSERT TO authenticated
WITH CHECK (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));

CREATE POLICY "rh_profiles_update" ON public.profiles FOR UPDATE TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()) OR user_id = auth.uid())
WITH CHECK (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()) OR user_id = auth.uid());

-- 12. Secretarias RLS
DROP POLICY IF EXISTS "Secretarias são visíveis para todos" ON public.secretarias;
DROP POLICY IF EXISTS "Secretarias visiveis para autenticados" ON public.secretarias;

CREATE POLICY "rh_secretarias_select" ON public.secretarias FOR SELECT TO authenticated
USING (ativo = true OR is_admin_municipal(auth.uid()));

CREATE POLICY "rh_secretarias_insert" ON public.secretarias FOR INSERT TO authenticated
WITH CHECK (is_admin_municipal(auth.uid()));

CREATE POLICY "rh_secretarias_update" ON public.secretarias FOR UPDATE TO authenticated
USING (is_admin_municipal(auth.uid())) WITH CHECK (is_admin_municipal(auth.uid()));

-- 13. Vinculos funcionais RLS
DROP POLICY IF EXISTS "Vinculos funcionais visiveis para admin e rh" ON public.vinculos_funcionais;
DROP POLICY IF EXISTS "Usuario pode ver proprios vinculos" ON public.vinculos_funcionais;

CREATE POLICY "rh_vinculos_select" ON public.vinculos_funcionais FOR SELECT TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()) OR user_id = auth.uid() OR is_secretario_of(auth.uid(), secretaria_id));

CREATE POLICY "rh_vinculos_insert" ON public.vinculos_funcionais FOR INSERT TO authenticated
WITH CHECK (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));

CREATE POLICY "rh_vinculos_update" ON public.vinculos_funcionais FOR UPDATE TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()))
WITH CHECK (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid()));

-- 14. Cargos publicos RLS
DROP POLICY IF EXISTS "Cargos publicos visiveis para autenticados" ON public.cargos_publicos;

CREATE POLICY "rh_cargos_select" ON public.cargos_publicos FOR SELECT TO authenticated
USING (is_admin_municipal(auth.uid()) OR is_gestor_rh(auth.uid())
  OR (secretaria_id IS NOT NULL AND pode_acessar_secretaria(auth.uid(), secretaria_id))
  OR secretaria_id IS NULL);

-- 15. MIGRAR USUÁRIOS EXISTENTES
UPDATE public.profiles SET status_cadastral = 'pendente_regularizacao', criado_pelo_rh = false WHERE status_cadastral IS NULL;

UPDATE public.profiles
SET status_cadastral = 'ativo', criado_pelo_rh = true, requer_troca_senha = false, primeiro_acesso = false, tipo_usuario = 'administrador'
WHERE user_id IN (SELECT user_id FROM public.papeis_usuario WHERE papel = 'admin_municipal' AND is_active = true);

-- 16. Trigger histórico vínculos
CREATE OR REPLACE FUNCTION public.trigger_historico_vinculo()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.historico_vinculos (vinculo_id, user_id, secretaria_id, cargo_id, funcao_id, unidade_id, tipo_alteracao, dados_novos, responsavel_id)
    VALUES (NEW.id, NEW.user_id, NEW.secretaria_id, NEW.cargo_id, NEW.funcao_id, NEW.unidade_id, 'criacao', to_jsonb(NEW), COALESCE(auth.uid(), NEW.user_id));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.historico_vinculos (vinculo_id, user_id, secretaria_id, cargo_id, funcao_id, unidade_id, tipo_alteracao, dados_anteriores, dados_novos, responsavel_id)
    VALUES (NEW.id, NEW.user_id, NEW.secretaria_id, NEW.cargo_id, NEW.funcao_id, NEW.unidade_id,
      CASE WHEN OLD.situacao = 'ativo' AND NEW.situacao != 'ativo' THEN 'inativacao'
           WHEN OLD.situacao != 'ativo' AND NEW.situacao = 'ativo' THEN 'reativacao'
           WHEN OLD.secretaria_id IS DISTINCT FROM NEW.secretaria_id THEN 'transferencia'
           ELSE 'alteracao' END,
      to_jsonb(OLD), to_jsonb(NEW), COALESCE(auth.uid(), NEW.user_id));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_historico_vinculo ON public.vinculos_funcionais;
CREATE TRIGGER trigger_historico_vinculo
AFTER INSERT OR UPDATE ON public.vinculos_funcionais
FOR EACH ROW EXECUTE FUNCTION public.trigger_historico_vinculo();

-- 17. View do RH
CREATE OR REPLACE VIEW public.view_usuarios_rh AS
SELECT 
  p.id, p.user_id, p.name, p.email, p.cpf,
  p.status_cadastral, p.tipo_usuario, p.criado_pelo_rh, p.data_cadastro_rh,
  p.requer_troca_senha, p.primeiro_acesso, p.data_ultimo_login,
  vf.id as vinculo_id, vf.matricula, vf.regime, vf.situacao as situacao_vinculo,
  vf.data_admissao, vf.jornada_semanal,
  s.id as secretaria_id, s.nome as secretaria_nome, s.sigla as secretaria_sigla,
  cp.id as cargo_id, cp.nome as cargo_nome,
  fa.id as funcao_id, fa.nome as funcao_nome,
  ua.id as unidade_id, ua.nome as unidade_nome
FROM public.profiles p
LEFT JOIN public.vinculos_funcionais vf ON vf.user_id = p.user_id AND vf.is_primary = true
LEFT JOIN public.secretarias s ON s.id = vf.secretaria_id
LEFT JOIN public.cargos_publicos cp ON cp.id = vf.cargo_id
LEFT JOIN public.funcoes_administrativas fa ON fa.id = vf.funcao_id
LEFT JOIN public.unidades_administrativas ua ON ua.id = vf.unidade_id;
