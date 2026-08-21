-- Categorias administráveis pelo CD, sem alterar produtos ou saldos existentes.
create table if not exists public.categorias_produtos (
  nome text primary key check (nome = btrim(nome) and nome <> ''),
  criado_em timestamptz not null default now()
);

create unique index if not exists categorias_produtos_nome_sem_diferenca_de_maiusculas_idx
  on public.categorias_produtos (lower(nome));

insert into public.categorias_produtos (nome)
select distinct btrim(categoria)
from public.produtos
where btrim(categoria) <> ''
on conflict (nome) do nothing;

insert into public.categorias_produtos (nome) values
  ('Administrativo'), ('Dermocosméticos'), ('Embalagens'), ('Higiene'),
  ('Insumos'), ('Limpeza'), ('Medicamentos'), ('Outros')
on conflict (nome) do nothing;

alter table public.produtos
  drop constraint if exists produtos_categoria_fkey;
alter table public.produtos
  add constraint produtos_categoria_fkey
  foreign key (categoria) references public.categorias_produtos(nome)
  on update cascade on delete restrict;

grant select, insert, update, delete on public.categorias_produtos to authenticated;
revoke all on public.categorias_produtos from anon;
alter table public.categorias_produtos enable row level security;

create policy "usuarios autenticados leem categorias"
on public.categorias_produtos for select to authenticated using (true);

create policy "cd administra categorias"
on public.categorias_produtos for all to authenticated
using (public.meu_papel() = 'cd_admin')
with check (public.meu_papel() = 'cd_admin');
