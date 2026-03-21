-- ============================================
-- VisionLar Imóveis — Schema Supabase
-- Execute no SQL Editor do Supabase
-- ============================================

-- EXTENSÕES
create extension if not exists "uuid-ossp";

-- ============================================
-- CIDADES
-- ============================================
create table if not exists cidades (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  estado text not null default 'RS',
  created_at timestamptz default now()
);

-- ============================================
-- BAIRROS
-- ============================================
create table if not exists bairros (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cidade_id uuid references cidades(id) on delete cascade,
  created_at timestamptz default now()
);

-- ============================================
-- TIPOS DE IMÓVEL
-- ============================================
create table if not exists tipos_imovel (
  id uuid primary key default uuid_generate_v4(),
  nome text not null unique,
  icone text default '🏠',
  created_at timestamptz default now()
);

-- ============================================
-- CORRETORES
-- ============================================
create table if not exists corretores (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  creci text,
  telefone text,
  email text,
  status text default 'Ativo' check (status in ('Ativo','Inativo')),
  created_at timestamptz default now()
);

-- ============================================
-- IMÓVEIS
-- ============================================
create table if not exists imoveis (
  id uuid primary key default uuid_generate_v4(),
  titulo text not null,
  tipo text not null,
  finalidade text not null check (finalidade in ('Venda','Aluguel')),
  preco numeric(15,2) not null,
  cidade_id uuid references cidades(id),
  bairro_id uuid references bairros(id),
  endereco text,
  area numeric(10,2),
  dorms integer default 0,
  suites integer default 0,
  banhs integer default 0,
  vagas integer default 0,
  condominio numeric(10,2) default 0,
  descricao text,
  foto_url text,
  fotos text[] default '{}',
  status text default 'Ativo' check (status in ('Ativo','Inativo','Vendido','Alugado')),
  destaque boolean default false,
  corretor_id uuid references corretores(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- CLIENTES
-- ============================================
create table if not exists clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  cpf_cnpj text,
  tipo text default 'Comprador' check (tipo in ('Comprador','Vendedor','Locador','Locatário')),
  telefone text not null,
  email text,
  cidade_id uuid references cidades(id),
  bairro text,
  observacoes text,
  created_at timestamptz default now()
);

-- ============================================
-- LEADS / CRM
-- ============================================
create table if not exists leads (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid references clientes(id) on delete cascade,
  imovel_id uuid references imoveis(id),
  corretor_id uuid references corretores(id),
  interesse text default 'Compra' check (interesse in ('Compra','Aluguel','Venda')),
  status text default 'Lead' check (status in ('Lead','Negociando','Fechado','Perdido')),
  orcamento numeric(15,2),
  observacoes text,
  data_contato date default current_date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TRIGGER — updated_at automático
-- ============================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger imoveis_updated_at
  before update on imoveis
  for each row execute function set_updated_at();

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilita RLS em todas as tabelas
alter table cidades enable row level security;
alter table bairros enable row level security;
alter table tipos_imovel enable row level security;
alter table corretores enable row level security;
alter table imoveis enable row level security;
alter table clientes enable row level security;
alter table leads enable row level security;

-- Políticas de LEITURA pública (site público pode ver imóveis ativos)
create policy "Imóveis ativos são públicos" on imoveis
  for select using (status = 'Ativo');

create policy "Cidades são públicas" on cidades
  for select using (true);

create policy "Bairros são públicos" on bairros
  for select using (true);

create policy "Tipos são públicos" on tipos_imovel
  for select using (true);

-- Políticas de ESCRITA (anon pode inserir leads do site)
create policy "Anon pode criar lead" on leads
  for insert with check (true);

create policy "Anon pode criar cliente" on clientes
  for insert with check (true);

-- Para o painel admin funcionar com a anon key no dev,
-- adicione as políticas abaixo. Em produção, use auth.
create policy "Anon lê tudo imoveis" on imoveis
  for select using (true);

create policy "Anon insere imoveis" on imoveis
  for insert with check (true);

create policy "Anon atualiza imoveis" on imoveis
  for update using (true);

create policy "Anon deleta imoveis" on imoveis
  for delete using (true);

create policy "Anon lê clientes" on clientes
  for select using (true);

create policy "Anon atualiza clientes" on clientes
  for update using (true);

create policy "Anon deleta clientes" on clientes
  for delete using (true);

create policy "Anon lê leads" on leads
  for select using (true);

create policy "Anon atualiza leads" on leads
  for update using (true);

create policy "Anon deleta leads" on leads
  for delete using (true);

create policy "Anon gerencia corretores" on corretores
  for all using (true);

create policy "Anon gerencia bairros" on bairros
  for all using (true);

create policy "Anon gerencia cidades" on cidades
  for all using (true);

create policy "Anon gerencia tipos" on tipos_imovel
  for all using (true);

-- ============================================
-- DADOS INICIAIS
-- ============================================
insert into cidades (nome, estado) values
  ('Candelária', 'RS'),
  ('Santa Cruz do Sul', 'RS'),
  ('Rio Pardo', 'RS');

insert into tipos_imovel (nome, icone) values
  ('Apartamento', '🏢'),
  ('Casa', '🏠'),
  ('Terreno', '🌿'),
  ('Comercial', '🏪'),
  ('Chácara/Sítio', '🌾'),
  ('Galpão', '🏭');
