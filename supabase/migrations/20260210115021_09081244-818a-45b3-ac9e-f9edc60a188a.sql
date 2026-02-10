
-- =============================================
-- MOTORISTAS: Remover campos pessoais redundantes, tornar user_id NOT NULL
-- =============================================

-- 1. Copiar dados pessoais para profiles onde possível (preservar dados existentes)
UPDATE public.motoristas m
SET user_id = p.id
FROM public.profiles p
WHERE m.cpf IS NOT NULL AND p.cpf = m.cpf AND m.user_id IS NULL;

-- 2. Remover campos pessoais redundantes
ALTER TABLE public.motoristas
  DROP COLUMN IF EXISTS nome,
  DROP COLUMN IF EXISTS cpf,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS telefone,
  DROP COLUMN IF EXISTS endereco;

-- 3. Tornar user_id NOT NULL (após limpeza de registros órfãos)
DELETE FROM public.motoristas WHERE user_id IS NULL;
ALTER TABLE public.motoristas ALTER COLUMN user_id SET NOT NULL;

-- =============================================
-- PROFISSIONAIS_SAUDE: Remover campos pessoais, tornar user_id NOT NULL
-- =============================================

-- 1. Copiar dados pessoais para profiles onde possível
UPDATE public.profissionais_saude ps
SET user_id = p.id
FROM public.profiles p
WHERE ps.cpf IS NOT NULL AND p.cpf = ps.cpf AND ps.user_id IS NULL;

-- 2. Remover campos pessoais redundantes
ALTER TABLE public.profissionais_saude
  DROP COLUMN IF EXISTS nome,
  DROP COLUMN IF EXISTS cpf,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS telefone;

-- 3. Tornar user_id NOT NULL
DELETE FROM public.profissionais_saude WHERE user_id IS NULL;
ALTER TABLE public.profissionais_saude ALTER COLUMN user_id SET NOT NULL;

-- 4. Adicionar FK se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profissionais_saude_user_id_fkey'
  ) THEN
    ALTER TABLE public.profissionais_saude
      ADD CONSTRAINT profissionais_saude_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id);
  END IF;
END $$;
