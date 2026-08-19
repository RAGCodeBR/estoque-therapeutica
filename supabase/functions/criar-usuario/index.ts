import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...corsHeaders, "Content-Type": "application/json" },
});

function normalizarLogin(valor: string) {
  return valor.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Método não permitido." }, 405);

  const authorization = request.headers.get("Authorization");
  const token = authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Sessão ausente." }, 401);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) return json({ error: "Configuração administrativa indisponível." }, 500);

  const admin = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Sessão inválida." }, 401);

  const { data: perfil, error: perfilError } = await admin
    .from("usuarios")
    .select("papel")
    .eq("id", authData.user.id)
    .single();
  if (perfilError || perfil?.papel !== "cd_admin") return json({ error: "Apenas administradores podem criar usuários." }, 403);

  let body: { login?: string; nome?: string; senha?: string; papel?: string; filial_id?: string | null };
  try { body = await request.json(); } catch { return json({ error: "Dados inválidos." }, 400); }

  const login = normalizarLogin(String(body.login || "").trim());
  const email = `${login}@usuarios.therapeutica.local`;
  const nome = String(body.nome || "").trim();
  const senha = String(body.senha || "");
  const papel = body.papel;
  const filialId = papel === "cd_admin" ? null : String(body.filial_id || "").trim();

  if (!nome || login.length < 3 || login.length > 40 || senha.length < 8) {
    return json({ error: "Informe nome, login único de 3 a 40 caracteres e senha inicial de pelo menos 8 caracteres." }, 400);
  }
  if (papel !== "cd_admin" && papel !== "filial") return json({ error: "Papel de usuário inválido." }, 400);
  if (papel === "filial" && !filialId) return json({ error: "Selecione a filial do usuário." }, 400);
  if (filialId) {
    const { data: filial } = await admin.from("filiais").select("id").eq("id", filialId).maybeSingle();
    if (!filial) return json({ error: "Filial inválida." }, 400);
  }

  const { data: novoUsuario, error: createError } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    // O gatilho existente cria inicialmente todos os perfis como "filial".
    // Para administradores, uma filial temporária satisfaz essa validação e é
    // removida imediatamente na atualização de perfil abaixo.
    user_metadata: { nome, filial_id: filialId || "matriz" },
  });
  if (createError || !novoUsuario.user) {
    const mensagem = createError?.message?.toLowerCase().includes("already") || createError?.message?.toLowerCase().includes("registered")
      ? "Este nome de usuário já está em uso. Escolha outro login."
      : (createError?.message || "Não foi possível criar o usuário.");
    return json({ error: mensagem }, 400);
  }

  const { error: updateError } = await admin
    .from("usuarios")
    .update({ nome, papel, filial_id: filialId })
    .eq("id", novoUsuario.user.id);
  if (updateError) {
    await admin.auth.admin.deleteUser(novoUsuario.user.id);
    return json({ error: "Não foi possível configurar o perfil do usuário." }, 500);
  }

  return json({ id: novoUsuario.user.id, login, nome, papel, filial_id: filialId }, 201);
});
