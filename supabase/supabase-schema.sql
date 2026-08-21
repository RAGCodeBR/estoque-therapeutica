-- Execute este arquivo inteiro no SQL Editor do projeto Supabase.
-- Modelo relacional do Estoque Therapeutica.

create table if not exists public.filiais (
  id text primary key,
  nome text not null,
  cidade text not null
);

create table if not exists public.produtos (
  id text primary key,
  codigo text not null default '',
  nome text not null,
  categoria text not null,
  quantidade integer not null default 0 check (quantidade >= 0),
  estoque_minimo integer not null default 0 check (estoque_minimo >= 0),
  unidade text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  arquivado_em timestamptz
);

-- Compatibilidade com a tabela criada na integração inicial do projeto.
alter table public.produtos alter column id drop default;
alter table public.produtos alter column id type text using id::text;
alter table public.produtos alter column id set default gen_random_uuid()::text;
alter table public.produtos add column if not exists arquivado_em timestamptz;
alter table public.produtos add column if not exists codigo text not null default '';
alter table public.produtos add column if not exists categoria text not null default 'Outros';
alter table public.produtos add column if not exists quantidade integer not null default 0;
alter table public.produtos add column if not exists estoque_minimo integer not null default 0;
alter table public.produtos add column if not exists unidade text not null default 'Unidade';
alter table public.produtos add column if not exists ativo boolean not null default true;
alter table public.produtos add column if not exists criado_em timestamptz not null default now();
alter table public.produtos add column if not exists atualizado_em timestamptz not null default now();

create table if not exists public.pedidos (
  id text primary key,
  filial_id text not null references public.filiais(id),
  observacao text not null default '',
  observacao_matriz text not null default '',
  situacao text not null default 'pendente' check (situacao in ('pendente', 'aguardando_compra', 'em_transito', 'recebido', 'recusado')),
  compra_prevista date,
  compra_recebida_em timestamptz,
  entrega_prevista date,
  recebido_em timestamptz,
  criado_em timestamptz not null default now(),
  analisado_em timestamptz
);

create table if not exists public.pedido_itens (
  pedido_id text not null references public.pedidos(id) on delete cascade,
  produto_id text not null references public.produtos(id),
  estoque_informado integer not null check (estoque_informado >= 0),
  quantidade_solicitada integer not null check (quantidade_solicitada > 0),
  observacao text not null default '',
  situacao text not null default 'pendente' check (situacao in ('pendente', 'aguardando_compra', 'em_transito', 'recebido', 'recusado')),
  observacao_matriz text not null default '',
  primary key (pedido_id, produto_id)
);

create table if not exists public.estoque_filiais (
  filial_id text not null references public.filiais(id),
  produto_id text not null references public.produtos(id),
  quantidade integer not null default 0 check (quantidade >= 0),
  atualizado_em timestamptz not null default now(),
  primary key (filial_id, produto_id)
);

create table if not exists public.movimentacoes (
  id text primary key,
  produto_id text not null references public.produtos(id),
  tipo text not null check (tipo in ('entrada', 'saida', 'transferencia', 'ajuste')),
  quantidade integer not null check (quantidade > 0),
  saldo_antes integer,
  saldo_depois integer,
  observacao text not null default '',
  filial_id text references public.filiais(id),
  pedido_id text references public.pedidos(id),
  criado_em timestamptz not null default now()
);

create index if not exists movimentacoes_criado_em_idx on public.movimentacoes (criado_em desc);
create index if not exists movimentacoes_filial_id_idx on public.movimentacoes (filial_id);
create index if not exists movimentacoes_pedido_id_idx on public.movimentacoes (pedido_id);
create index if not exists pedidos_filial_id_idx on public.pedidos (filial_id);
create index if not exists estoque_filiais_produto_id_idx on public.estoque_filiais (produto_id);

insert into public.filiais (id, nome, cidade) values
  ('matriz', 'Sorriso - Indústria', 'Sorriso, MT'),
  ('blumenau', 'Blumenau', 'Blumenau, SC'),
  ('lucas', 'Lucas', 'Lucas do Rio Verde, MT'),
  ('sinop', 'Sinop', 'Sinop, MT'),
  ('sorriso-laboratorio', 'Sorriso - Laboratório', 'Sorriso, MT'),
  ('sorriso-callcenter', 'Sorriso - Callcenter', 'Sorriso, MT'),
  ('sorriso-atendimento', 'Sorriso - Atendimento', 'Sorriso, MT'),
  ('sorriso-rh', 'Sorriso - RH', 'Sorriso, MT')
on conflict (id) do update set nome = excluded.nome, cidade = excluded.cidade;

-- O app envia um retrato completo do estado. Isto permite a migração sem
-- alterar a interface existente. Para produção com múltiplos usuários, troque
-- esta função por operações por entidade e políticas baseadas em auth.uid().
create or replace function public.substituir_estado_estoque(p_estado jsonb)
returns void
language plpgsql
as $$
begin
  delete from public.movimentacoes;
  delete from public.pedido_itens;
  delete from public.estoque_filiais;
  delete from public.pedidos;
  delete from public.produtos;

  insert into public.produtos (id, codigo, nome, categoria, quantidade, estoque_minimo, unidade, ativo, criado_em, atualizado_em, arquivado_em)
  select coalesce(x->>'id', gen_random_uuid()::text), coalesce(x->>'codigo', ''), x->>'nome', x->>'categoria',
    coalesce((x->>'quantidade')::integer, 0), coalesce((x->>'estoqueMinimo')::integer, 0), x->>'unidade',
    coalesce((x->>'ativo')::boolean, true), coalesce((x->>'criadoEm')::timestamptz, now()),
    coalesce((x->>'atualizadoEm')::timestamptz, now()), nullif(x->>'arquivadoEm', '')::timestamptz
  from jsonb_array_elements(coalesce(p_estado->'produtos', '[]'::jsonb)) x;

  insert into public.pedidos (id, filial_id, observacao, observacao_matriz, situacao, compra_prevista, compra_recebida_em, entrega_prevista, recebido_em, criado_em, analisado_em)
  select x->>'id', x->>'filialId', coalesce(x->>'observacao', ''), coalesce(x->>'observacaoMatriz', ''),
    coalesce(x->>'situacao', 'pendente'), nullif(x->>'compraPrevista', '')::date,
    nullif(x->>'compraRecebidaEm', '')::timestamptz, nullif(x->>'entregaPrevista', '')::date,
    nullif(x->>'recebidoEm', '')::timestamptz, coalesce((x->>'criadoEm')::timestamptz, now()),
    nullif(x->>'analisadoEm', '')::timestamptz
  from jsonb_array_elements(coalesce(p_estado->'pedidos', '[]'::jsonb)) x;

  insert into public.pedido_itens (pedido_id, produto_id, estoque_informado, quantidade_solicitada, observacao)
  select p->>'id', i->>'produtoId', coalesce((i->>'estoqueInformado')::integer, 0),
    coalesce((i->>'quantidadeSolicitada')::integer, 1), coalesce(i->>'observacao', '')
  from jsonb_array_elements(coalesce(p_estado->'pedidos', '[]'::jsonb)) p
  cross join lateral jsonb_array_elements(coalesce(p->'itens', '[]'::jsonb)) i;

  insert into public.estoque_filiais (filial_id, produto_id, quantidade, atualizado_em)
  select split_part(key, ':', 1), split_part(key, ':', 2),
    coalesce((value->>'quantidade')::integer, value::text::integer, 0),
    coalesce((value->>'atualizadoEm')::timestamptz, now())
  from jsonb_each(coalesce(p_estado->'estoqueFiliais', '{}'::jsonb));

  insert into public.movimentacoes (id, produto_id, tipo, quantidade, saldo_antes, saldo_depois, observacao, filial_id, pedido_id, criado_em)
  select x->>'id', x->>'produtoId', x->>'tipo', (x->>'quantidade')::integer,
    nullif(x->>'saldoAntes', '')::integer, nullif(x->>'saldoDepois', '')::integer,
    coalesce(x->>'observacao', ''), nullif(x->>'filialId', ''), nullif(x->>'pedidoId', ''),
    coalesce((x->>'criadoEm')::timestamptz, now())
  from jsonb_array_elements(coalesce(p_estado->'movimentacoes', '[]'::jsonb)) x;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant execute on function public.substituir_estado_estoque(jsonb) to anon, authenticated;

alter table public.filiais enable row level security;
alter table public.produtos enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_itens enable row level security;
alter table public.estoque_filiais enable row level security;
alter table public.movimentacoes enable row level security;

-- Política temporária para a fase atual, ainda sem login.
do $$ declare t text;
begin
  foreach t in array array['filiais', 'produtos', 'pedidos', 'pedido_itens', 'estoque_filiais', 'movimentacoes'] loop
    execute format('drop policy if exists acesso_temporario on public.%I', t);
    execute format('create policy acesso_temporario on public.%I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;
