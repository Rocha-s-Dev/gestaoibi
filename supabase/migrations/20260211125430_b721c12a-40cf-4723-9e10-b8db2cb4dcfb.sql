-- Add vice_diretor to education_role enum
ALTER TYPE public.education_role ADD VALUE IF NOT EXISTS 'vice_diretor' AFTER 'diretor';