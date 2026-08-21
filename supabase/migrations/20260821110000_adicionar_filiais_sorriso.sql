-- Mantém o ID "matriz" para preservar os vínculos e históricos existentes.
-- As novas filiais recebem IDs próprios e a operação pode ser executada mais de uma vez.
insert into public.filiais (id, nome, cidade) values
  ('matriz', 'Sorriso - Indústria', 'Sorriso, MT'),
  ('sorriso-laboratorio', 'Sorriso - Laboratório', 'Sorriso, MT'),
  ('sorriso-callcenter', 'Sorriso - Callcenter', 'Sorriso, MT'),
  ('sorriso-atendimento', 'Sorriso - Atendimento', 'Sorriso, MT')
on conflict (id) do update
set nome = excluded.nome,
    cidade = excluded.cidade;
