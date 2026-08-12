-- Mantém o identificador "matriz" para preservar os vínculos existentes de usuários,
-- pedidos e estoques, alterando somente os dados exibidos da filial.
update public.filiais
set nome = 'Sorriso',
    cidade = 'Sorriso, MT'
where id = 'matriz';
