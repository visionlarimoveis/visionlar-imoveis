-- ============================================
-- Adicionar tabela de configurações da imobiliária
-- Execute no SQL Editor do Supabase
-- ============================================

create table if not exists configuracoes (
  id uuid primary key default uuid_generate_v4(),
  chave text not null unique,
  valor text,
  updated_at timestamptz default now()
);

-- RLS
alter table configuracoes enable row level security;
create policy "Anon gerencia configuracoes" on configuracoes for all using (true);

-- Dados iniciais
insert into configuracoes (chave, valor) values
  ('nome', 'VisionLar Imóveis'),
  ('creci', ''),
  ('whatsapp', '5551997901012'),
  ('email', 'contato@visionlarimovies.com.br'),
  ('telefone', '(51) 9 9790-1012'),
  ('cidade_sede', 'Candelária - RS'),
  ('endereco', ''),
  ('sobre', 'A VisionLar Imóveis é uma empresa especializada em intermediação imobiliária, com foco em proporcionar uma experiência segura, transparente e eficiente para quem deseja comprar ou vender imóveis.')
on conflict (chave) do nothing;
