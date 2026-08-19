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

  const { data: perfil } = await admin.from("usuarios").select("papel").eq("id", authData.user.id).single();
  if (perfil?.papel !== "cd_admin") return json({ error: "Apenas administradores podem excluir usuários." }, 403);

  let body: { usuario_id?: string };
  try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }
  const usuarioId = String(body.usuario_id || "");
  if (!usuarioId) return json({ error: "Usuário inválido." }, 400);
  if (usuarioId === authData.user.id) return json({ error: "Você não pode excluir a própria conta." }, 400);

  const { error: deleteError } = await admin.auth.admin.deleteUser(usuarioId);
  if (deleteError) return json({ error: "Não foi possível excluir o usuário." }, 400);
  return json({ ok: true });
});
