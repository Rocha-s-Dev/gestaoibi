
-- Add location columns to vinculos_funcionais
ALTER TABLE public.vinculos_funcionais 
  ADD COLUMN IF NOT EXISTS escola_id uuid REFERENCES public.escolas(id),
  ADD COLUMN IF NOT EXISTS unidade_saude_id uuid REFERENCES public.unidades_saude(id);

-- Create a view that joins with profiles to work around the auth.users FK limitation
CREATE OR REPLACE VIEW public.vinculos_funcionais_view AS
SELECT 
  vf.*,
  p.name AS profile_nome,
  p.email AS profile_email,
  cp.nome AS cargo_publico_nome,
  cp.codigo AS cargo_publico_codigo,
  fa.nome AS funcao_nome,
  fa.codigo AS funcao_codigo,
  s.nome AS secretaria_nome,
  ua.nome AS unidade_nome,
  cs.nome AS cargo_secretaria_nome,
  cs.nivel AS cargo_secretaria_nivel,
  e.nome AS escola_nome,
  us.nome AS unidade_saude_nome
FROM public.vinculos_funcionais vf
LEFT JOIN public.profiles p ON p.user_id = vf.user_id
LEFT JOIN public.cargos_publicos cp ON cp.id = vf.cargo_id
LEFT JOIN public.funcoes_administrativas fa ON fa.id = vf.funcao_id
LEFT JOIN public.secretarias s ON s.id = vf.secretaria_id
LEFT JOIN public.unidades_administrativas ua ON ua.id = vf.unidade_id
LEFT JOIN public.cargos_secretaria cs ON cs.id = vf.cargo_secretaria_id
LEFT JOIN public.escolas e ON e.id = vf.escola_id
LEFT JOIN public.unidades_saude us ON us.id = vf.unidade_saude_id;
