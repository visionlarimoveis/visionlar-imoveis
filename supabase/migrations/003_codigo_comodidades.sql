-- ============================================
-- Migração 003 — Código e Comodidades nos Imóveis
-- Execute no SQL Editor do Supabase
-- ============================================

-- Adicionar campo codigo (ex: AP-001, CS-042)
alter table imoveis
  add column if not exists codigo text;

-- Adicionar campo comodidades (array de strings)
alter table imoveis
  add column if not exists comodidades text[] default '{}';

-- Índice único no código para evitar duplicatas
create unique index if not exists imoveis_codigo_unique
  on imoveis(codigo) where codigo is not null;
