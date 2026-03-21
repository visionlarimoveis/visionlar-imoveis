-- ============================================
-- Migração 004 — Storage de Fotos + Múltiplas Fotos
-- Execute no SQL Editor do Supabase
-- ============================================

-- 1. Adicionar campo fotos (array de URLs) na tabela imoveis
alter table imoveis
  add column if not exists fotos text[] default '{}';

-- 2. Criar bucket público para fotos dos imóveis
insert into storage.buckets (id, name, public)
  values ('imoveis-fotos', 'imoveis-fotos', true)
  on conflict (id) do nothing;

-- 3. Política: qualquer um pode ver as fotos (público)
create policy "Fotos publicas para leitura"
  on storage.objects for select
  using (bucket_id = 'imoveis-fotos');

-- 4. Política: uploads permitidos (anon key para desenvolvimento)
create policy "Upload de fotos permitido"
  on storage.objects for insert
  with check (bucket_id = 'imoveis-fotos');

-- 5. Política: delete permitido
create policy "Delete de fotos permitido"
  on storage.objects for delete
  using (bucket_id = 'imoveis-fotos');
