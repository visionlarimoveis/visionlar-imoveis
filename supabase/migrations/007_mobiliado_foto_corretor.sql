-- Migração 007 — Mobiliado + Foto Corretor
alter table imoveis
  add column if not exists mobiliado text default 'Não'
  check (mobiliado in ('Não', 'Sim', 'Semimobiliado'));

alter table corretores
  add column if not exists foto_url text;

insert into storage.buckets (id, name, public)
  values ('corretores-fotos', 'corretores-fotos', true)
  on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where policyname = 'Fotos corretores publicas' and tablename = 'objects') then
    create policy "Fotos corretores publicas"
      on storage.objects for select using (bucket_id = 'corretores-fotos');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Upload fotos corretores' and tablename = 'objects') then
    create policy "Upload fotos corretores"
      on storage.objects for insert with check (bucket_id = 'corretores-fotos');
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Delete fotos corretores' and tablename = 'objects') then
    create policy "Delete fotos corretores"
      on storage.objects for delete using (bucket_id = 'corretores-fotos');
  end if;
end $$;
