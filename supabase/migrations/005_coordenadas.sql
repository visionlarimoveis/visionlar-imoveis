-- ============================================
-- Migração 005 — Coordenadas GPS nos Imóveis
-- Execute no SQL Editor do Supabase
-- ============================================

alter table imoveis
  add column if not exists latitude  numeric(10,7),
  add column if not exists longitude numeric(10,7);

-- Índice para buscas geográficas futuras
create index if not exists imoveis_coords_idx
  on imoveis(latitude, longitude)
  where latitude is not null and longitude is not null;
