
-- =============================================
-- PARTE 1: ADICIONAR NOVOS PAPÉIS AO ENUM
-- =============================================
ALTER TYPE public.papel_sistemico ADD VALUE IF NOT EXISTS 'prefeito';
ALTER TYPE public.papel_sistemico ADD VALUE IF NOT EXISTS 'vice_prefeito';
ALTER TYPE public.papel_sistemico ADD VALUE IF NOT EXISTS 'assessor_gabinete';
