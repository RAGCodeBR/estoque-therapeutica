-- Execute no SQL Editor do Supabase para corrigir contas criadas antes
-- da instalação do gatilho "ao_criar_usuario".

-- Cria perfis somente para contas que possuem uma filial válida no cadastro.
insert into public.usuarios (id, nome, papel, filial_id)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'nome', ''),
  'filial'::public.papel_usuario,
  f.id
from auth.users u
join public.filiais f on f.id = nullif(u.raw_user_meta_data->>'filial_id', '')
where not exists (
  select 1 from public.usuarios p where p.id = u.id
)
on conflict (id) do nothing;

-- Restaura a permissão que permite a cada conta ler o próprio perfil.
-- Necessária quando usuarios-auth.sql não foi concluído em uma execução anterior.
alter table public.usuarios enable row level security;
grant select on public.usuarios to authenticated;
drop policy if exists "usuario le o proprio perfil" on public.usuarios;
create policy "usuario le o proprio perfil" on public.usuarios
for select to authenticated using (id = auth.uid());

-- Consulte as contas e confirme qual e-mail será o administrador do CD.
select u.id, u.email, p.nome, p.papel, p.filial_id
from auth.users u
left join public.usuarios p on p.id = u.id
order by u.email;

-- Depois de trocar o e-mail abaixo pelo e-mail da conta administradora,
-- execute este bloco. Ele também cria o perfil caso essa conta ainda não exista.
--
insert into public.usuarios (id, nome, papel, filial_id)
select u.id, coalesce(u.raw_user_meta_data->>'nome', ''), 'cd_admin'::public.papel_usuario, null
from auth.users u
where lower(u.email) = lower('arthurogrupoahouse@gmail.com')
on conflict (id) do update
set papel = 'cd_admin', filial_id = null;
