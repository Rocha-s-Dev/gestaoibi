
-- =============================================
-- MÓDULO DE SAÚDE PÚBLICA - SCHEMA COMPLETO
-- =============================================

-- Enum para roles de saúde
CREATE TYPE public.health_role AS ENUM ('secretaria_saude', 'diretor_unidade', 'medico', 'enfermeiro', 'recepcionista', 'agente_saude');

-- =============================================
-- TABELA: user_health_roles - Papéis de usuários na saúde
-- =============================================
CREATE TABLE public.user_health_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role health_role NOT NULL,
    unidade_id UUID DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role, unidade_id)
);

ALTER TABLE public.user_health_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: unidades_saude - Cadastro de unidades de saúde
-- =============================================
CREATE TABLE public.unidades_saude (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('UBS', 'UPA', 'Hospital', 'Clinica', 'CAPS', 'Laboratorio')),
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    horario_funcionamento JSONB DEFAULT '{}'::jsonb,
    especialidades TEXT[] DEFAULT '{}',
    responsavel TEXT,
    capacidade_diaria INTEGER,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'manutencao')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.unidades_saude ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: pacientes - Cadastro de pacientes
-- =============================================
CREATE TABLE public.pacientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    data_nascimento DATE,
    sexo TEXT CHECK (sexo IN ('masculino', 'feminino', 'outro')),
    tipo_sanguineo TEXT,
    endereco TEXT,
    bairro TEXT,
    cidade TEXT DEFAULT 'Município',
    telefone TEXT,
    email TEXT,
    cartao_sus TEXT UNIQUE,
    nome_mae TEXT,
    nome_responsavel TEXT,
    telefone_responsavel TEXT,
    alergias TEXT[],
    condicoes_cronicas TEXT[],
    medicamentos_uso_continuo TEXT[],
    observacoes TEXT,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'falecido', 'mudou')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: profissionais_saude - Médicos, enfermeiros, etc
-- =============================================
CREATE TABLE public.profissionais_saude (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    nome TEXT NOT NULL,
    cpf TEXT,
    registro_conselho TEXT, -- CRM, COREN, etc
    tipo_conselho TEXT, -- CRM, COREN, CRF, etc
    especialidade TEXT,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    telefone TEXT,
    email TEXT,
    carga_horaria_semanal INTEGER,
    status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'ferias', 'licenca')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profissionais_saude ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: agendamentos - Agendamento de consultas
-- =============================================
CREATE TABLE public.agendamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais_saude(id) ON DELETE SET NULL,
    unidade_id UUID NOT NULL REFERENCES public.unidades_saude(id) ON DELETE CASCADE,
    data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'retorno', 'exame', 'vacina', 'procedimento', 'urgencia')),
    especialidade TEXT,
    status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'em_atendimento', 'realizado', 'cancelado', 'faltou')),
    prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    observacoes TEXT,
    motivo_cancelamento TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: prontuarios - Prontuário eletrônico do paciente
-- =============================================
CREATE TABLE public.prontuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    agendamento_id UUID REFERENCES public.agendamentos(id) ON DELETE SET NULL,
    profissional_id UUID REFERENCES public.profissionais_saude(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    data_atendimento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    tipo_atendimento TEXT NOT NULL CHECK (tipo_atendimento IN ('consulta', 'emergencia', 'retorno', 'procedimento', 'exame')),
    queixa_principal TEXT,
    historia_doenca_atual TEXT,
    exame_fisico JSONB DEFAULT '{}'::jsonb,
    sinais_vitais JSONB DEFAULT '{}'::jsonb, -- pressao, temperatura, peso, altura, FC, FR
    hipotese_diagnostica TEXT,
    cid_principal TEXT,
    cid_secundarios TEXT[],
    conduta TEXT,
    prescricao_medicamentos JSONB DEFAULT '[]'::jsonb,
    solicitacao_exames JSONB DEFAULT '[]'::jsonb,
    encaminhamentos TEXT[],
    observacoes TEXT,
    assinatura_digital TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: tratamentos - Acompanhamento de tratamentos contínuos
-- =============================================
CREATE TABLE public.tratamentos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais_saude(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    nome_tratamento TEXT NOT NULL,
    cid TEXT,
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_prevista_fim DATE,
    data_fim DATE,
    status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'suspenso', 'abandonado')),
    progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
    medicamentos JSONB DEFAULT '[]'::jsonb,
    orientacoes TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tratamentos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: evolucoes_tratamento - Evolução dos tratamentos
-- =============================================
CREATE TABLE public.evolucoes_tratamento (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tratamento_id UUID NOT NULL REFERENCES public.tratamentos(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais_saude(id) ON DELETE SET NULL,
    data_evolucao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    descricao TEXT NOT NULL,
    sinais_vitais JSONB DEFAULT '{}'::jsonb,
    medicamentos_ajustados JSONB DEFAULT '[]'::jsonb,
    resultado_exames TEXT,
    proxima_avaliacao DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.evolucoes_tratamento ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: vacinas - Registro de vacinação
-- =============================================
CREATE TABLE public.vacinas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES public.profissionais_saude(id) ON DELETE SET NULL,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    nome_vacina TEXT NOT NULL,
    lote TEXT,
    fabricante TEXT,
    dose TEXT, -- 1ª dose, 2ª dose, reforço, etc
    data_aplicacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_proxima_dose DATE,
    local_aplicacao TEXT,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vacinas ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: indicadores_saude - Indicadores de saúde pública
-- =============================================
CREATE TABLE public.indicadores_saude (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('morbidade', 'mortalidade', 'vacinacao', 'atendimento', 'outros')),
    valor NUMERIC NOT NULL,
    unidade_medida TEXT NOT NULL,
    periodo TEXT NOT NULL, -- "2024", "Jan/2024", etc
    meta NUMERIC,
    tendencia TEXT CHECK (tendencia IN ('alta', 'baixa', 'estavel')),
    status TEXT CHECK (status IN ('critico', 'atencao', 'normal', 'excelente')),
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.indicadores_saude ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: metas_saude - Metas de saúde pública
-- =============================================
CREATE TABLE public.metas_saude (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('cobertura_vacinal', 'reducao_mortalidade', 'atendimentos', 'tempo_espera', 'outros')),
    descricao TEXT,
    valor_meta NUMERIC NOT NULL,
    valor_atual NUMERIC DEFAULT 0,
    unidade_medida TEXT NOT NULL,
    prazo DATE,
    status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'atingida', 'nao_atingida', 'cancelada')),
    responsavel TEXT,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.metas_saude ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: pesquisas_satisfacao - Pesquisas de satisfação
-- =============================================
CREATE TABLE public.pesquisas_satisfacao (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    categoria TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'finalizada', 'cancelada')),
    total_respostas INTEGER DEFAULT 0,
    nota_media NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pesquisas_satisfacao ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: respostas_pesquisa - Respostas das pesquisas
-- =============================================
CREATE TABLE public.respostas_pesquisa (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    pesquisa_id UUID NOT NULL REFERENCES public.pesquisas_satisfacao(id) ON DELETE CASCADE,
    paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
    nota_atendimento INTEGER CHECK (nota_atendimento >= 1 AND nota_atendimento <= 5),
    nota_infraestrutura INTEGER CHECK (nota_infraestrutura >= 1 AND nota_infraestrutura <= 5),
    nota_tempo_espera INTEGER CHECK (nota_tempo_espera >= 1 AND nota_tempo_espera <= 5),
    nota_comunicacao INTEGER CHECK (nota_comunicacao >= 1 AND nota_comunicacao <= 5),
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.respostas_pesquisa ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABELA: alertas_saude - Alertas epidemiológicos
-- =============================================
CREATE TABLE public.alertas_saude (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('epidemia', 'surto', 'campanha', 'aviso', 'urgente')),
    descricao TEXT NOT NULL,
    nivel TEXT NOT NULL CHECK (nivel IN ('info', 'warning', 'critical')),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE,
    ativo BOOLEAN DEFAULT true,
    unidade_id UUID REFERENCES public.unidades_saude(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alertas_saude ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNÇÕES DE SEGURANÇA PARA SAÚDE
-- =============================================

-- Verifica se usuário é secretaria de saúde
CREATE OR REPLACE FUNCTION public.is_secretaria_saude(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = 'secretaria_saude'
  )
$$;

-- Verifica se usuário tem um papel específico na saúde
CREATE OR REPLACE FUNCTION public.has_health_role(_user_id uuid, _role health_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Verifica se usuário tem papel em uma unidade específica
CREATE OR REPLACE FUNCTION public.has_health_role_in_unidade(_user_id uuid, _role health_role, _unidade_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_health_roles
    WHERE user_id = _user_id
      AND role = _role
      AND (unidade_id = _unidade_id OR unidade_id IS NULL)
  )
$$;

-- Retorna IDs das unidades do usuário
CREATE OR REPLACE FUNCTION public.get_user_unidade_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT unidade_id
  FROM public.user_health_roles
  WHERE user_id = _user_id
    AND unidade_id IS NOT NULL
$$;

-- =============================================
-- RLS POLICIES - user_health_roles
-- =============================================
CREATE POLICY "Secretaria full access roles" ON public.user_health_roles FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Users view own roles" ON public.user_health_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- =============================================
-- RLS POLICIES - unidades_saude
-- =============================================
CREATE POLICY "Secretaria full access unidades" ON public.unidades_saude FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Diretor manage own unidade" ON public.unidades_saude FOR ALL TO authenticated
  USING (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', id))
  WITH CHECK (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', id));

CREATE POLICY "Staff view assigned unidade" ON public.unidades_saude FOR SELECT TO authenticated
  USING (id IN (SELECT public.get_user_unidade_ids(auth.uid())));

-- =============================================
-- RLS POLICIES - pacientes
-- =============================================
CREATE POLICY "Secretaria full access pacientes" ON public.pacientes FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff manage pacientes" ON public.pacientes FOR ALL TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'medico') OR
    public.has_health_role(auth.uid(), 'enfermeiro') OR
    public.has_health_role(auth.uid(), 'recepcionista') OR
    public.has_health_role(auth.uid(), 'diretor_unidade')
  )
  WITH CHECK (
    public.has_health_role(auth.uid(), 'medico') OR
    public.has_health_role(auth.uid(), 'enfermeiro') OR
    public.has_health_role(auth.uid(), 'recepcionista') OR
    public.has_health_role(auth.uid(), 'diretor_unidade')
  );

-- =============================================
-- RLS POLICIES - profissionais_saude
-- =============================================
CREATE POLICY "Secretaria full access profissionais" ON public.profissionais_saude FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Diretor manage unidade profissionais" ON public.profissionais_saude FOR ALL TO authenticated
  USING (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', unidade_id))
  WITH CHECK (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', unidade_id));

CREATE POLICY "Staff view profissionais" ON public.profissionais_saude FOR SELECT TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'medico') OR
    public.has_health_role(auth.uid(), 'enfermeiro') OR
    public.has_health_role(auth.uid(), 'recepcionista')
  );

-- =============================================
-- RLS POLICIES - agendamentos
-- =============================================
CREATE POLICY "Secretaria full access agendamentos" ON public.agendamentos FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff manage unidade agendamentos" ON public.agendamentos FOR ALL TO authenticated
  USING (unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid())))
  WITH CHECK (unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid())));

-- =============================================
-- RLS POLICIES - prontuarios
-- =============================================
CREATE POLICY "Secretaria full access prontuarios" ON public.prontuarios FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Medico manage prontuarios" ON public.prontuarios FOR ALL TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'medico') AND
    unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
  )
  WITH CHECK (
    public.has_health_role(auth.uid(), 'medico') AND
    unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
  );

CREATE POLICY "Enfermeiro view prontuarios" ON public.prontuarios FOR SELECT TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'enfermeiro') AND
    unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
  );

-- =============================================
-- RLS POLICIES - tratamentos
-- =============================================
CREATE POLICY "Secretaria full access tratamentos" ON public.tratamentos FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff manage tratamentos" ON public.tratamentos FOR ALL TO authenticated
  USING (
    (public.has_health_role(auth.uid(), 'medico') OR public.has_health_role(auth.uid(), 'enfermeiro')) AND
    unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
  )
  WITH CHECK (
    (public.has_health_role(auth.uid(), 'medico') OR public.has_health_role(auth.uid(), 'enfermeiro')) AND
    unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
  );

-- =============================================
-- RLS POLICIES - evolucoes_tratamento
-- =============================================
CREATE POLICY "Secretaria full access evolucoes" ON public.evolucoes_tratamento FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff manage evolucoes" ON public.evolucoes_tratamento FOR ALL TO authenticated
  USING (
    tratamento_id IN (
      SELECT t.id FROM public.tratamentos t
      WHERE t.unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
    )
  )
  WITH CHECK (
    tratamento_id IN (
      SELECT t.id FROM public.tratamentos t
      WHERE t.unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
    )
  );

-- =============================================
-- RLS POLICIES - vacinas
-- =============================================
CREATE POLICY "Secretaria full access vacinas" ON public.vacinas FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff manage vacinas" ON public.vacinas FOR ALL TO authenticated
  USING (unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid())))
  WITH CHECK (unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid())));

-- =============================================
-- RLS POLICIES - indicadores_saude
-- =============================================
CREATE POLICY "Secretaria full access indicadores" ON public.indicadores_saude FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff view indicadores" ON public.indicadores_saude FOR SELECT TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'diretor_unidade') OR
    public.has_health_role(auth.uid(), 'medico') OR
    public.has_health_role(auth.uid(), 'enfermeiro')
  );

-- =============================================
-- RLS POLICIES - metas_saude
-- =============================================
CREATE POLICY "Secretaria full access metas_saude" ON public.metas_saude FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Diretor view metas" ON public.metas_saude FOR SELECT TO authenticated
  USING (public.has_health_role(auth.uid(), 'diretor_unidade'));

-- =============================================
-- RLS POLICIES - pesquisas_satisfacao
-- =============================================
CREATE POLICY "Secretaria full access pesquisas" ON public.pesquisas_satisfacao FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Diretor manage unidade pesquisas" ON public.pesquisas_satisfacao FOR ALL TO authenticated
  USING (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', unidade_id))
  WITH CHECK (public.has_health_role_in_unidade(auth.uid(), 'diretor_unidade', unidade_id));

-- =============================================
-- RLS POLICIES - respostas_pesquisa
-- =============================================
CREATE POLICY "Secretaria full access respostas" ON public.respostas_pesquisa FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Public can submit resposta" ON public.respostas_pesquisa FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff view respostas" ON public.respostas_pesquisa FOR SELECT TO authenticated
  USING (
    pesquisa_id IN (
      SELECT p.id FROM public.pesquisas_satisfacao p
      WHERE p.unidade_id IN (SELECT public.get_user_unidade_ids(auth.uid()))
    )
  );

-- =============================================
-- RLS POLICIES - alertas_saude
-- =============================================
CREATE POLICY "Secretaria full access alertas" ON public.alertas_saude FOR ALL TO authenticated
  USING (public.is_secretaria_saude(auth.uid()))
  WITH CHECK (public.is_secretaria_saude(auth.uid()));

CREATE POLICY "Staff view alertas" ON public.alertas_saude FOR SELECT TO authenticated
  USING (
    public.has_health_role(auth.uid(), 'diretor_unidade') OR
    public.has_health_role(auth.uid(), 'medico') OR
    public.has_health_role(auth.uid(), 'enfermeiro') OR
    public.has_health_role(auth.uid(), 'agente_saude')
  );

-- =============================================
-- TRIGGERS para updated_at
-- =============================================
CREATE TRIGGER update_unidades_saude_updated_at
BEFORE UPDATE ON public.unidades_saude
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pacientes_updated_at
BEFORE UPDATE ON public.pacientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profissionais_saude_updated_at
BEFORE UPDATE ON public.profissionais_saude
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
BEFORE UPDATE ON public.agendamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prontuarios_updated_at
BEFORE UPDATE ON public.prontuarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tratamentos_updated_at
BEFORE UPDATE ON public.tratamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicadores_saude_updated_at
BEFORE UPDATE ON public.indicadores_saude
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_metas_saude_updated_at
BEFORE UPDATE ON public.metas_saude
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pesquisas_satisfacao_updated_at
BEFORE UPDATE ON public.pesquisas_satisfacao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ÍNDICES para performance
-- =============================================
CREATE INDEX idx_pacientes_cpf ON public.pacientes(cpf);
CREATE INDEX idx_pacientes_cartao_sus ON public.pacientes(cartao_sus);
CREATE INDEX idx_agendamentos_data_hora ON public.agendamentos(data_hora);
CREATE INDEX idx_agendamentos_paciente ON public.agendamentos(paciente_id);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX idx_prontuarios_paciente ON public.prontuarios(paciente_id);
CREATE INDEX idx_prontuarios_data ON public.prontuarios(data_atendimento);
CREATE INDEX idx_tratamentos_paciente ON public.tratamentos(paciente_id);
CREATE INDEX idx_tratamentos_status ON public.tratamentos(status);
CREATE INDEX idx_vacinas_paciente ON public.vacinas(paciente_id);
