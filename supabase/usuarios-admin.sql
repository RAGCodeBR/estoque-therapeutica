-- Execute após usuarios-auth.sql. Libera o gerenciamento de perfis apenas ao CD.

drop policy if exists "cd gerencia perfis" on public.usuarios;
create policy "cd gerencia perfis" on public.usuarios
for all to authenticated
using (public.meu_papel() = 'cd_admin')
with check (public.meu_papel() = 'cd_admin');

create or replace function public.listar_usuarios()
returns table (
  id uuid,
  email text,
  nome text,
  papel public.papel_usuario,
  filial_id text,
  criado_em timestamptz
)
language plpgsql security definer set search_path = public, auth as $$
begin
  if public.meu_papel() <> 'cd_admin' then
    raise exception 'Apenas administradores podem listar usuários';
  end if;
  return query
    select p.id, u.email::text, p.nome, p.papel, p.filial_id, p.criado_em
    from public.usuarios p
    join auth.users u on u.id = p.id
    order by p.nome, u.email;
end;
$$;

grant execute on function public.listar_usuarios() to authenticated;
