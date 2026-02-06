
-- PARTE 1: Adicionar novo valor ao enum papel_sistemico
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'gestor_rh' AND enumtypid = 'papel_sistemico'::regtype) THEN
    ALTER TYPE public.papel_sistemico ADD VALUE 'gestor_rh';
  END IF;
END $$;
