-- =========================================================
-- ALMOXARIFADO CENTRAL - ENTREGA 2.1 (fundação + materiais)
-- =========================================================

-- CATEGORIAS
CREATE TABLE public.almoxarifado_categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid,
  nome text NOT NULL,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE ON public.almoxarifado_categorias TO authenticated;
GRANT ALL ON public.almoxarifado_categorias TO service_role;
ALTER TABLE public.almoxarifado_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Almox categorias visiveis" ON public.almoxarifado_categorias
FOR SELECT TO authenticated USING (public.can_view_patrimonio(auth.uid()));
CREATE POLICY "Almox categorias insert" ON public.almoxarifado_categorias
FOR INSERT TO authenticated WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE POLICY "Almox categorias update" ON public.almoxarifado_categorias
FOR UPDATE TO authenticated USING (public.can_manage_patrimonio(auth.uid())) WITH CHECK (public.can_manage_patrimonio(auth.uid()));

CREATE UNIQUE INDEX almox_categorias_nome_unq
  ON public.almoxarifado_categorias (municipio_id, lower(btrim(nome)));

-- UNIDADES DE MEDIDA
CREATE TABLE public.almoxarifado_unidades_medida (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid,
  sigla text NOT NULL,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE ON public.almoxarifado_unidades_medida TO authenticated;
GRANT ALL ON public.almoxarifado_unidades_medida TO service_role;
ALTER TABLE public.almoxarifado_unidades_medida ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Almox unidades visiveis" ON public.almoxarifado_unidades_medida
FOR SELECT TO authenticated USING (public.can_view_patrimonio(auth.uid()));
CREATE POLICY "Almox unidades insert" ON public.almoxarifado_unidades_medida
FOR INSERT TO authenticated WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE POLICY "Almox unidades update" ON public.almoxarifado_unidades_medida
FOR UPDATE TO authenticated USING (public.can_manage_patrimonio(auth.uid())) WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE UNIQUE INDEX almox_unidades_sigla_unq ON public.almoxarifado_unidades_medida (municipio_id, lower(sigla));

-- LOCALIZACOES
CREATE TABLE public.almoxarifado_localizacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid,
  nome text NOT NULL,
  codigo text,
  descricao text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE ON public.almoxarifado_localizacoes TO authenticated;
GRANT ALL ON public.almoxarifado_localizacoes TO service_role;
ALTER TABLE public.almoxarifado_localizacoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Almox localizacoes visiveis" ON public.almoxarifado_localizacoes
FOR SELECT TO authenticated USING (public.can_view_patrimonio(auth.uid()));
CREATE POLICY "Almox localizacoes insert" ON public.almoxarifado_localizacoes
FOR INSERT TO authenticated WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE POLICY "Almox localizacoes update" ON public.almoxarifado_localizacoes
FOR UPDATE TO authenticated USING (public.can_manage_patrimonio(auth.uid())) WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE UNIQUE INDEX almox_localizacoes_nome_unq ON public.almoxarifado_localizacoes (municipio_id, lower(nome));

-- ITENS (MATERIAIS)
CREATE TABLE public.almoxarifado_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id uuid,
  codigo text,
  nome text NOT NULL,
  descricao text,
  categoria_id uuid NOT NULL REFERENCES public.almoxarifado_categorias(id),
  unidade_medida_id uuid NOT NULL REFERENCES public.almoxarifado_unidades_medida(id),
  marca text,
  modelo text,
  especificacao text,
  estoque_minimo numeric NOT NULL DEFAULT 0,
  estoque_maximo numeric,
  estoque_atual numeric NOT NULL DEFAULT 0,
  estoque_reservado numeric NOT NULL DEFAULT 0,
  localizacao_id uuid REFERENCES public.almoxarifado_localizacoes(id),
  valor_medio numeric,
  controla_lote boolean NOT NULL DEFAULT false,
  controla_validade boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT almox_itens_estoque_min_nao_negativo CHECK (estoque_minimo >= 0),
  CONSTRAINT almox_itens_estoque_max_nao_negativo CHECK (estoque_maximo IS NULL OR estoque_maximo >= 0),
  CONSTRAINT almox_itens_estoque_max_maior CHECK (estoque_maximo IS NULL OR estoque_maximo >= estoque_minimo),
  CONSTRAINT almox_itens_estoque_atual_nao_negativo CHECK (estoque_atual >= 0),
  CONSTRAINT almox_itens_estoque_reservado_nao_negativo CHECK (estoque_reservado >= 0)
);
GRANT SELECT, INSERT, UPDATE ON public.almoxarifado_itens TO authenticated;
GRANT ALL ON public.almoxarifado_itens TO service_role;
ALTER TABLE public.almoxarifado_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Almox itens visiveis" ON public.almoxarifado_itens
FOR SELECT TO authenticated USING (public.can_view_patrimonio(auth.uid()));
CREATE POLICY "Almox itens insert" ON public.almoxarifado_itens
FOR INSERT TO authenticated WITH CHECK (public.can_manage_patrimonio(auth.uid()));
CREATE POLICY "Almox itens update" ON public.almoxarifado_itens
FOR UPDATE TO authenticated USING (public.can_manage_patrimonio(auth.uid())) WITH CHECK (public.can_manage_patrimonio(auth.uid()));

CREATE INDEX idx_almox_itens_municipio ON public.almoxarifado_itens (municipio_id);
CREATE INDEX idx_almox_itens_categoria ON public.almoxarifado_itens (categoria_id);
CREATE INDEX idx_almox_itens_unidade ON public.almoxarifado_itens (unidade_medida_id);
CREATE INDEX idx_almox_itens_localizacao ON public.almoxarifado_itens (localizacao_id);
CREATE INDEX idx_almox_itens_ativo ON public.almoxarifado_itens (ativo);
CREATE UNIQUE INDEX almox_itens_codigo_unq ON public.almoxarifado_itens (municipio_id, codigo);
CREATE UNIQUE INDEX almox_itens_nome_unq ON public.almoxarifado_itens (municipio_id, lower(btrim(nome)));

-- CODIGO AUTOMATICO MAT-000001
CREATE OR REPLACE FUNCTION public.gerar_codigo_almoxarifado_item(p_municipio_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_seq integer;
BEGIN
  SELECT COALESCE(MAX(NULLIF(regexp_replace(codigo, '^MAT-', ''), '')::integer), 0) + 1
  INTO v_seq
  FROM public.almoxarifado_itens
  WHERE (p_municipio_id IS NULL AND municipio_id IS NULL OR municipio_id = p_municipio_id)
    AND codigo ~ '^MAT-\d+$';
  RETURN 'MAT-' || lpad(v_seq::text, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_almoxarifado_item_codigo()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.codigo := public.gerar_codigo_almoxarifado_item(NEW.municipio_id);
    NEW.estoque_atual := 0;
    NEW.estoque_reservado := 0;
  ELSE
    NEW.codigo := OLD.codigo;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER almox_itens_codigo
BEFORE INSERT OR UPDATE ON public.almoxarifado_itens
FOR EACH ROW EXECUTE FUNCTION public.trg_almoxarifado_item_codigo();

-- BLOQUEIO DE EXCLUSAO FISICA
CREATE OR REPLACE FUNCTION public.bloquear_delete_almoxarifado()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'Registros do Almoxarifado não podem ser excluídos. Utilize a inativação.';
END;
$$;
CREATE TRIGGER almox_itens_no_delete BEFORE DELETE ON public.almoxarifado_itens FOR EACH ROW EXECUTE FUNCTION public.bloquear_delete_almoxarifado();
CREATE TRIGGER almox_categorias_no_delete BEFORE DELETE ON public.almoxarifado_categorias FOR EACH ROW EXECUTE FUNCTION public.bloquear_delete_almoxarifado();
CREATE TRIGGER almox_unidades_no_delete BEFORE DELETE ON public.almoxarifado_unidades_medida FOR EACH ROW EXECUTE FUNCTION public.bloquear_delete_almoxarifado();
CREATE TRIGGER almox_localizacoes_no_delete BEFORE DELETE ON public.almoxarifado_localizacoes FOR EACH ROW EXECUTE FUNCTION public.bloquear_delete_almoxarifado();

-- UPDATED_AT
CREATE TRIGGER almox_itens_updated_at BEFORE UPDATE ON public.almoxarifado_itens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER almox_categorias_updated_at BEFORE UPDATE ON public.almoxarifado_categorias FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER almox_unidades_updated_at BEFORE UPDATE ON public.almoxarifado_unidades_medida FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER almox_localizacoes_updated_at BEFORE UPDATE ON public.almoxarifado_localizacoes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AUDITORIA GLOBAL
CREATE TRIGGER aud_almox_itens AFTER INSERT OR UPDATE OR DELETE ON public.almoxarifado_itens FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER aud_almox_categorias AFTER INSERT OR UPDATE OR DELETE ON public.almoxarifado_categorias FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER aud_almox_unidades AFTER INSERT OR UPDATE OR DELETE ON public.almoxarifado_unidades_medida FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();
CREATE TRIGGER aud_almox_localizacoes AFTER INSERT OR UPDATE OR DELETE ON public.almoxarifado_localizacoes FOR EACH ROW EXECUTE FUNCTION public.trigger_auditoria_automatica();

-- DADOS BASE (unidades e categorias comuns) para o municipio ativo
INSERT INTO public.almoxarifado_unidades_medida (municipio_id, sigla, nome)
SELECT m.id, u.sigla, u.nome
FROM (SELECT id FROM public.municipios ORDER BY created_at LIMIT 1) m
CROSS JOIN (VALUES
  ('UN','Unidade'),('CX','Caixa'),('PC','Peça'),('KG','Quilograma'),('G','Grama'),
  ('L','Litro'),('ML','Mililitro'),('M','Metro'),('M2','Metro quadrado'),('M3','Metro cúbico'),
  ('PAC','Pacote'),('RES','Resma'),('FD','Fardo')
) AS u(sigla, nome)
ON CONFLICT DO NOTHING;

INSERT INTO public.almoxarifado_categorias (municipio_id, nome)
SELECT m.id, c.nome
FROM (SELECT id FROM public.municipios ORDER BY created_at LIMIT 1) m
CROSS JOIN (VALUES
  ('Material de Escritório'),('Material de Limpeza'),('Material de Expediente'),
  ('Material de Manutenção'),('Material Elétrico'),('Material Hidráulico'),
  ('Material de Informática'),('Material de Consumo Geral')
) AS c(nome)
ON CONFLICT DO NOTHING;
