-- Unidades de medida administráveis pelo CD, sem alterar produtos ou saldos existentes.
create table if not exists public.unidades_medida (
  nome text primary key check (nome = btrim(nome) and nome <> ''),
  criado_em timestamptz not null default now()
);

create unique index if not exists unidades_medida_nome_sem_diferenca_de_maiusculas_idx
  on public.unidades_medida (lower(nome));

insert into public.unidades_medida (nome)
select distinct btrim(unidade)
from public.produtos
where btrim(unidade) <> ''
on conflict (nome) do nothing;

insert into public.unidades_medida (nome) values
  ('Unidade'), ('Caixa'), ('Pacote'), ('Litro'), ('Quilograma')
on conflict (nome) do nothing;

alter table public.produtos
  drop constraint if exists produtos_unidade_fkey;
alter table public.produtos
  add constraint produtos_unidade_fkey
  foreign key (unidade) references public.unidades_medida(nome)
  on update cascade on delete restrict;

grant select, insert, update, delete on public.unidades_medida to authenticated;
revoke all on public.unidades_medida from anon;
alter table public.unidades_medida enable row level security;

create policy "usuarios autenticados leem unidades"
on public.unidades_medida for select to authenticated using (true);

create policy "cd administra unidades"
on public.unidades_medida for all to authenticated
using (public.meu_papel() = 'cd_admin')
with check (public.meu_papel() = 'cd_admin');
