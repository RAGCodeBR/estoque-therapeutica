-- Etapa 2: execute SOMENTE depois de carregar os 221 itens na tabela
-- public.importacao_estoque_real_staging pelo Dashboard do Supabase.
-- Esta operação cria um backup, substitui os dados fictícios de estoque e
-- mantém filiais e usuários intactos. Execute uma única vez no SQL Editor.

begin;

do $$
declare
  v_total integer;
  v_invalidas integer;
  v_duplicadas integer;
begin
  select count(*) into v_total from public.importacao_estoque_real_staging;
  select count(*) into v_invalidas
  from public.importacao_estoque_real_staging
  where btrim(produto) = ''
     or categoria not in ('Administrativo', 'Dermocosméticos', 'Embalagens', 'Higiene', 'Insumos', 'Limpeza', 'Medicamentos', 'Outros');
  select count(*) - count(distinct lower(btrim(produto))) into v_duplicadas
  from public.importacao_estoque_real_staging;

  if v_total <> 221 then
    raise exception 'A staging deve conter exatamente 221 itens; encontrados %.', v_total;
  end if;
  if v_invalidas <> 0 then
    raise exception 'A staging contém % produto(s) vazio(s) ou categoria(s) inválida(s).', v_invalidas;
  end if;
  if v_duplicadas <> 0 then
    raise exception 'A staging contém % produto(s) duplicado(s).', v_duplicadas;
  end if;
end $$;

-- Backup imutável e completo das cinco tabelas afetadas.
create table if not exists public.backup_estoque_antes_importacao_20260818 (
  produto jsonb not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.backup_movimentacoes_antes_importacao_20260818 (
  registro jsonb not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.backup_pedidos_antes_importacao_20260818 (
  registro jsonb not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.backup_pedido_itens_antes_importacao_20260818 (
  registro jsonb not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.backup_estoque_filiais_antes_importacao_20260818 (
  registro jsonb not null,
  criado_em timestamptz not null default now()
);
create table if not exists public.importacao_estoque_real_20260818_controle (
  id boolean primary key default true check (id),
  aplicado_em timestamptz not null default now()
);

-- Não permite repetir a substituição após uma execução bem-sucedida.
do $$
begin
  if exists (select 1 from public.importacao_estoque_real_20260818_controle where id) then
    raise exception 'Importação já aplicada: operação idempotente bloqueada.';
  end if;
end $$;

insert into public.backup_estoque_antes_importacao_20260818 (produto) select to_jsonb(p) from public.produtos p;
insert into public.backup_movimentacoes_antes_importacao_20260818 (registro) select to_jsonb(m) from public.movimentacoes m;
insert into public.backup_pedido_itens_antes_importacao_20260818 (registro) select to_jsonb(i) from public.pedido_itens i;
insert into public.backup_pedidos_antes_importacao_20260818 (registro) select to_jsonb(p) from public.pedidos p;
insert into public.backup_estoque_filiais_antes_importacao_20260818 (registro) select to_jsonb(e) from public.estoque_filiais e;

delete from public.movimentacoes;
delete from public.pedido_itens;
delete from public.estoque_filiais;
delete from public.pedidos;
delete from public.produtos;

insert into public.produtos (codigo, nome, categoria, quantidade, estoque_minimo, unidade, ativo)
select '', btrim(produto), categoria,
       case when quantidade is null or quantidade < 0 then 0 else quantidade end,
       0, 'Unidade', true
from public.importacao_estoque_real_staging
order by produto;

insert into public.importacao_estoque_real_20260818_controle (id) values (true);

commit;
