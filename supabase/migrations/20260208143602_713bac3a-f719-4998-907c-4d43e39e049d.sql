
-- Corrigir função buscar_usuarios_rh: matricula está em vinculos_funcionais, não em profiles
CREATE OR REPLACE FUNCTION public.buscar_usuarios_rh(
  p_termo TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  user_id UUID,
  nome TEXT,
  email TEXT,
  cpf TEXT,
  matricula TEXT,
  status_cadastral TEXT,
  secretaria_atual TEXT
)
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
