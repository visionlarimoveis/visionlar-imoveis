# VisionLar Imóveis — Sistema Imobiliário

Sistema completo: painel admin + CRM + site público.

**Stack:** Next.js 14 · Supabase · Tailwind CSS · Vercel

---

## ⚡ Deploy rápido (você já tem Supabase + Vercel conectados)

### 1. Descompacte o zip e substitua os arquivos no seu repositório git

```bash
# Extraia o zip e entre na pasta
cd visionlar

# Commite tudo
git add .
git commit -m "feat: sistema VisionLar completo"
git push
```

O Vercel detecta o push e faz o deploy automático. ✅

---

### 2. Configure as variáveis no Vercel

No painel **vercel.com → seu projeto → Settings → Environment Variables**, adicione:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://mhwxbcintssgfnrftws.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_2YnL7vXarvtAyaKJqAKfUg_y51v8caX` |
| `NEXT_PUBLIC_WHATSAPP` | `5551997901012` |
| `NEXT_PUBLIC_SITE_URL` | URL do seu projeto no Vercel |

Depois clique em **Redeploy** para aplicar.

---

### 3. Execute o SQL no Supabase

Se ainda não criou as tabelas, vá em:
**Supabase → SQL Editor → New query**

Cole o conteúdo de `supabase/migrations/001_schema.sql` e clique **Run ▶️**

---

## 📁 Estrutura

```
app/
  dashboard/     → painel principal com estatísticas
  imoveis/       → CRUD completo de imóveis
  clientes/      → base de clientes
  leads/         → CRM / pipeline
  cidades/       → cadastro de cidades
  bairros/       → cadastro de bairros
  tipos/         → tipos de imóvel
  corretores/    → equipe
  config/        → configurações
  site/          → site público com busca e WhatsApp
```

---

## 📞 Contato VisionLar
- WhatsApp: (51) 9 9790-1012
- Email: contato@visionlarimovies.com.br
