# 🚀 Guia Rápido - Backend do Projeto de Apadrinhamento

## Status do Deploy

- ✅ **API Serverless**: Vercel
- ✅ **Banco de Dados**: Supabase PostgreSQL
- ✅ **Notíficações**: Email (configurável)
- ✅ **Frontend**: GitHub Pages

## 📦 Arquivos Principais

| Arquivo | Descrição |
|---------|-------------|
| `api/submissions.js` | Endpoint para receber fichas |
| `api/notifications.js` | Sistema de notificação por email |
| `api/health.js` | Health check da API |
| `scripts/form-submission.js` | JavaScript do formulário |
| `vercel.json` | Configuração do Vercel |
| `docs/SETUP_GUIDE.md` | Guia completo de configuração |
| `docs/DATABASE_SCHEMA.md` | Esquema do banco de dados |

## 🔧 Variáveis de Ambiente

Defina no Vercel:

```env
# Supabase (obrigatório)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Email (opcional, mas recomendado)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASSWORD=sua-senha-app
NOTIFICATION_EMAIL=admin@example.com
```

## 📍 Endpoints da API

### POST `/api/submissions`

Recebe uma ficha de inscrição.

**Request:**
```json
{
  "modalidade": "afetivo",
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@example.com",
  "celular": "(19) 9 9999-9999",
  "...": "... outros campos"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inscrição recebida com sucesso!",
  "id": 42,
  "timestamp": "2026-06-13T01:04:45Z"
}
```

**Errors:**
- 400: Validação falhada
- 409: CPF já cadastrado
- 500: Erro no servidor

### GET `/api/health`

Verifica o status da API e do banco de dados.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-06-13T01:04:45Z",
  "database": "connected",
  "environment": "production"
}
```

## 🧪 Testando Localmente

```bash
# Instalar dependências
npm install

# Criar .env com credenciais
cp .env.example .env
# Edite com suas credenciais do Supabase

# Rodar em desenvolvimento
npm run dev

# Testar API
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "modalidade": "afetivo",
    "nome": "Teste",
    "cpf": "123.456.789-00",
    "email": "teste@example.com",
    "celular": "(19) 9 9999-9999"
  }'
```

## 📧 Configurar Email

### Usando Gmail (recomendado)

1. Ative 2FA na sua conta Google
2. Vá para [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Selecione "Mail" e "Windows Computer"
4. Copie a senha gerada
5. Use no Vercel:
   - `SMTP_USER` = seu email Gmail
   - `SMTP_PASSWORD` = senha gerada

### Usando SendGrid (alternativa)

1. Crie conta em [sendgrid.com](https://sendgrid.com)
2. Gere uma API Key
3. Instale: `npm install @sendgrid/mail`
4. Use no código

## 📊 Visualizar Dados

### Dashboard Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Selecione seu projeto
3. Vá para **Table Editor**
4. Clique em `submissions`
5. Veja todas as inscrições

### Exportar CSV

```bash
# No Table Editor do Supabase:
# 1. Clique em "Download as CSV"
# 2. Abra no Excel/Google Sheets
```

### Queries úteis

```sql
-- Contar por modalidade
SELECT modalidade, COUNT(*) FROM submissions GROUP BY modalidade;

-- Inscrições de hoje
SELECT * FROM submissions WHERE DATE(submitted_at) = TODAY();

-- Emails
SELECT nome, email FROM submissions WHERE status = 'pending_review';
```

## 🔍 Monitoramento

### Vercel Logs

1. Acesse [vercel.com](https://vercel.com)
2. Selecione o projeto `apadrinhamento`
3. Clique em "Deployments"
4. Veja logs em "Logs"

### Testar Health Check

```bash
curl https://seu-projeto.vercel.app/api/health
```

## 🔐 Segurança

### Implementado:

- ✅ CORS com whitelist de domínios
- ✅ Validação de entrada
- ✅ Sanitização de dados
- ✅ CPF único (não permite duplicatas)
- ✅ Rate limiting (via Vercel)
- ✅ HTTPS obrigatório

### Recomendado adicionar:

- ⚠️ Rate limiting por IP
- ⚠️ Verificação de CPF com validação de dígitos verificadores
- ⚠️ Captcha (reCAPTCHA v3)
- ⚠️ Logs de auditoria

## 📄 Relatórios

### Gerar relatório semanal

```sql
SELECT 
  DATE(submitted_at) as data,
  modalidade,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'approved' THEN 1 END) as aprovadas
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(submitted_at), modalidade
ORDER BY data DESC;
```

### Exportar para Excel

```sql
SELECT 
  nome, cpf, email, celular, modalidade,
  profissao, cidade, estado,
  submitted_at, status
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '30 days'
ORDER BY submitted_at DESC;
```

## 😩 Troubleshooting

### "Connection refused"
- Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
- Teste em [supabase.com](https://supabase.com)

### "CORS error"
- Adicione seu domínio em `corsHandler` no `api/submissions.js`
- Ou teste com `curl` primeiro

### "Email não enviado"
- Verifique variáveis SMTP
- Tente com Gmail primeiro (mais simples)
- Verifique permissões de firewall

### "CPF duplicado"
- Normal! Significa que alguém tentou se inscrever duas vezes
- Retorna código 409

## 📞 Suporte

Para dúvidas:
- [Issues no GitHub](https://github.com/apadrinhamentoleme-collab/apadrinhamento/issues)
- [Docs Supabase](https://supabase.com/docs)
- [Docs Vercel](https://vercel.com/docs)
