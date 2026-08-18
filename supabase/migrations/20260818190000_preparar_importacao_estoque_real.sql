-- Etapa 1 (sem apagar dados): prepara a área de carga da planilha.
create table if not exists public.importacao_estoque_real_staging (
  produto text not null,
  categoria text not null,
  quantidade integer
);

alter table public.importacao_estoque_real_staging enable row level security;

revoke all on public.importacao_estoque_real_staging from anon, authenticated;

comment on table public.importacao_estoque_real_staging is
  'Carga temporária da aba Estoque categorizado. Preenchida via importação CSV no Dashboard antes da aplicação versionada.';
