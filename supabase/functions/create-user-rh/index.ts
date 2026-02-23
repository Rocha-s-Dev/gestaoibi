import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the calling user is admin or gestor_rh
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401
      });
    }

    const token = authHeader.replace('Bearer ', '');

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify caller permissions using explicit token validation
    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller }, error: userError } = await supabaseUser.auth.getUser(token);
    if (userError || !caller) {
      console.error("JWT validation error:", userError);
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401
      });
    }

    // Check if caller is admin or gestor_rh
    const { data: isGestorRh } = await supabaseAdmin.rpc('is_gestor_rh', { _user_id: caller.id });
    if (!isGestorRh) {
      return new Response(JSON.stringify({ error: "Sem permissão. Apenas RH pode criar usuários." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403
      });
    }

    const { email, password, name, cpf, tipo_usuario, secretaria_id, cargo_id, funcao_id, unidade_id, regime, data_admissao, jornada_semanal, matricula } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return new Response(JSON.stringify({ error: "Email, senha e nome são obrigatórios" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "Senha deve ter no mínimo 6 caracteres" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    // Validate secretario must have secretaria
    if (tipo_usuario === 'secretario' && !secretaria_id) {
      return new Response(JSON.stringify({ error: "Secretário deve ter uma secretaria vinculada" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    // Only admin can create prefeito
    if (tipo_usuario === 'prefeito') {
      const { data: isCallerAdmin } = await supabaseAdmin.rpc('is_admin_municipal', { _user_id: caller.id });
      if (!isCallerAdmin) {
        return new Response(JSON.stringify({ error: "Apenas administradores podem criar usuários do tipo Prefeito." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403
        });
      }
    }

    // 1. Create auth user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(JSON.stringify({ error: createError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    const userId = newUser.user.id;

    // 2. Create/update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        name,
        email,
        cpf: cpf || null,
        criado_pelo_rh: true,
        rh_responsavel_id: caller.id,
        data_cadastro_rh: new Date().toISOString(),
        status_cadastral: 'ativo',
        tipo_usuario: tipo_usuario || 'funcionario',
        requer_troca_senha: true,
        primeiro_acesso: true,
      }, { onConflict: 'user_id' });

    if (profileError) {
      console.error("Error creating profile:", profileError);
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: "Erro ao criar perfil: " + profileError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400
      });
    }

    // 3. Assign role
    const papel = tipo_usuario === 'secretario' ? 'secretario' 
      : tipo_usuario === 'administrador' ? 'admin_municipal'
      : tipo_usuario === 'prefeito' ? 'prefeito'
      : tipo_usuario === 'auditor' ? 'auditor'
      : tipo_usuario === 'gestor_rh' ? 'gestor_rh'
      : tipo_usuario === 'juridico' ? 'servidor'
      : 'operador';

    await supabaseAdmin.from('papeis_usuario').insert({
      user_id: userId,
      papel,
      secretaria_id: secretaria_id || null,
      is_active: true,
      atribuido_por: caller.id
    });

    // 4. Create vincolo funcional if secretaria provided
    if (secretaria_id) {
      const { error: vinculoError } = await supabaseAdmin.from('vinculos_funcionais').insert({
        user_id: userId,
        secretaria_id,
        cargo_id: cargo_id || null,
        funcao_id: funcao_id || null,
        unidade_id: unidade_id || null,
        regime: regime || 'estatutario',
        data_admissao: data_admissao || new Date().toISOString().split('T')[0],
        jornada_semanal: jornada_semanal || 40,
        matricula: matricula || null,
        situacao: 'ativo',
        is_primary: true,
      });

      if (vinculoError) {
        console.error("Error creating vinculo:", vinculoError);
      }

      // 5. Create user_secretaria_roles
      await supabaseAdmin.from('user_secretaria_roles').insert({
        user_id: userId,
        secretaria_id,
        role: papel === 'admin_municipal' ? 'admin_municipal' : tipo_usuario === 'secretario' ? 'secretario' : 'servidor'
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      userId,
      message: "Usuário criado com sucesso pelo RH" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200
    });

  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: "Erro interno do servidor" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500
    });
  }
});
