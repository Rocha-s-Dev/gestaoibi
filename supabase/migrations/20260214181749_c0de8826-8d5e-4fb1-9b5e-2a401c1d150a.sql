
-- Unidades CRAS/CREAS
CREATE TABLE public.unidades_socioassistenciais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'CRAS', -- CRAS, CREAS, Centro POP, Abrigo
  endereco TEXT,
  bairro TEXT,
  telefone TEXT,
  email TEXT,
  coordenador_id UUID REFERENCES public.profiles(user_id),
  capacidade_atendimento INTEGER,
  horario_funcionamento TEXT,
  servicos_oferecidos TEXT[],
  status TEXT NOT NULL DEFAULT 'ativo',
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Famílias (CadÚnico)
CREATE TABLE public.familias_cadunico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_familiar TEXT,
  nis_responsavel TEXT,
  responsavel_nome TEXT NOT NULL,
  responsavel_cpf TEXT,
  responsavel_data_nascimento DATE,
  endereco TEXT,
  bairro TEXT,
  cep TEXT,
  telefone TEXT,
  renda_familiar NUMERIC(12,2) DEFAULT 0,
  renda_per_capita NUMERIC(12,2) DEFAULT 0,
  quantidade_membros INTEGER DEFAULT 1,
  situacao_moradia TEXT, -- propria, alugada, cedida, ocupacao
  tipo_construcao TEXT, -- alvenaria, madeira, mista, outro
  agua_encanada BOOLEAN DEFAULT false,
  esgoto_sanitario BOOLEAN DEFAULT false,
  energia_eletrica BOOLEAN DEFAULT true,
  coleta_lixo BOOLEAN DEFAULT true,
  programas_vinculados TEXT[],
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_cadastro DATE DEFAULT CURRENT_DATE,
  data_atualizacao DATE,
  unidade_referencia_id UUID REFERENCES public.unidades_socioassistenciais(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Membros da família
CREATE TABLE public.membros_familia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  nis TEXT,
  data_nascimento DATE,
  parentesco TEXT, -- responsavel, conjuge, filho, neto, outro
  sexo TEXT,
  escolaridade TEXT,
  ocupacao TEXT,
  renda_individual NUMERIC(12,2) DEFAULT 0,
  deficiencia BOOLEAN DEFAULT false,
  tipo_deficiencia TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Atendimentos sociais
CREATE TABLE public.atendimentos_sociais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  familia_id UUID REFERENCES public.familias_cadunico(id),
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id),
  profissional_id UUID REFERENCES public.profiles(user_id),
  data_atendimento TIMESTAMPTZ NOT NULL DEFAULT now(),
  tipo_atendimento TEXT NOT NULL, -- acolhida, acompanhamento, visita_domiciliar, encaminhamento, grupo
  demanda TEXT NOT NULL,
  providencias TEXT,
  encaminhamentos TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'realizado',
  sigilo BOOLEAN DEFAULT false,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Visitas domiciliares
CREATE TABLE public.visitas_domiciliares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  familia_id UUID NOT NULL REFERENCES public.familias_cadunico(id),
  profissional_id UUID REFERENCES public.profiles(user_id),
  data_visita DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  objetivo TEXT NOT NULL,
  relato TEXT,
  situacao_encontrada TEXT,
  providencias TEXT,
  proxima_visita DATE,
  status TEXT NOT NULL DEFAULT 'agendada', -- agendada, realizada, cancelada, reagendada
  unidade_id UUID REFERENCES public.unidades_socioassistenciais(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unidades_socioassistenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.familias_cadunico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros_familia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos_sociais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitas_domiciliares ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view unidades" ON public.unidades_socioassistenciais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert unidades" ON public.unidades_socioassistenciais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update unidades" ON public.unidades_socioassistenciais FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view familias" ON public.familias_cadunico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert familias" ON public.familias_cadunico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update familias" ON public.familias_cadunico FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view membros" ON public.membros_familia FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert membros" ON public.membros_familia FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update membros" ON public.membros_familia FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete membros" ON public.membros_familia FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view atendimentos" ON public.atendimentos_sociais FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert atendimentos" ON public.atendimentos_sociais FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update atendimentos" ON public.atendimentos_sociais FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view visitas" ON public.visitas_domiciliares FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert visitas" ON public.visitas_domiciliares FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update visitas" ON public.visitas_domiciliares FOR UPDATE TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_unidades_socioassistenciais_updated_at BEFORE UPDATE ON public.unidades_socioassistenciais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_familias_cadunico_updated_at BEFORE UPDATE ON public.familias_cadunico FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_atendimentos_sociais_updated_at BEFORE UPDATE ON public.atendimentos_sociais FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visitas_domiciliares_updated_at BEFORE UPDATE ON public.visitas_domiciliares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
