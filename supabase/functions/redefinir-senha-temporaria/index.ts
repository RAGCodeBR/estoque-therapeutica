import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sessão ausente." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Configuração administrativa indisponível." }, 500);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Sessão inválida." }, 401);

  const { data: solicitante } = await admin.from("usuarios").select("papel").eq("id", authData.user.id).single();
  if (solicitante?.papel !== "cd_admin") return json({ error: "Apenas administradores podem redefinir senhas." }, 403);

  let body: { usuario_id?: string; senha?: string };
  try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
  const usuarioId = String(body.usuario_id || "");
  const senha = String(body.senha || "");
  if (!usuarioId || senha.length < 8) return json({ error: "Informe uma senha temporária de pelo menos 8 caracteres." }, 400);

  const { data: usuario } = await admin.from("usuarios").select("id").eq("id", usuarioId).maybeSingle();
  if (!usuario) return json({ error: "Usuário não encontrado." }, 404);

  const expiraEm = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const { error: erroPerfil } = await admin.from("usuarios")
    .update({ deve_alterar_senha: true, senha_temporaria_ate: expiraEm })
    .eq("id", usuarioId);
  if (erroPerfil) return json({ error: "Não foi possível registrar a validade da senha temporária." }, 500);

  const { error: erroSenha } = await admin.auth.admin.updateUserById(usuarioId, { password: senha });
  if (erroSenha) {
    await admin.from("usuarios")
      .update({ deve_alterar_senha: false, senha_temporaria_ate: null })
      .eq("id", usuarioId);
    return json({ error: "Não foi possível definir a senha temporária." }, 400);
  }

  return json({ ok: true, expira_em: expiraEm });
});
