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

  let body: { senha?: string };
  try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
  const senha = String(body.senha || "");
  if (senha.length < 8) return json({ error: "A nova senha deve ter pelo menos 8 caracteres." }, 400);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Sessão inválida." }, 401);

  const { data: perfil } = await admin.from("usuarios")
    .select("deve_alterar_senha, senha_temporaria_ate")
    .eq("id", authData.user.id)
    .single();
  const expirada = !perfil?.senha_temporaria_ate || new Date(perfil.senha_temporaria_ate).getTime() <= Date.now();
  if (!perfil?.deve_alterar_senha || expirada) return json({ error: "A senha temporária é inválida ou expirou." }, 403);

  const { error: erroSenha } = await admin.auth.admin.updateUserById(authData.user.id, { password: senha });
  if (erroSenha) return json({ error: "Não foi possível salvar a nova senha." }, 400);

  const { error: erroPerfil } = await admin.from("usuarios")
    .update({ deve_alterar_senha: false, senha_temporaria_ate: null })
    .eq("id", authData.user.id);
  if (erroPerfil) return json({ error: "A nova senha foi salva, mas não foi possível concluir a troca." }, 500);

  return json({ ok: true });
});
