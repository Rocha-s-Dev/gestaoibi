
-- Corrigir view SECURITY DEFINER -> SECURITY INVOKER
CREATE OR REPLACE VIEW public.view_usuarios_rh 
WITH (security_invoker = true)
AS
SELECT 
  p.id, p.user_id, p.name, p.email, p.cpf,
  p.status_cadastral, p.tipo_usuario, p.criado_pelo_rh, p.data_cadastro_rh,
  p.requer_troca_senha, p.primeiro_acesso, p.data_ultimo_login,
  vf.id as vinculo_id, vf.matricula, vf.regime, vf.situacao as situacao_vinculo,
  vf.data_admissao, vf.jornada_semanal,
  s.id as secretaria_id, s.nome as secretaria_nome, s.sigla as secretaria_sigla,
  cp.id as cargo_id, cp.nome as cargo_nome,
  fa.id as funcao_id, fa.nome as funcao_nome,
  ua.id as unidade_id, ua.nome as unidade_nome
FROM public.profiles p
LEFT JOIN public.vinculos_funcionais vf ON vf.user_id = p.user_id AND vf.is_primary = true
LEFT JOIN public.secretarias s ON s.id = vf.secretaria_id
LEFT JOIN public.cargos_publicos cp ON cp.id = vf.cargo_id
LEFT JOIN public.funcoes_administrativas fa ON fa.id = vf.funcao_id
LEFT JOIN public.unidades_administrativas ua ON ua.id = vf.unidade_id;
