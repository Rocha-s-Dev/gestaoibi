
-- 1. Fiscalizações Ambientais
CREATE TABLE public.fiscalizacoes_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_fiscalizacao text NOT NULL DEFAULT 'rotina',
  local text NOT NULL,
  latitude numeric,
  longitude numeric,
  data_fiscalizacao date NOT NULL DEFAULT CURRENT_DATE,
  fiscal_id uuid,
  denuncia_id uuid REFERENCES public.denuncias_ambientais(id) ON DELETE SET NULL,
  licenca_id uuid REFERENCES public.licenciamentos_ambientais(id) ON DELETE SET NULL,
  irregularidades_encontradas text,
  acoes_tomadas text,
  status text NOT NULL DEFAULT 'agendada',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.fiscalizacoes_ambientais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage fiscalizacoes_ambientais" ON public.fiscalizacoes_ambientais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. Autos de Infração Ambiental
CREATE TABLE public.autos_infracao_ambiental (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_auto text NOT NULL,
  nome_infrator text NOT NULL,
  cpf_cnpj text,
  descricao text NOT NULL,
  valor_multa numeric DEFAULT 0,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'emitido',
  fiscalizacao_id uuid REFERENCES public.fiscalizacoes_ambientais(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.autos_infracao_ambiental ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage autos_infracao_ambiental" ON public.autos_infracao_ambiental FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. Empreendimentos Ambientais
CREATE TABLE public.empreendimentos_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cpf_cnpj text,
  atividade text NOT NULL,
  nivel_impacto text NOT NULL DEFAULT 'medio',
  endereco text,
  latitude numeric,
  longitude numeric,
  responsavel_tecnico text,
  licenca_id uuid REFERENCES public.licenciamentos_ambientais(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.empreendimentos_ambientais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage empreendimentos_ambientais" ON public.empreendimentos_ambientais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Áreas Protegidas
CREATE TABLE public.areas_protegidas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  tipo text NOT NULL,
  area_hectares numeric,
  descricao_local text,
  latitude numeric,
  longitude numeric,
  status_conservacao text DEFAULT 'bom',
  orgao_responsavel text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.areas_protegidas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage areas_protegidas" ON public.areas_protegidas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Ocorrências de Queimadas
CREATE TABLE public.ocorrencias_queimadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local text NOT NULL,
  latitude numeric,
  longitude numeric,
  data_ocorrencia date NOT NULL DEFAULT CURRENT_DATE,
  area_afetada_hectares numeric,
  possivel_responsavel text,
  acoes_realizadas text,
  status text NOT NULL DEFAULT 'registrada',
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ocorrencias_queimadas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage ocorrencias_queimadas" ON public.ocorrencias_queimadas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Resíduos Sólidos
CREATE TABLE public.residuos_solidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_residuo text NOT NULL,
  origem text,
  quantidade numeric,
  destino text,
  data_coleta date NOT NULL DEFAULT CURRENT_DATE,
  operador_responsavel text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.residuos_solidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage residuos_solidos" ON public.residuos_solidos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Árvores Urbanas
CREATE TABLE public.arvores_urbanas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  especie text NOT NULL,
  descricao_local text,
  latitude numeric,
  longitude numeric,
  data_plantio date,
  estado_atual text DEFAULT 'saudavel',
  necessita_poda boolean DEFAULT false,
  observacoes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.arvores_urbanas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage arvores_urbanas" ON public.arvores_urbanas FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Eventos de Educação Ambiental
CREATE TABLE public.eventos_educacao_ambiental (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_evento text NOT NULL,
  local text,
  publico_alvo text,
  numero_participantes integer DEFAULT 0,
  data_evento date NOT NULL DEFAULT CURRENT_DATE,
  descricao text,
  responsavel text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.eventos_educacao_ambiental ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage eventos_educacao_ambiental" ON public.eventos_educacao_ambiental FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Indicadores Ambientais
CREATE TABLE public.indicadores_ambientais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_indicador text NOT NULL,
  valor numeric NOT NULL,
  unidade text,
  data_medicao date NOT NULL DEFAULT CURRENT_DATE,
  local text,
  observacoes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.indicadores_ambientais ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can manage indicadores_ambientais" ON public.indicadores_ambientais FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Number generator for autos de infração
CREATE OR REPLACE FUNCTION public.gerar_numero_auto_infracao_ambiental()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.autos_infracao_ambiental;
  RETURN CONCAT('AIA-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END;
$$;
