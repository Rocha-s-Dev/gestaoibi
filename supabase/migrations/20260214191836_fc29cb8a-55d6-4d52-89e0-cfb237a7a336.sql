
-- =============================================
-- MÓDULO: GESTÃO AMBIENTAL (SMMA)
-- =============================================

-- Programas de Sustentabilidade
CREATE TABLE public.programas_sustentabilidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL DEFAULT 'Outro',
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('ativo', 'concluido', 'planejado', 'cancelado')),
  responsavel TEXT,
  orcamento NUMERIC(15,2),
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.programas_sustentabilidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view programas_sustentabilidade"
  ON public.programas_sustentabilidade FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with secretaria access can insert programas_sustentabilidade"
  ON public.programas_sustentabilidade FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can update programas_sustentabilidade"
  ON public.programas_sustentabilidade FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can delete programas_sustentabilidade"
  ON public.programas_sustentabilidade FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_programas_sustentabilidade_updated_at
  BEFORE UPDATE ON public.programas_sustentabilidade
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Metas Ambientais
CREATE TABLE public.metas_ambientais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'outro' CHECK (categoria IN ('residuos', 'areas_verdes', 'energia', 'agua', 'outro')),
  valor_atual NUMERIC(15,2) NOT NULL DEFAULT 0,
  valor_meta NUMERIC(15,2) NOT NULL DEFAULT 0,
  unidade_medida TEXT NOT NULL DEFAULT 'unidade',
  prazo DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluida', 'atrasada', 'cancelada')),
  programa_id UUID REFERENCES public.programas_sustentabilidade(id),
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.metas_ambientais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view metas_ambientais"
  ON public.metas_ambientais FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with secretaria access can insert metas_ambientais"
  ON public.metas_ambientais FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can update metas_ambientais"
  ON public.metas_ambientais FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can delete metas_ambientais"
  ON public.metas_ambientais FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_metas_ambientais_updated_at
  BEFORE UPDATE ON public.metas_ambientais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Licenciamento Ambiental
CREATE TABLE public.licenciamentos_ambientais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_processo TEXT NOT NULL,
  tipo_licenca TEXT NOT NULL CHECK (tipo_licenca IN ('previa', 'instalacao', 'operacao', 'simplificada', 'renovacao')),
  requerente_nome TEXT NOT NULL,
  requerente_cpf_cnpj TEXT,
  requerente_telefone TEXT,
  requerente_email TEXT,
  atividade TEXT NOT NULL,
  localizacao TEXT,
  coordenadas_geo TEXT,
  area_total NUMERIC(15,4),
  descricao_empreendimento TEXT,
  status TEXT NOT NULL DEFAULT 'analise' CHECK (status IN ('analise', 'aprovado', 'reprovado', 'condicionado', 'vencido', 'cancelado', 'pendente_vistoria')),
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  data_emissao DATE,
  data_validade DATE,
  condicionantes TEXT,
  parecer_tecnico TEXT,
  tecnico_responsavel TEXT,
  documentos JSONB,
  observacoes TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.licenciamentos_ambientais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view licenciamentos_ambientais"
  ON public.licenciamentos_ambientais FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with secretaria access can insert licenciamentos_ambientais"
  ON public.licenciamentos_ambientais FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can update licenciamentos_ambientais"
  ON public.licenciamentos_ambientais FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can delete licenciamentos_ambientais"
  ON public.licenciamentos_ambientais FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_licenciamentos_ambientais_updated_at
  BEFORE UPDATE ON public.licenciamentos_ambientais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Denúncias/Fiscalização Ambiental
CREATE TABLE public.denuncias_ambientais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('desmatamento', 'poluicao', 'queimada', 'descarte_irregular', 'invasao_area_protegida', 'maus_tratos_animal', 'outro')),
  descricao TEXT NOT NULL,
  localizacao TEXT,
  coordenadas_geo TEXT,
  denunciante_nome TEXT,
  denunciante_telefone TEXT,
  denunciante_anonimo BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (status IN ('recebida', 'em_analise', 'em_fiscalizacao', 'procedente', 'improcedente', 'arquivada', 'encaminhada')),
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  data_denuncia DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vistoria DATE,
  fiscal_responsavel TEXT,
  parecer TEXT,
  providencias TEXT,
  auto_infracao TEXT,
  fotos JSONB,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.denuncias_ambientais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view denuncias_ambientais"
  ON public.denuncias_ambientais FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users with secretaria access can insert denuncias_ambientais"
  ON public.denuncias_ambientais FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can update denuncias_ambientais"
  ON public.denuncias_ambientais FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE POLICY "Users with secretaria access can delete denuncias_ambientais"
  ON public.denuncias_ambientais FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_denuncias_ambientais_updated_at
  BEFORE UPDATE ON public.denuncias_ambientais
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gerador de número de protocolo
CREATE OR REPLACE FUNCTION public.gerar_protocolo_denuncia_ambiental()
  RETURNS TEXT
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.denuncias_ambientais;
  RETURN CONCAT('DA-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END;
$$;

-- Gerador de número de processo de licenciamento
CREATE OR REPLACE FUNCTION public.gerar_numero_licenciamento()
  RETURNS TEXT
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.licenciamentos_ambientais;
  RETURN CONCAT('LIC-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END;
$$;
