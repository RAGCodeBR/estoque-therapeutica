-- DRY-RUN SOMENTE LEITURA: importação da planilha "Estoque categorizado".
-- Seguro para executar no SQL Editor do projeto vspdodyjzybowlaerrnk.
-- Não há INSERT, UPDATE, DELETE, DDL, GRANT ou ALTER neste arquivo.
-- Execute todo o conteúdo e envie os resultados das consultas 1 a 5.

begin read only;

-- 1. Inventário atual completo: permite comparar produtos existentes com os 221
-- itens da planilha sem alterar nada.
select id, codigo, nome, categoria, quantidade, estoque_minimo, unidade,
       ativo, criado_em, atualizado_em, arquivado_em
from public.produtos
order by nome, id;

-- 2. Os 30 IDs que são inequivocamente produtos do mock local.
with mock_produtos(id) as (
  values
    ('prod-001'), ('prod-002'), ('prod-003'), ('prod-004'), ('prod-005'),
    ('prod-006'), ('prod-007'), ('prod-008'), ('prod-009'), ('prod-010'),
    ('prod-011'), ('prod-012'), ('prod-013'), ('prod-014'), ('prod-015'),
    ('prod-016'), ('prod-017'), ('prod-018'), ('prod-019'), ('prod-020'),
    ('prod-021'), ('prod-022'), ('prod-023'), ('prod-024'), ('prod-025'),
    ('prod-026'), ('prod-027'), ('prod-028'), ('prod-029'), ('prod-030')
)
select p.id, p.codigo, p.nome, p.categoria, p.quantidade, p.estoque_minimo,
       p.unidade, p.ativo, p.criado_em, p.atualizado_em, p.arquivado_em
from public.produtos p
join mock_produtos m on m.id = p.id
order by p.id;

-- 3. Contagens dos registros vinculados aos mocks. O esperado, se o demo foi
-- sincronizado sem mistura, é: 30 produtos, 10 movimentações, 6 pedidos,
-- 12 itens de pedido e 16 saldos por filial.
with mock_produtos(id) as (
  values
    ('prod-001'), ('prod-002'), ('prod-003'), ('prod-004'), ('prod-005'),
    ('prod-006'), ('prod-007'), ('prod-008'), ('prod-009'), ('prod-010'),
    ('prod-011'), ('prod-012'), ('prod-013'), ('prod-014'), ('prod-015'),
    ('prod-016'), ('prod-017'), ('prod-018'), ('prod-019'), ('prod-020'),
    ('prod-021'), ('prod-022'), ('prod-023'), ('prod-024'), ('prod-025'),
    ('prod-026'), ('prod-027'), ('prod-028'), ('prod-029'), ('prod-030')
), mock_movimentacoes(id) as (
  values ('mov-001'), ('mov-002'), ('mov-003'), ('mov-004'), ('mov-005'),
         ('mov-006'), ('mov-007'), ('mov-008'), ('mov-009'), ('mov-010')
), mock_pedidos(id) as (
  values ('ped-001'), ('ped-002'), ('ped-003'), ('ped-004'), ('ped-005'), ('ped-006')
)
select 'produtos mock presentes' as item, count(*)::integer as quantidade
from public.produtos p join mock_produtos m on m.id = p.id
union all
select 'movimentacoes mock presentes', count(*)::integer
from public.movimentacoes x join mock_movimentacoes m on m.id = x.id
union all
select 'pedidos mock presentes', count(*)::integer
from public.pedidos p join mock_pedidos m on m.id = p.id
union all
select 'itens em pedidos mock', count(*)::integer
from public.pedido_itens i join mock_pedidos m on m.id = i.pedido_id
union all
select 'estoque de filial de produtos mock', count(*)::integer
from public.estoque_filiais e join mock_produtos m on m.id = e.produto_id;

-- 4. Proteção: quaisquer linhas abaixo são vínculos NÃO pertencentes ao fixture
-- conhecido. Se houver resultado, a exclusão seletiva será bloqueada para análise.
with mock_produtos(id) as (
  values
    ('prod-001'), ('prod-002'), ('prod-003'), ('prod-004'), ('prod-005'),
    ('prod-006'), ('prod-007'), ('prod-008'), ('prod-009'), ('prod-010'),
    ('prod-011'), ('prod-012'), ('prod-013'), ('prod-014'), ('prod-015'),
    ('prod-016'), ('prod-017'), ('prod-018'), ('prod-019'), ('prod-020'),
    ('prod-021'), ('prod-022'), ('prod-023'), ('prod-024'), ('prod-025'),
    ('prod-026'), ('prod-027'), ('prod-028'), ('prod-029'), ('prod-030')
), mock_movimentacoes(id) as (
  values ('mov-001'), ('mov-002'), ('mov-003'), ('mov-004'), ('mov-005'),
         ('mov-006'), ('mov-007'), ('mov-008'), ('mov-009'), ('mov-010')
), mock_pedidos(id) as (
  values ('ped-001'), ('ped-002'), ('ped-003'), ('ped-004'), ('ped-005'), ('ped-006')
)
select 'movimentacao inesperada' as tipo, x.id as chave_1, x.produto_id as chave_2
from public.movimentacoes x join mock_produtos p on p.id = x.produto_id
where not exists (select 1 from mock_movimentacoes m where m.id = x.id)
union all
select 'item de pedido inesperado', i.pedido_id, i.produto_id
from public.pedido_itens i join mock_produtos p on p.id = i.produto_id
where not exists (select 1 from mock_pedidos m where m.id = i.pedido_id)
union all
select 'saldo de filial inesperado', e.filial_id, e.produto_id
from public.estoque_filiais e join mock_produtos p on p.id = e.produto_id
where not (e.filial_id, e.produto_id) in (
  values
    ('blumenau','prod-001'), ('blumenau','prod-003'), ('blumenau','prod-005'),
    ('blumenau','prod-010'), ('blumenau','prod-018'), ('blumenau','prod-029'),
    ('lucas','prod-002'), ('lucas','prod-014'), ('lucas','prod-023'),
    ('lucas','prod-026'), ('lucas','prod-028'), ('sinop','prod-006'),
    ('sinop','prod-009'), ('sinop','prod-017'), ('sinop','prod-027'), ('sinop','prod-030')
  );

-- 5. Mapeamento de categorias: o esquema não possui tabela de categorias ou IDs.
select categoria, count(*)::integer as produtos_atuais
from public.produtos
group by categoria
order by categoria;

rollback;
