-- ============================================
-- VISIONLAR IMÓVEIS — SCHEMA SUPABASE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- ===== ESTADOS =====
CREATE TABLE estados (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  uf CHAR(2) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CIDADES =====
CREATE TABLE cidades (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  estado_id INTEGER REFERENCES estados(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== BAIRROS =====
CREATE TABLE bairros (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cidade_id INTEGER REFERENCES cidades(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== TIPOS DE IMÓVEL =====
CREATE TABLE tipos_imovel (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT DEFAULT '🏠',
  ativo BOOLEAN DEFAULT TRUE
);

-- ===== CARACTERÍSTICAS =====
CREATE TABLE caracteristicas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  icone TEXT DEFAULT '✅',
  categoria TEXT DEFAULT 'geral'
);

-- ===== IMÓVEIS =====
CREATE TABLE imoveis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo_id INTEGER REFERENCES tipos_imovel(id),
  finalidade TEXT CHECK (finalidade IN ('venda', 'aluguel')) NOT NULL,
  preco NUMERIC(15,2) NOT NULL,
  preco_condominio NUMERIC(10,2) DEFAULT 0,
  preco_iptu NUMERIC(10,2) DEFAULT 0,
  area_total NUMERIC(10,2) DEFAULT 0,
  area_construida NUMERIC(10,2) DEFAULT 0,
  quartos INTEGER DEFAULT 0,
  suites INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  andar INTEGER,
  total_andares INTEGER,
  estado_id INTEGER REFERENCES estados(id),
  cidade_id INTEGER REFERENCES cidades(id),
  bairro_id INTEGER REFERENCES bairros(id),
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  cep TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  destaque BOOLEAN DEFAULT FALSE,
  oportunidade BOOLEAN DEFAULT FALSE,
  novo BOOLEAN DEFAULT TRUE,
  ativo BOOLEAN DEFAULT TRUE,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== FOTOS DOS IMÓVEIS =====
CREATE TABLE imovel_fotos (
  id SERIAL PRIMARY KEY,
  imovel_id UUID REFERENCES imoveis(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  legenda TEXT,
  ordem INTEGER DEFAULT 0,
  capa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CARACTERÍSTICAS X IMÓVEIS =====
CREATE TABLE imovel_caracteristicas (
  imovel_id UUID REFERENCES imoveis(id) ON DELETE CASCADE,
  caracteristica_id INTEGER REFERENCES caracteristicas(id) ON DELETE CASCADE,
  PRIMARY KEY (imovel_id, caracteristica_id)
);

-- ===== LEADS / CLIENTES =====
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  mensagem TEXT,
  imovel_id UUID REFERENCES imoveis(id) ON DELETE SET NULL,
  imovel_codigo TEXT,
  origem TEXT DEFAULT 'site',
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em_contato', 'visitou', 'negociando', 'fechado', 'perdido')),
  anotacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== USUÁRIOS ADMIN =====
-- (Supabase Auth cuida do login; esta tabela guarda dados extras)
CREATE TABLE perfis_admin (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nome TEXT,
  cargo TEXT DEFAULT 'Corretor',
  creci TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== CONFIGURAÇÕES DO SITE =====
CREATE TABLE configuracoes (
  chave TEXT PRIMARY KEY,
  valor TEXT,
  descricao TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_imoveis_finalidade ON imoveis(finalidade);
CREATE INDEX idx_imoveis_tipo ON imoveis(tipo_id);
CREATE INDEX idx_imoveis_cidade ON imoveis(cidade_id);
CREATE INDEX idx_imoveis_bairro ON imoveis(bairro_id);
CREATE INDEX idx_imoveis_preco ON imoveis(preco);
CREATE INDEX idx_imoveis_destaque ON imoveis(destaque) WHERE destaque = TRUE;
CREATE INDEX idx_imoveis_ativo ON imoveis(ativo) WHERE ativo = TRUE;
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- ============================================
-- TRIGGER: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER imoveis_updated_at
  BEFORE UPDATE ON imoveis
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Imóveis: leitura pública, escrita só admin
ALTER TABLE imoveis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imoveis_leitura_publica" ON imoveis
  FOR SELECT USING (ativo = TRUE);
CREATE POLICY "imoveis_admin_total" ON imoveis
  FOR ALL USING (auth.role() = 'authenticated');

-- Fotos: leitura pública
ALTER TABLE imovel_fotos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fotos_leitura_publica" ON imovel_fotos
  FOR SELECT USING (TRUE);
CREATE POLICY "fotos_admin_total" ON imovel_fotos
  FOR ALL USING (auth.role() = 'authenticated');

-- Leads: somente admin lê/edita
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_insert_publico" ON leads
  FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "leads_admin_total" ON leads
  FOR ALL USING (auth.role() = 'authenticated');

-- Cidades/Bairros: leitura pública
ALTER TABLE cidades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cidades_publica" ON cidades FOR SELECT USING (ativo = TRUE);
CREATE POLICY "cidades_admin" ON cidades FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE bairros ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bairros_publica" ON bairros FOR SELECT USING (ativo = TRUE);
CREATE POLICY "bairros_admin" ON bairros FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "config_publica" ON configuracoes FOR SELECT USING (TRUE);
CREATE POLICY "config_admin" ON configuracoes FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET PARA FOTOS
-- ============================================
-- Execute no painel Storage do Supabase:
-- Criar bucket chamado "imoveis-fotos" (público)

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Estados
INSERT INTO estados (nome, uf) VALUES
  ('Rio Grande do Sul', 'RS'),
  ('Santa Catarina', 'SC'),
  ('Paraná', 'PR'),
  ('São Paulo', 'SP');

-- Tipos de imóvel
INSERT INTO tipos_imovel (nome, icone) VALUES
  ('Apartamento', '🏢'),
  ('Casa', '🏡'),
  ('Terreno', '🌿'),
  ('Comercial', '🏢'),
  ('Cobertura', '🏙️'),
  ('Kitnet', '🛏️'),
  ('Galpão', '🏭'),
  ('Fazenda/Sítio', '🌾');

-- Características
INSERT INTO caracteristicas (nome, icone, categoria) VALUES
  ('Piscina', '🏊', 'lazer'),
  ('Churrasqueira', '🍖', 'lazer'),
  ('Academia', '💪', 'lazer'),
  ('Salão de Festas', '🎉', 'lazer'),
  ('Playground', '👶', 'lazer'),
  ('Portaria 24h', '🔒', 'seguranca'),
  ('Câmeras de Segurança', '📷', 'seguranca'),
  ('Cerca Elétrica', '⚡', 'seguranca'),
  ('Elevador', '🛗', 'estrutura'),
  ('Gerador', '🔌', 'estrutura'),
  ('Ar-condicionado', '❄️', 'comodidades'),
  ('Mobiliado', '🛋️', 'comodidades'),
  ('Varanda', '🪟', 'comodidades'),
  ('Armários Planejados', '🚪', 'comodidades'),
  ('Vista para o Mar', '🌊', 'diferenciais'),
  ('Vista para Parque', '🌳', 'diferenciais'),
  ('Aceita Pets', '🐕', 'diferenciais'),
  ('Permite Financiamento', '💳', 'financeiro'),
  ('Aceita Permuta', '🔄', 'financeiro');

-- Configurações
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('whatsapp', '5551997901012', 'Número WhatsApp principal'),
  ('email', 'contato@visionlarimoveis.com.br', 'E-mail de contato'),
  ('endereco', 'Av. Principal, 1000 — Porto Alegre, RS', 'Endereço da imobiliária'),
  ('creci', '99.999-F', 'Número do CRECI'),
  ('nome_empresa', 'VisionLar Imóveis', 'Nome da empresa'),
  ('horario', 'Seg–Sex: 8h–18h | Sáb: 9h–13h', 'Horário de atendimento');

-- Cidade inicial (Porto Alegre)
INSERT INTO cidades (nome, estado_id) VALUES ('Porto Alegre', 1);

-- Bairros Porto Alegre
INSERT INTO bairros (nome, cidade_id) VALUES
  ('Moinhos de Vento', 1),
  ('Petrópolis', 1),
  ('Bela Vista', 1),
  ('Três Figueiras', 1),
  ('Jardim Europa', 1),
  ('Cidade Baixa', 1),
  ('Cristal', 1),
  ('Centro Histórico', 1),
  ('Auxiliadora', 1),
  ('Mont Serrat', 1),
  ('Menino Deus', 1),
  ('Tristeza', 1);
