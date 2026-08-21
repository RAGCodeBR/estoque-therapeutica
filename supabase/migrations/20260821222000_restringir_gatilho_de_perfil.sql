-- Esta função é usada exclusivamente pelo gatilho de criação em auth.users.
-- Não deve estar disponível como RPC para usuários autenticados.
revoke execute on function public.criar_perfil_usuario() from authenticated;
