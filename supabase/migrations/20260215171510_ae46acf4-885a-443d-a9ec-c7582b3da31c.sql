
-- Update buscar_usuarios_rh to exclude admin users from results
CREATE OR REPLACE FUNCTION public.buscar_usuarios_rh(p_termo text DEFAULT NULL::text, p_limit integer DEFAULT 20)
 RETURNS TABLE(user_id uuid, nome text, email text, cpf text, matricula text, status_cadastral text, secretaria_atual text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    p.user_id,
    p.name,
    p.email,
    p.cpf,
    vf.matricula,
    p.status_cadastral,
    s.nome as secretaria_atual
  FROM public.profiles p
  LEFT JOIN public.vinculos_funcionais vf ON vf.user_id = p.user_id AND vf.situacao = 'ativo' AND vf.is_primary = true
  LEFT JOIN public.secretarias s ON s.id = vf.secretaria_id
  WHERE p.status_cadastral IN ('ativo', 'pendente_regularizacao')
    AND p.tipo_usuario != 'administrador'
    AND (
      p_termo IS NULL 
      OR p.name ILIKE '%' || p_termo || '%'
      OR p.email ILIKE '%' || p_termo || '%'
      OR p.cpf ILIKE '%' || p_termo || '%'
      OR vf.matricula ILIKE '%' || p_termo || '%'
    )
  ORDER BY p.name
  LIMIT p_limit;
$$;
