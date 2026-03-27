-- ============================================
-- Migração 008 — Tabela de Comodidades
-- Execute no SQL Editor do Supabase
-- ============================================

create table if not exists comodidades_opcoes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  icone text default '✅',
  created_at timestamptz default now()
);

alter table comodidades_opcoes enable row level security;
create policy "Anon gerencia comodidades" on comodidades_opcoes for all using (true);

-- Dados iniciais
insert into comodidades_opcoes (nome, icone) values
  ('Piscina','🏊'),('Churrasqueira','🍖'),('Elevador','🛗'),
  ('Academia','💪'),('Salão de Festas','🎉'),('Playground','🛝'),
  ('Portaria 24h','🔐'),('Ar condicionado','❄️'),('Aquecimento a gás','🔥'),
  ('Jardim','🌿'),('Varanda','🏡'),('Garagem coberta','🚗'),
  ('Área de serviço','🧺'),('Cozinha equipada','🍳'),('Banheiro social','🚿'),
  ('Closet','👗'),('Escritório','💼'),('Despensa','📦'),
  ('Energia solar','☀️'),('Alarme','🚨'),('Câmeras','📹'),
  ('Internet fibra','📡'),('Pet friendly','🐾'),('Acessibilidade','♿')
on conflict do nothing;
