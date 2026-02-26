
-- 1. Create cargos_secretaria table
CREATE TABLE public.cargos_secretaria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  secretaria_id UUID NOT NULL REFERENCES public.secretarias(id) ON DELETE CASCADE,
  nivel TEXT NOT NULL DEFAULT 'operacional' CHECK (nivel IN ('estrategico', 'gerencial', 'operacional', 'apoio')),
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(nome, secretaria_id)
);

-- 2. Add cargo_secretaria_id to vinculos_funcionais
ALTER TABLE public.vinculos_funcionais ADD COLUMN cargo_secretaria_id UUID REFERENCES public.cargos_secretaria(id);

-- 3. RLS
ALTER TABLE public.cargos_secretaria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view cargos_secretaria"
  ON public.cargos_secretaria FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admin and secretario can manage cargos_secretaria"
  ON public.cargos_secretaria FOR ALL
  TO authenticated USING (
    public.is_admin_municipal(auth.uid())
    OR public.is_secretario_of(auth.uid(), secretaria_id)
  ) WITH CHECK (
    public.is_admin_municipal(auth.uid())
    OR public.is_secretario_of(auth.uid(), secretaria_id)
  );

-- 4. Seed: apoio cargos for ALL 10 secretarias
DO $$
DECLARE
  sec_ids UUID[] := ARRAY[
    '4576877a-b8b9-43b6-b4f7-aa6435b55d53', -- SMAPA
    '71f928c2-4e65-4497-ae82-2262e487d245', -- SMCEL
    '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', -- SMDS
    '79afaec7-100b-4c39-80d9-84346f862206', -- SME
    'c7e4215f-d227-463b-8718-92f60c468bee', -- SMF
    'ef06408b-4c32-44eb-a80a-ebd139a5cd44', -- SMG
    '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', -- SMISP
    'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', -- SMMA
    '19d25d5c-f41c-4a8e-9152-4926296d36b8', -- SMS
    'ac45a317-3fbe-429b-969f-0f0486bd80b0'  -- SMTT
  ];
  apoio_cargos TEXT[] := ARRAY[
    'Auxiliar de Serviços Gerais', 'Servente', 'Auxiliar de Limpeza', 'Zelador',
    'Porteiro', 'Vigia', 'Recepcionista', 'Motorista',
    'Auxiliar Administrativo', 'Assistente Administrativo', 'Digitador', 'Almoxarife'
  ];
  sid UUID;
  cargo TEXT;
BEGIN
  FOREACH sid IN ARRAY sec_ids LOOP
    FOREACH cargo IN ARRAY apoio_cargos LOOP
      INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel)
      VALUES (cargo, sid, 'apoio')
      ON CONFLICT (nome, secretaria_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- 5. Specific cargos per secretaria

-- SMG - Governo
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Chefe de Gabinete', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'estrategico'),
  ('Assessor Especial', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'gerencial'),
  ('Assessor Jurídico', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'gerencial'),
  ('Controlador Interno', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'estrategico'),
  ('Ouvidor Municipal', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'gerencial'),
  ('Procurador Municipal', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'estrategico'),
  ('Coordenador Administrativo', 'ef06408b-4c32-44eb-a80a-ebd139a5cd44', 'gerencial')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMF - Finanças
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Diretor de Tesouraria', 'c7e4215f-d227-463b-8718-92f60c468bee', 'estrategico'),
  ('Tesoureiro', 'c7e4215f-d227-463b-8718-92f60c468bee', 'gerencial'),
  ('Contador', 'c7e4215f-d227-463b-8718-92f60c468bee', 'gerencial'),
  ('Controlador Financeiro', 'c7e4215f-d227-463b-8718-92f60c468bee', 'gerencial'),
  ('Fiscal de Tributos', 'c7e4215f-d227-463b-8718-92f60c468bee', 'operacional'),
  ('Auditor Fiscal', 'c7e4215f-d227-463b-8718-92f60c468bee', 'gerencial'),
  ('Coordenador de Arrecadação', 'c7e4215f-d227-463b-8718-92f60c468bee', 'gerencial')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMMA - Meio Ambiente
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Diretor Ambiental', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'estrategico'),
  ('Fiscal Ambiental', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'operacional'),
  ('Engenheiro Ambiental', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'gerencial'),
  ('Biólogo', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'operacional'),
  ('Técnico Ambiental', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'operacional'),
  ('Coordenador de Licenciamento', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'gerencial'),
  ('Agente de Fiscalização', 'fda35ccb-f628-4bc0-96db-1414b2ad1c5f', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMDS - Desenvolvimento Social
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Coordenador do CRAS', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'gerencial'),
  ('Coordenador do CREAS', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'gerencial'),
  ('Assistente Social', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'operacional'),
  ('Psicólogo', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'operacional'),
  ('Orientador Social', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'operacional'),
  ('Visitador Social', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'operacional'),
  ('Técnico do Cadastro Único', '6ac4ff75-9154-4d81-83fd-e0e03437bb2e', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMCEL - Cultura, Esporte e Lazer
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Diretor de Esporte', '71f928c2-4e65-4497-ae82-2262e487d245', 'estrategico'),
  ('Coordenador de Eventos', '71f928c2-4e65-4497-ae82-2262e487d245', 'gerencial'),
  ('Professor de Educação Física', '71f928c2-4e65-4497-ae82-2262e487d245', 'operacional'),
  ('Instrutor Cultural', '71f928c2-4e65-4497-ae82-2262e487d245', 'operacional'),
  ('Coordenador de Projetos', '71f928c2-4e65-4497-ae82-2262e487d245', 'gerencial'),
  ('Técnico Cultural', '71f928c2-4e65-4497-ae82-2262e487d245', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMTT - Transportes e Trânsito
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Diretor de Trânsito', 'ac45a317-3fbe-429b-969f-0f0486bd80b0', 'estrategico'),
  ('Agente de Trânsito', 'ac45a317-3fbe-429b-969f-0f0486bd80b0', 'operacional'),
  ('Coordenador de Frotas', 'ac45a317-3fbe-429b-969f-0f0486bd80b0', 'gerencial'),
  ('Mecânico', 'ac45a317-3fbe-429b-969f-0f0486bd80b0', 'operacional'),
  ('Fiscal de Transporte', 'ac45a317-3fbe-429b-969f-0f0486bd80b0', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMAPA - Agricultura
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Engenheiro Agrônomo', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'gerencial'),
  ('Técnico Agrícola', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'operacional'),
  ('Veterinário', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'operacional'),
  ('Coordenador de Programas Rurais', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'gerencial'),
  ('Fiscal Rural', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'operacional'),
  ('Extensionista Rural', '4576877a-b8b9-43b6-b4f7-aa6435b55d53', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SMISP - Infraestrutura
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Engenheiro Civil', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'gerencial'),
  ('Coordenador de Obras', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'gerencial'),
  ('Fiscal de Obras', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Mestre de Obras', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Encarregado de Serviços', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Eletricista', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Operador de Máquinas', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Pedreiro', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Carpinteiro', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional'),
  ('Pintor', '4cdb0d4c-baf2-4735-9816-c63e10cee3dc', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;

-- SME - Educação
INSERT INTO public.cargos_secretaria (nome, secretaria_id, nivel) VALUES
  ('Diretor Escolar', '79afaec7-100b-4c39-80d9-84346f862206', 'estrategico'),
  ('Vice-diretor', '79afaec7-100b-4c39-80d9-84346f862206', 'gerencial'),
  ('Coordenador Pedagógico', '79afaec7-100b-4c39-80d9-84346f862206', 'gerencial'),
  ('Professor', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional'),
  ('Auxiliar de Sala', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional'),
  ('Secretário Escolar', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional'),
  ('Inspetor', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional'),
  ('Merendeira', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional'),
  ('Psicopedagogo', '79afaec7-100b-4c39-80d9-84346f862206', 'operacional')
ON CONFLICT (nome, secretaria_id) DO NOTHING;
