-- Execute após supabase-schema.sql no SQL Editor do projeto Supabase.
-- Cria perfis, login e permissões por função/filial.

create type public.papel_usuario as enum ('cd_admin', 'filial');

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default '',
  papel public.papel_usuario not null default 'filial',
  filial_id text references public.filiais(id),
  criado_em timestamptz not null default now(),
  constraint usuario_filial_obrigatoria check (
    (papel = 'cd_admin' and filial_id is null) or
    (papel = 'filial' and filial_id is not null)
  )
);

create or replace function public.criar_perfil_usuario()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  filial text := nullif(new.raw_user_meta_data->>'filial_id', '');
begin
  if filial is not null and not exists (select 1 from public.filiais where id = filial) then
    raise exception 'Filial inválida';
  end if;
  insert into public.usuarios (id, nome, papel, filial_id)
  values (new.id, coalesce(new.raw_user_meta_data->>'nome', ''), 'filial', filial);
  return new;
end;
$$;

drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users
for each row execute procedure public.criar_perfil_usuario();

create or replace function public.meu_papel()
returns public.papel_usuario language sql stable security definer set search_path = public as
  'select papel from public.usuarios where id = auth.uid()';

create or replace function public.minha_filial_id()
returns text language sql stable security definer set search_path = public as
  'select filial_id from public.usuarios where id = auth.uid()';

grant execute on function public.meu_papel(), public.minha_filial_id() to authenticated;

alter table public.usuarios enable row level security;
revoke all on public.usuarios from anon;
grant select on public.usuarios to authenticated;
create policy "usuario le o proprio perfil" on public.usuarios
for select to authenticated using (id = auth.uid());

-- Substitui a política de demonstração, que deixava o banco aberto ao público.
do $$ declare t text;
begin
  foreach t in array array['filiais', 'produtos', 'pedidos', 'pedido_itens', 'estoque_filiais', 'movimentacoes'] loop
    execute format('drop policy if exists acesso_temporario on public.%I', t);
    execute format('revoke all on public.%I from anon', t);
  end loop;
end $$;

-- Remove a política usada apenas durante a fase sem controle de acesso.
drop policy if exists "Alteração pública temporária" on public.produtos;

create policy "usuarios autenticados leem filiais" on public.filiais for select to authenticated using (true);
create policy "cd administra filiais" on public.filiais for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');
create policy "usuarios autenticados leem produtos" on public.produtos for select to authenticated using (true);
create policy "cd administra produtos" on public.produtos for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');
create policy "cd le movimentacoes" on public.movimentacoes for select to authenticated using (public.meu_papel() = 'cd_admin');
create policy "cd administra movimentacoes" on public.movimentacoes for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');
create policy "cd le estoque das filiais" on public.estoque_filiais for select to authenticated using (public.meu_papel() = 'cd_admin');
create policy "filial le seu estoque" on public.estoque_filiais for select to authenticated using (filial_id = public.minha_filial_id());
create policy "cd administra estoque das filiais" on public.estoque_filiais for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');
create policy "cd le todos pedidos" on public.pedidos for select to authenticated using (public.meu_papel() = 'cd_admin');
create policy "filial le seus pedidos" on public.pedidos for select to authenticated using (filial_id = public.minha_filial_id());
create policy "filial cria seus pedidos" on public.pedidos for insert to authenticated with check (filial_id = public.minha_filial_id() and public.meu_papel() = 'filial');
create policy "cd administra pedidos" on public.pedidos for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');
create policy "cd le itens" on public.pedido_itens for select to authenticated using (public.meu_papel() = 'cd_admin');
create policy "filial le itens dos seus pedidos" on public.pedido_itens for select to authenticated using (exists (select 1 from public.pedidos p where p.id = pedido_id and p.filial_id = public.minha_filial_id()));
create policy "filial cria itens dos seus pedidos" on public.pedido_itens for insert to authenticated with check (exists (select 1 from public.pedidos p where p.id = pedido_id and p.filial_id = public.minha_filial_id()) and public.meu_papel() = 'filial');
create policy "cd administra itens" on public.pedido_itens for all to authenticated using (public.meu_papel() = 'cd_admin') with check (public.meu_papel() = 'cd_admin');

-- O snapshot antigo não deve ser usado após habilitar RLS.
revoke execute on function public.substituir_estado_estoque(jsonb) from anon, authenticated;
revoke execute on function public.criar_perfil_usuario() from public;
revoke execute on function public.criar_perfil_usuario() from authenticated;
revoke execute on function public.listar_usuarios() from public;
revoke execute on function public.meu_papel() from public;
revoke execute on function public.minha_filial_id() from public;
revoke execute on function public.confirmar_recebimento_pedido(text) from public;
revoke execute on function public.confirmar_recebimento_item_pedido(text, text) from public;
grant execute on function public.listar_usuarios() to authenticated;
grant execute on function public.meu_papel() to authenticated;
grant execute on function public.minha_filial_id() to authenticated;
grant execute on function public.confirmar_recebimento_pedido(text) to authenticated;
grant execute on function public.confirmar_recebimento_item_pedido(text, text) to authenticated;

alter table public.produtos replica identity full;
alter table public.pedidos replica identity full;
alter table public.pedido_itens replica identity full;
alter table public.estoque_filiais replica identity full;
alter table public.movimentacoes replica identity full;
alter publication supabase_realtime add table public.produtos, public.pedidos, public.pedido_itens, public.estoque_filiais, public.movimentacoes;

-- Promova manualmente o primeiro administrador após criar a conta:
-- update public.usuarios set papel = 'cd_admin', filial_id = null where id = '<UUID do usuário>';
