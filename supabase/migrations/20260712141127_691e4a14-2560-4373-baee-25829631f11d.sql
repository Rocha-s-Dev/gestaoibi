
CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secretaria_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  numero_obra TEXT, numero_processo TEXT, numero_contrato TEXT,
  convenio TEXT, programa TEXT, fonte_recurso TEXT,
  categoria TEXT, tipo TEXT, situacao TEXT NOT NULL DEFAULT 'planejamento',
  nome TEXT NOT NULL, descricao TEXT,
  municipio TEXT, bairro TEXT, endereco TEXT, cep TEXT,
  latitude NUMERIC, longitude NUMERIC,
  empresa_executora TEXT, engenheiro_responsavel TEXT, fiscal_responsavel TEXT,
  secretaria_solicitante_id UUID REFERENCES public.secretarias(id) ON DELETE SET NULL,
  valor_contratado NUMERIC(15,2) DEFAULT 0,
  valor_executado NUMERIC(15,2) DEFAULT 0,
  valor_medido NUMERIC(15,2) DEFAULT 0,
  percentual_fisico NUMERIC(5,2) DEFAULT 0,
  percentual_financeiro NUMERIC(5,2) DEFAULT 0,
  data_inicio DATE, previsao_conclusao DATE, data_conclusao DATE,
  art TEXT, crea TEXT, observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras TO authenticated;
GRANT ALL ON public.obras TO service_role;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_view" ON public.obras FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_manage" ON public.obras FOR ALL TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_updated_at BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_cronograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  ordem INT NOT NULL DEFAULT 0,
  nome TEXT NOT NULL, descricao TEXT, responsavel TEXT,
  data_inicio DATE, data_prevista DATE, data_conclusao DATE,
  percentual NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'nao_iniciada',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras_cronograma TO authenticated;
GRANT ALL ON public.obras_cronograma TO service_role;
ALTER TABLE public.obras_cronograma ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_cron_view" ON public.obras_cronograma FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_cron_manage" ON public.obras_cronograma FOR ALL TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_cron_updated BEFORE UPDATE ON public.obras_cronograma
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_diario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  clima TEXT, equipe_presente TEXT, maquinas TEXT, materiais TEXT,
  servicos_executados TEXT, observacoes TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras_diario TO authenticated;
GRANT ALL ON public.obras_diario TO service_role;
ALTER TABLE public.obras_diario ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_diario_view" ON public.obras_diario FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_diario_manage" ON public.obras_diario FOR ALL TO authenticated
  USING (public.can_view_infrastructure(auth.uid()))
  WITH CHECK (public.can_view_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_diario_updated BEFORE UPDATE ON public.obras_diario
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_medicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES public.obras_cronograma(id) ON DELETE SET NULL,
  numero INT NOT NULL DEFAULT 1,
  percentual_executado NUMERIC(5,2) DEFAULT 0,
  valor_medido NUMERIC(15,2) DEFAULT 0,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  engenheiro_responsavel TEXT, fiscal_responsavel TEXT, observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras_medicoes TO authenticated;
GRANT ALL ON public.obras_medicoes TO service_role;
ALTER TABLE public.obras_medicoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_med_view" ON public.obras_medicoes FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_med_manage" ON public.obras_medicoes FOR ALL TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_med_updated BEFORE UPDATE ON public.obras_medicoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_fiscalizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  fiscal TEXT,
  situacao TEXT NOT NULL DEFAULT 'conforme',
  pendencias TEXT, parecer_tecnico TEXT,
  fotos JSONB DEFAULT '[]'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras_fiscalizacoes TO authenticated;
GRANT ALL ON public.obras_fiscalizacoes TO service_role;
ALTER TABLE public.obras_fiscalizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_fisc_view" ON public.obras_fiscalizacoes FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_fisc_manage" ON public.obras_fiscalizacoes FOR ALL TO authenticated
  USING (public.can_manage_infrastructure(auth.uid()))
  WITH CHECK (public.can_manage_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_fisc_updated BEFORE UPDATE ON public.obras_fiscalizacoes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL DEFAULT 'durante',
  arquivo_path TEXT NOT NULL,
  arquivo_nome TEXT, legenda TEXT,
  latitude NUMERIC, longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.obras_fotos TO authenticated;
GRANT ALL ON public.obras_fotos TO service_role;
ALTER TABLE public.obras_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_fotos_view" ON public.obras_fotos FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_fotos_manage" ON public.obras_fotos FOR ALL TO authenticated
  USING (public.can_view_infrastructure(auth.uid()))
  WITH CHECK (public.can_view_infrastructure(auth.uid()));
CREATE TRIGGER trg_obras_fotos_updated BEFORE UPDATE ON public.obras_fotos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.obras_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, titulo TEXT NOT NULL, descricao TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.obras_historico TO authenticated;
GRANT ALL ON public.obras_historico TO service_role;
ALTER TABLE public.obras_historico ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obras_hist_view" ON public.obras_historico FOR SELECT TO authenticated USING (public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_hist_insert" ON public.obras_historico FOR INSERT TO authenticated WITH CHECK (public.can_view_infrastructure(auth.uid()));

CREATE OR REPLACE FUNCTION public.trg_obras_historico()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.obras_historico(obra_id,tipo,titulo,descricao,user_id)
      VALUES (NEW.id,'criacao','Obra cadastrada', NEW.nome, auth.uid());
  ELSIF TG_OP = 'UPDATE' AND OLD.situacao IS DISTINCT FROM NEW.situacao THEN
    INSERT INTO public.obras_historico(obra_id,tipo,titulo,descricao,user_id)
      VALUES (NEW.id,'mudanca_status','Mudança de situação',
              COALESCE(OLD.situacao,'') || ' → ' || COALESCE(NEW.situacao,''), auth.uid());
  END IF;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_obras_hist_ins AFTER INSERT ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.trg_obras_historico();
CREATE TRIGGER trg_obras_hist_upd AFTER UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.trg_obras_historico();

-- Storage policies for obras-fotos bucket
CREATE POLICY "obras_fotos_bucket_view" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'obras-fotos' AND public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_fotos_bucket_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'obras-fotos' AND public.can_view_infrastructure(auth.uid()));
CREATE POLICY "obras_fotos_bucket_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'obras-fotos' AND public.can_manage_infrastructure(auth.uid()));
