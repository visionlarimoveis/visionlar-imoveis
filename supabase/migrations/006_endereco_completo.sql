-- ============================================
-- Migração 006 — Endereço Completo nos Imóveis
-- Execute no SQL Editor do Supabase
-- ============================================

alter table imoveis
  add column if not exists rua         text,
  add column if not exists numero      text,
  add column if not exists complemento text,
  add column if not exists cep         text;
