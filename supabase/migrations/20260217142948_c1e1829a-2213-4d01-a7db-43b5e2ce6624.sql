
-- Tabela para documentos dos professores
CREATE TABLE public.documentos_professores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  escola_id UUID REFERENCES public.escolas(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL DEFAULT 'outro',
  descricao TEXT,
  arquivo_url TEXT NOT NULL,
  arquivo_nome TEXT NOT NULL,
  arquivo_tamanho INTEGER,
  bimestre INTEGER,
  ano_letivo INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  disciplina TEXT,
  turma_id UUID REFERENCES public.turmas(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_professores ENABLE ROW LEVEL SECURITY;

-- Professores podem ver seus próprios documentos
CREATE POLICY "Professores veem seus documentos"
  ON public.documentos_professores FOR SELECT
  USING (auth.uid() = professor_id);

-- Professores podem inserir seus documentos
CREATE POLICY "Professores inserem seus documentos"
  ON public.documentos_professores FOR INSERT
  WITH CHECK (auth.uid() = professor_id);

-- Professores podem atualizar seus documentos
CREATE POLICY "Professores atualizam seus documentos"
  ON public.documentos_professores FOR UPDATE
  USING (auth.uid() = professor_id);

-- Professores podem deletar seus documentos
CREATE POLICY "Professores deletam seus documentos"
  ON public.documentos_professores FOR DELETE
  USING (auth.uid() = professor_id);

-- Admin/Secretario/Coordenador podem ver todos
CREATE POLICY "Admin ve todos documentos"
  ON public.documentos_professores FOR SELECT
  USING (
    public.is_admin_municipal(auth.uid())
    OR public.has_papel_sistemico(auth.uid(), 'prefeito')
    OR public.has_papel_sistemico(auth.uid(), 'secretario')
    OR public.has_education_role(auth.uid(), 'secretaria')
    OR public.has_education_role(auth.uid(), 'coordenador')
    OR public.has_education_role(auth.uid(), 'diretor')
  );

CREATE TRIGGER update_documentos_professores_updated_at
  BEFORE UPDATE ON public.documentos_professores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para arquivos dos professores
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos_professores', 'documentos_professores', true);

-- Políticas de storage
CREATE POLICY "Professores upload docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documentos_professores' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Professores view docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documentos_professores');

CREATE POLICY "Professores delete docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documentos_professores' AND auth.uid()::text = (storage.foldername(name))[1]);
