# 🚀 VISIONLAR IMÓVEIS — GUIA DE DEPLOY COMPLETO
## Supabase + Vercel (100% Gratuito)

---

## PASSO 1 — Criar conta no Supabase

1. Acesse **https://supabase.com**
2. Clique em **"Start your project"**
3. Faça login com o GitHub (recomendado)
4. Clique em **"New Project"**
5. Preencha:
   - **Name:** visionlar-imoveis
   - **Database Password:** crie uma senha forte (anote!)
   - **Region:** South America (São Paulo)
6. Clique **"Create new project"** → aguarde ~2 minutos

---

## PASSO 2 — Criar o banco de dados

1. No painel do Supabase, clique em **"SQL Editor"** (ícone de banco)
2. Clique em **"New query"**
3. Abra o arquivo **`supabase-schema.sql`** deste pacote
4. Copie TODO o conteúdo e cole no editor
5. Clique **"RUN"** (ou Ctrl+Enter)
6. Você verá: *"Success. No rows returned"*

---

## PASSO 3 — Criar bucket de fotos

1. No painel, clique em **"Storage"**
2. Clique **"New bucket"**
3. Nome: **`imoveis-fotos`**
4. Marque **"Public bucket"** ✅
5. Clique **"Save"**
6. Agora clique no bucket → **"Policies"** → **"New policy"**
7. Selecione **"Allow public access"** → Save

---

## PASSO 4 — Pegar suas credenciais

1. No painel, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Copie:
   - **Project URL** (ex: https://xyzxyz.supabase.co)
   - **anon / public** key (a chave longa)

---

## PASSO 5 — Configurar o site

Abra o arquivo **`app.js`** e edite as primeiras linhas:

```javascript
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co'; // ← cole aqui
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui';          // ← cole aqui
const WHATSAPP_NUM = '5551999999999';                    // ← seu número
```

---

## PASSO 6 — Criar usuário admin

1. No Supabase, clique em **"Authentication"**
2. Clique **"Add user"** → **"Create new user"**
3. Preencha:
   - Email: seu-email@exemplo.com
   - Password: sua senha segura
4. Clique **"Create User"**

> ⚠️ Esse é o login que você vai usar na Área Admin do site.

---

## PASSO 7 — Deploy no Vercel

### Opção A — Upload direto (mais simples)
1. Acesse **https://vercel.com** e crie conta grátis
2. No dashboard, clique **"Add New Project"**
3. Clique **"Upload"** → arraste a pasta do site
4. Clique **"Deploy"**
5. Em ~1 minuto seu site estará em: **seusite.vercel.app** ✅

### Opção B — Via GitHub (melhor para atualizações)
1. Crie conta no **https://github.com**
2. Crie um repositório novo (ex: visionlar-site)
3. Faça upload dos arquivos (index.html, style.css, app.js)
4. No Vercel, clique **"Import Git Repository"**
5. Conecte o GitHub e selecione o repositório
6. Deploy automático! Toda mudança no GitHub vai ao ar automaticamente.

---

## PASSO 8 — Domínio personalizado (opcional)

1. No Vercel, vá no projeto → **"Settings"** → **"Domains"**
2. Adicione seu domínio: **visionlarimoveis.com.br**
3. Siga as instruções para apontar o DNS no seu provedor
4. Vercel gera HTTPS automático (certificado SSL grátis)

---

## PASSO 9 — Cadastrar os primeiros imóveis

### Via Área Admin do site:
1. Acesse seu site → rodapé → **"Área Admin"**
2. Faça login com o email/senha que criou no Supabase
3. Clique **"+ Novo Imóvel"** e preencha os dados

### Via painel Supabase (mais rápido para vários):
1. No Supabase → **"Table Editor"**
2. Clique na tabela **"imoveis"**
3. Clique **"Insert row"** e preencha os campos

---

## ESTRUTURA DAS TABELAS

| Tabela | Para que serve |
|--------|---------------|
| `imoveis` | Cadastro completo dos imóveis |
| `imovel_fotos` | Fotos de cada imóvel (múltiplas) |
| `leads` | Clientes que entraram em contato |
| `cidades` | Cidades disponíveis no filtro |
| `bairros` | Bairros por cidade |
| `tipos_imovel` | Casa, Apto, Terreno, Comercial... |
| `caracteristicas` | Piscina, Churrasqueira, etc. |
| `configuracoes` | WhatsApp, email, endereço, CRECI |

---

## COMO ADICIONAR CIDADES E BAIRROS

No Supabase → SQL Editor:

```sql
-- Adicionar cidade
INSERT INTO cidades (nome, estado_id) VALUES ('Canoas', 1);

-- Pegar o ID da cidade recém criada
SELECT id FROM cidades WHERE nome = 'Canoas';

-- Adicionar bairros para a cidade (use o id retornado acima)
INSERT INTO bairros (nome, cidade_id) VALUES
  ('Centro', 2),
  ('Mathias Velho', 2),
  ('Rio Branco', 2);
```

---

## COMO FAZER UPLOAD DE FOTOS

Na área admin do site, ao cadastrar/editar um imóvel:
1. Clique em "Selecionar fotos"
2. Escolha as imagens (JPG, PNG, WebP)
3. A primeira foto será usada como capa nos cards
4. Clique "Salvar Imóvel"

Ou via Supabase Storage direto:
1. Storage → imoveis-fotos → Upload
2. Copie a URL pública da foto
3. Insira na tabela `imovel_fotos` com o `imovel_id` correto

---

## CONFIGURAÇÕES DO SITE (via banco)

Para alterar WhatsApp, email, etc. sem mexer no código:
1. Supabase → Table Editor → configuracoes
2. Edite os valores diretamente na tabela

| chave | exemplo de valor |
|-------|-----------------|
| whatsapp | 5551999999999 |
| email | contato@visionlar.com.br |
| creci | 12345-F |
| nome_empresa | VisionLar Imóveis |

---

## LIMITES DO PLANO GRATUITO

| Supabase Free | Limite |
|--------------|--------|
| Banco de dados | 500 MB |
| Storage (fotos) | 1 GB |
| Requisições/mês | 50.000 |
| Usuários auth | Ilimitado |

| Vercel Free | Limite |
|------------|--------|
| Projetos | Ilimitado |
| Banda | 100 GB/mês |
| Deploys | Ilimitado |
| Domínio custom | ✅ Incluído |

> Para uma imobiliária iniciante, esses limites são mais que suficientes.
> Quando crescer, o Supabase Pro custa ~US$ 25/mês.

---

## SUPORTE

Em caso de dúvidas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Vercel: https://vercel.com/docs
- Comunidade Supabase (Discord): https://discord.supabase.com
