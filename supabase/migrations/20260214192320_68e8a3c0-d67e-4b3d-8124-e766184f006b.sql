
-- =============================================
-- ONDA 2: OUVIDORIA MUNICIPAL (SMG) + ILUMINAÇÃO PÚBLICA (SMISP)
-- =============================================

-- Ouvidoria Municipal
CREATE TABLE public.manifestacoes_ouvidoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('reclamacao', 'sugestao', 'elogio', 'denuncia', 'solicitacao', 'informacao')),
  canal TEXT DEFAULT 'presencial' CHECK (canal IN ('presencial', 'telefone', 'email', 'site', 'app', 'carta')),
  assunto TEXT NOT NULL,
  descricao TEXT NOT NULL,
  manifestante_nome TEXT,
  manifestante_cpf TEXT,
  manifestante_telefone TEXT,
  manifestante_email TEXT,
  manifestante_anonimo BOOLEAN DEFAULT false,
  secretaria_destino_id UUID REFERENCES public.secretarias(id),
  status TEXT NOT NULL DEFAULT 'recebida' CHECK (status IN ('recebida', 'em_analise', 'encaminhada', 'respondida', 'concluida', 'arquivada', 'reaberta')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  data_abertura TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_prazo TIMESTAMPTZ,
  data_resposta TIMESTAMPTZ,
  data_conclusao TIMESTAMPTZ,
  resposta TEXT,
  responsavel_resposta_id UUID,
  satisfacao_cidadao INTEGER CHECK (satisfacao_cidadao BETWEEN 1 AND 5),
  observacoes_internas TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.manifestacoes_ouvidoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view manifestacoes_ouvidoria"
  ON public.manifestacoes_ouvidoria FOR SELECT TO authenticated USING (true);
CREATE POLICY "Secretaria access can insert manifestacoes_ouvidoria"
  ON public.manifestacoes_ouvidoria FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can update manifestacoes_ouvidoria"
  ON public.manifestacoes_ouvidoria FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can delete manifestacoes_ouvidoria"
  ON public.manifestacoes_ouvidoria FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_manifestacoes_ouvidoria_updated_at
  BEFORE UPDATE ON public.manifestacoes_ouvidoria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.gerar_protocolo_ouvidoria()
  RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.manifestacoes_ouvidoria;
  RETURN CONCAT('OUV-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END; $$;

-- Iluminação Pública
CREATE TABLE public.pontos_iluminacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL,
  logradouro TEXT NOT NULL,
  numero TEXT,
  bairro TEXT,
  referencia TEXT,
  tipo_luminaria TEXT DEFAULT 'led' CHECK (tipo_luminaria IN ('led', 'vapor_sodio', 'vapor_mercurio', 'fluorescente', 'outro')),
  potencia_watts INTEGER,
  altura_poste NUMERIC(5,2),
  estado TEXT NOT NULL DEFAULT 'funcionando' CHECK (estado IN ('funcionando', 'com_defeito', 'apagada', 'vandalizada', 'em_manutencao')),
  data_instalacao DATE,
  ultima_manutencao DATE,
  coordenadas_geo TEXT,
  observacoes TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pontos_iluminacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view pontos_iluminacao"
  ON public.pontos_iluminacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Secretaria access can insert pontos_iluminacao"
  ON public.pontos_iluminacao FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can update pontos_iluminacao"
  ON public.pontos_iluminacao FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can delete pontos_iluminacao"
  ON public.pontos_iluminacao FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_pontos_iluminacao_updated_at
  BEFORE UPDATE ON public.pontos_iluminacao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Solicitações de reparo de iluminação
CREATE TABLE public.solicitacoes_iluminacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  protocolo TEXT NOT NULL,
  ponto_id UUID REFERENCES public.pontos_iluminacao(id),
  tipo_problema TEXT NOT NULL CHECK (tipo_problema IN ('apagada', 'piscando', 'vandalizada', 'acesa_dia', 'poste_inclinado', 'fiacao_exposta', 'outro')),
  descricao TEXT,
  solicitante_nome TEXT,
  solicitante_telefone TEXT,
  logradouro TEXT,
  referencia TEXT,
  status TEXT NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_analise', 'em_campo', 'concluida', 'cancelada')),
  prioridade TEXT DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  equipe_responsavel TEXT,
  material_utilizado TEXT,
  custo_reparo NUMERIC(10,2),
  observacoes TEXT,
  secretaria_id UUID REFERENCES public.secretarias(id),
  municipio_id UUID REFERENCES public.municipios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_iluminacao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view solicitacoes_iluminacao"
  ON public.solicitacoes_iluminacao FOR SELECT TO authenticated USING (true);
CREATE POLICY "Secretaria access can insert solicitacoes_iluminacao"
  ON public.solicitacoes_iluminacao FOR INSERT TO authenticated
  WITH CHECK (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can update solicitacoes_iluminacao"
  ON public.solicitacoes_iluminacao FOR UPDATE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);
CREATE POLICY "Secretaria access can delete solicitacoes_iluminacao"
  ON public.solicitacoes_iluminacao FOR DELETE TO authenticated
  USING (public.has_secretaria_access(auth.uid(), secretaria_id) OR secretaria_id IS NULL);

CREATE TRIGGER update_solicitacoes_iluminacao_updated_at
  BEFORE UPDATE ON public.solicitacoes_iluminacao
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.gerar_protocolo_iluminacao()
  RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_seq INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1 INTO v_seq FROM public.solicitacoes_iluminacao;
  RETURN CONCAT('IP-', TO_CHAR(NOW(), 'YYYY'), '-', LPAD(v_seq::TEXT, 5, '0'));
END; $$;
