
-- Tabela de intervenções pedagógicas
CREATE TABLE public.intervencoes_pedagogicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL REFERENCES public.alunos(id) ON DELETE CASCADE,
  escola_id UUID REFERENCES public.escolas(id),
  data_intervencao DATE NOT NULL DEFAULT CURRENT_DATE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  responsavel_id UUID NOT NULL,
  responsavel_nome TEXT,
  status TEXT NOT NULL DEFAULT 'em_acompanhamento',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intervencoes_pedagogicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view intervencoes" ON public.intervencoes_pedagogicas
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert intervencoes" ON public.intervencoes_pedagogicas
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update intervencoes" ON public.intervencoes_pedagogicas
  FOR UPDATE TO authenticated USING (true);

-- Tabela de eventos/agenda pedagógica
CREATE TABLE public.eventos_pedagogicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escola_id UUID REFERENCES public.escolas(id),
  titulo TEXT NOT NULL,
  data_evento DATE NOT NULL,
  hora_inicio TIME,
  hora_fim TIME,
  tipo TEXT NOT NULL DEFAULT 'reuniao',
  descricao TEXT,
  participantes TEXT[],
  ata TEXT,
  anexos JSONB DEFAULT '[]'::jsonb,
  criado_por UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.eventos_pedagogicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view eventos_pedagogicos" ON public.eventos_pedagogicos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert eventos_pedagogicos" ON public.eventos_pedagogicos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update eventos_pedagogicos" ON public.eventos_pedagogicos
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete eventos_pedagogicos" ON public.eventos_pedagogicos
  FOR DELETE TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_intervencoes_pedagogicas_updated_at
  BEFORE UPDATE ON public.intervencoes_pedagogicas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eventos_pedagogicos_updated_at
  BEFORE UPDATE ON public.eventos_pedagogicos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
