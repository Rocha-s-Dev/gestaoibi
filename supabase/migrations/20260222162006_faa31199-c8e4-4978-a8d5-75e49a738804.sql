
-- Estoque Farmacêutico (medicamentos já criadas na migração anterior que falhou parcialmente)
CREATE TABLE IF NOT EXISTS public.medicamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  principio_ativo TEXT,
  dosagem TEXT,
  apresentacao TEXT,
  codigo_interno TEXT,
  estoque_minimo INTEGER NOT NULL DEFAULT 10,
  unidade_medida TEXT NOT NULL DEFAULT 'comprimido',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lotes_medicamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicamento_id UUID NOT NULL REFERENCES public.medicamentos(id),
  numero_lote TEXT NOT NULL,
  data_validade DATE NOT NULL,
  quantidade_inicial INTEGER NOT NULL,
  quantidade_atual INTEGER NOT NULL,
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  fornecedor TEXT,
  nota_fiscal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicamento_id UUID NOT NULL REFERENCES public.medicamentos(id),
  lote_id UUID REFERENCES public.lotes_medicamentos(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida', 'ajuste')),
  quantidade INTEGER NOT NULL,
  motivo TEXT,
  profissional_id UUID REFERENCES public.profissionais_saude(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.dispensacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicamento_id UUID NOT NULL REFERENCES public.medicamentos(id),
  lote_id UUID REFERENCES public.lotes_medicamentos(id),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  prontuario_id UUID REFERENCES public.prontuarios(id),
  profissional_id UUID NOT NULL REFERENCES public.profissionais_saude(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  quantidade INTEGER NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vacinação - vacinas já existe, adicionar colunas que faltam se necessário
ALTER TABLE public.vacinas ADD COLUMN IF NOT EXISTS fabricante TEXT;
ALTER TABLE public.vacinas ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE public.vacinas ADD COLUMN IF NOT EXISTS doses_necessarias INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.vacinas ADD COLUMN IF NOT EXISTS intervalo_doses_dias INTEGER;
ALTER TABLE public.vacinas ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS public.aplicacoes_vacinas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  vacina_id UUID NOT NULL REFERENCES public.vacinas(id),
  lote TEXT,
  dose INTEGER NOT NULL DEFAULT 1,
  profissional_id UUID NOT NULL REFERENCES public.profissionais_saude(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  data_aplicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campanhas_vacinacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  publico_alvo TEXT,
  vacina_id UUID REFERENCES public.vacinas(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  meta_cobertura NUMERIC(5,2),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Regulação / Encaminhamentos
CREATE TABLE IF NOT EXISTS public.encaminhamentos_saude (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  especialidade TEXT NOT NULL,
  justificativa TEXT NOT NULL,
  prioridade TEXT NOT NULL DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  status TEXT NOT NULL DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'regulada', 'agendada', 'concluida', 'cancelada')),
  medico_solicitante_id UUID NOT NULL REFERENCES public.profissionais_saude(id),
  unidade_origem_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  unidade_destino_id UUID REFERENCES public.unidades_saude(id),
  observacoes TEXT,
  data_regulacao DATE,
  data_agendamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exames
CREATE TABLE IF NOT EXISTS public.exames_saude (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  tipo TEXT NOT NULL,
  justificativa TEXT,
  medico_solicitante_id UUID NOT NULL REFERENCES public.profissionais_saude(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  status TEXT NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'realizado', 'resultado_disponivel', 'cancelado')),
  data_realizacao DATE,
  resultado TEXT,
  laudo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Internações
CREATE TABLE IF NOT EXISTS public.internacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id),
  medico_responsavel_id UUID NOT NULL REFERENCES public.profissionais_saude(id),
  data_entrada TIMESTAMPTZ NOT NULL DEFAULT now(),
  leito TEXT,
  motivo_internacao TEXT NOT NULL,
  evolucao TEXT,
  data_alta TIMESTAMPTZ,
  motivo_alta TEXT,
  status TEXT NOT NULL DEFAULT 'internado' CHECK (status IN ('internado', 'alta', 'transferido', 'obito')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Programas Federais
CREATE TABLE IF NOT EXISTS public.programas_federais_saude (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'previne_brasil' CHECK (tipo IN ('previne_brasil', 'saude_familia', 'saude_bucal', 'nasf', 'outro')),
  meta_anual NUMERIC(10,2),
  percentual_execucao NUMERIC(5,2) DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.indicadores_programas_saude (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programa_id UUID NOT NULL REFERENCES public.programas_federais_saude(id),
  nome TEXT NOT NULL,
  meta NUMERIC(10,2),
  valor_atual NUMERIC(10,2) DEFAULT 0,
  unidade_medida TEXT,
  competencia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LGPD
CREATE TABLE IF NOT EXISTS public.log_acesso_prontuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cargo TEXT NOT NULL,
  unidade_id UUID REFERENCES public.unidades_saude(id),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  prontuario_id UUID REFERENCES public.prontuarios(id),
  acao TEXT NOT NULL,
  hash_registro TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.consentimentos_lgpd (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id),
  tipo_consentimento TEXT NOT NULL,
  consentido BOOLEAN NOT NULL DEFAULT false,
  data_consentimento TIMESTAMPTZ NOT NULL DEFAULT now(),
  responsavel_coleta_id UUID,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triagem
ALTER TABLE public.agendamentos ADD COLUMN IF NOT EXISTS classificacao_risco TEXT CHECK (classificacao_risco IN ('verde', 'amarelo', 'vermelho'));

-- RLS
ALTER TABLE public.medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lotes_medicamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispensacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicacoes_vacinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campanhas_vacinacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encaminhamentos_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exames_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.internacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas_federais_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_programas_saude ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_acesso_prontuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consentimentos_lgpd ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medicamentos' AND policyname = 'auth_select_medicamentos') THEN
    CREATE POLICY "auth_select_medicamentos" ON public.medicamentos FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medicamentos' AND policyname = 'auth_insert_medicamentos') THEN
    CREATE POLICY "auth_insert_medicamentos" ON public.medicamentos FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'medicamentos' AND policyname = 'auth_update_medicamentos') THEN
    CREATE POLICY "auth_update_medicamentos" ON public.medicamentos FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lotes_medicamentos' AND policyname = 'auth_select_lotes') THEN
    CREATE POLICY "auth_select_lotes" ON public.lotes_medicamentos FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lotes_medicamentos' AND policyname = 'auth_insert_lotes') THEN
    CREATE POLICY "auth_insert_lotes" ON public.lotes_medicamentos FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'lotes_medicamentos' AND policyname = 'auth_update_lotes') THEN
    CREATE POLICY "auth_update_lotes" ON public.lotes_medicamentos FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'movimentacoes_estoque' AND policyname = 'auth_select_mov') THEN
    CREATE POLICY "auth_select_mov" ON public.movimentacoes_estoque FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'movimentacoes_estoque' AND policyname = 'auth_insert_mov') THEN
    CREATE POLICY "auth_insert_mov" ON public.movimentacoes_estoque FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dispensacoes' AND policyname = 'auth_select_disp') THEN
    CREATE POLICY "auth_select_disp" ON public.dispensacoes FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dispensacoes' AND policyname = 'auth_insert_disp') THEN
    CREATE POLICY "auth_insert_disp" ON public.dispensacoes FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aplicacoes_vacinas' AND policyname = 'auth_select_aplic') THEN
    CREATE POLICY "auth_select_aplic" ON public.aplicacoes_vacinas FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aplicacoes_vacinas' AND policyname = 'auth_insert_aplic') THEN
    CREATE POLICY "auth_insert_aplic" ON public.aplicacoes_vacinas FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas_vacinacao' AND policyname = 'auth_select_camp') THEN
    CREATE POLICY "auth_select_camp" ON public.campanhas_vacinacao FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas_vacinacao' AND policyname = 'auth_insert_camp') THEN
    CREATE POLICY "auth_insert_camp" ON public.campanhas_vacinacao FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campanhas_vacinacao' AND policyname = 'auth_update_camp') THEN
    CREATE POLICY "auth_update_camp" ON public.campanhas_vacinacao FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'encaminhamentos_saude' AND policyname = 'auth_select_enc') THEN
    CREATE POLICY "auth_select_enc" ON public.encaminhamentos_saude FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'encaminhamentos_saude' AND policyname = 'auth_insert_enc') THEN
    CREATE POLICY "auth_insert_enc" ON public.encaminhamentos_saude FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'encaminhamentos_saude' AND policyname = 'auth_update_enc') THEN
    CREATE POLICY "auth_update_enc" ON public.encaminhamentos_saude FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exames_saude' AND policyname = 'auth_select_exam') THEN
    CREATE POLICY "auth_select_exam" ON public.exames_saude FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exames_saude' AND policyname = 'auth_insert_exam') THEN
    CREATE POLICY "auth_insert_exam" ON public.exames_saude FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exames_saude' AND policyname = 'auth_update_exam') THEN
    CREATE POLICY "auth_update_exam" ON public.exames_saude FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internacoes' AND policyname = 'auth_select_int') THEN
    CREATE POLICY "auth_select_int" ON public.internacoes FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internacoes' AND policyname = 'auth_insert_int') THEN
    CREATE POLICY "auth_insert_int" ON public.internacoes FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'internacoes' AND policyname = 'auth_update_int') THEN
    CREATE POLICY "auth_update_int" ON public.internacoes FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'programas_federais_saude' AND policyname = 'auth_select_prog') THEN
    CREATE POLICY "auth_select_prog" ON public.programas_federais_saude FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'programas_federais_saude' AND policyname = 'auth_insert_prog') THEN
    CREATE POLICY "auth_insert_prog" ON public.programas_federais_saude FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'programas_federais_saude' AND policyname = 'auth_update_prog') THEN
    CREATE POLICY "auth_update_prog" ON public.programas_federais_saude FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'indicadores_programas_saude' AND policyname = 'auth_select_ind') THEN
    CREATE POLICY "auth_select_ind" ON public.indicadores_programas_saude FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'indicadores_programas_saude' AND policyname = 'auth_insert_ind') THEN
    CREATE POLICY "auth_insert_ind" ON public.indicadores_programas_saude FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'indicadores_programas_saude' AND policyname = 'auth_update_ind') THEN
    CREATE POLICY "auth_update_ind" ON public.indicadores_programas_saude FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'log_acesso_prontuario' AND policyname = 'auth_select_log') THEN
    CREATE POLICY "auth_select_log" ON public.log_acesso_prontuario FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'log_acesso_prontuario' AND policyname = 'auth_insert_log') THEN
    CREATE POLICY "auth_insert_log" ON public.log_acesso_prontuario FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consentimentos_lgpd' AND policyname = 'auth_select_cons') THEN
    CREATE POLICY "auth_select_cons" ON public.consentimentos_lgpd FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consentimentos_lgpd' AND policyname = 'auth_insert_cons') THEN
    CREATE POLICY "auth_insert_cons" ON public.consentimentos_lgpd FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consentimentos_lgpd' AND policyname = 'auth_update_cons') THEN
    CREATE POLICY "auth_update_cons" ON public.consentimentos_lgpd FOR UPDATE TO authenticated USING (true);
  END IF;
END $$;

-- Triggers
DROP TRIGGER IF EXISTS update_medicamentos_updated_at ON public.medicamentos;
CREATE TRIGGER update_medicamentos_updated_at BEFORE UPDATE ON public.medicamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_campanhas_vacinacao_updated_at ON public.campanhas_vacinacao;
CREATE TRIGGER update_campanhas_vacinacao_updated_at BEFORE UPDATE ON public.campanhas_vacinacao FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_encaminhamentos_updated_at ON public.encaminhamentos_saude;
CREATE TRIGGER update_encaminhamentos_updated_at BEFORE UPDATE ON public.encaminhamentos_saude FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_exames_updated_at ON public.exames_saude;
CREATE TRIGGER update_exames_updated_at BEFORE UPDATE ON public.exames_saude FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_internacoes_updated_at ON public.internacoes;
CREATE TRIGGER update_internacoes_updated_at BEFORE UPDATE ON public.internacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_programas_federais_updated_at ON public.programas_federais_saude;
CREATE TRIGGER update_programas_federais_updated_at BEFORE UPDATE ON public.programas_federais_saude FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
