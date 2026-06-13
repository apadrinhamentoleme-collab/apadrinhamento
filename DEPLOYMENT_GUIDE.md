# 🎯 Guia de Finalização do Backend

## Status: ✅ Pronto para Produção

Todo o sistema de backend foi implementado com sucesso! Este documento contém os últimos passos para colocar em produção.

---

## 📝 Sumário do que foi criado

### **Backend (Vercel + Supabase)**

✅ **API Endpoints:**
- `POST /api/submissions` - Receber fichas
- `GET /api/submissions-list` - Listar com filtros
- `GET /api/submissions-export` - Exportar CSV
- `GET /api/health` - Health check

✅ **Sistema de Notificações:**
- Email para admins (nova inscrição)
- Email para candidatos (confirmação)
- Templates HTML personalizados

✅ **Dashboard Admin:**
- Visualizar todas as inscrições
- Filtros avançados
- Estatísticas em tempo real
- Exportação CSV
- Autenticação por token

✅ **Banco de Dados:**
- Tabela completa de submissions
- Índices para performance
- Row Level Security
- 15+ campos de informação

---

## 🚀 Últimos Passos - Setup Final

### **PASSO 1: Criar Conta Supabase (5 min)**

1. Acesse https://supabase.com
2. Clique "Start your project"
3. Faça login com GitHub
4. Autorize Supabase
5. Crie um novo projeto:
   - Nome: `apadrinhamento`
   - Senha: Salve em local seguro
   - Região: `South America (São Paulo)`
6. Aguarde criar (2-3 minutos)

### **PASSO 2: Criar Tabela no Supabase (3 min)**

1. No dashboard do Supabase:
   - Clique em **SQL Editor**
   - Clique em **New Query**
   - Copie e cole o SQL abaixo:

```sql
-- Criar tabela de submissões
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  modalidade VARCHAR(50) NOT NULL,
  servico_desc TEXT,
  nome VARCHAR(255) NOT NULL,
  rg VARCHAR(50) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  nascimento DATE NOT NULL,
  naturalidade VARCHAR(100),
  nacionalidade VARCHAR(100),
  profissao VARCHAR(100) NOT NULL,
  escolaridade VARCHAR(100),
  razao_social VARCHAR(255),
  cnpj VARCHAR(18),
  representante VARCHAR(255),
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2),
  tempo_residencia VARCHAR(100),
  celular VARCHAR(20) NOT NULL,
  telefone_alt VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  horario_contato VARCHAR(50),
  estado_civil VARCHAR(50),
  conjuge_nome VARCHAR(255),
  conjuge_profissao VARCHAR(100),
  conjuge_idade INTEGER,
  conjuge_ciente VARCHAR(10),
  qtd_moradores VARCHAR(50),
  tem_criancas VARCHAR(10),
  composicao_familiar TEXT NOT NULL,
  substancia_psicoativa VARCHAR(10),
  motivacao TEXT NOT NULL,
  experiencia_previa VARCHAR(100),
  faixa_etaria TEXT,
  sexo_preferencia VARCHAR(50),
  necessidades_especiais VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending_review',
  submitted_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_submissions_email ON submissions(email);
CREATE INDEX idx_submissions_cpf ON submissions(cpf);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);

-- Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
```

2. Clique em **Run**

### **PASSO 3: Obter Credenciais (2 min)**

1. No Supabase, vá para **Settings** → **API**
2. Copie:
   - **Project URL** → Será `SUPABASE_URL`
   - **Service Role Secret** → Será `SUPABASE_SERVICE_ROLE_KEY`
3. **Guarde com segurança!**

### **PASSO 4: Deploy no Vercel (3 min)**

1. Acesse https://vercel.com
2. Faça login com GitHub
3. Clique em **Add New** → **Project**
4. Selecione o repositório `apadrinhamento`
5. Configure:
   - **Framework**: Other
   - **Root Directory**: (deixar vazio)
6. Clique em **Environment Variables** e adicione:
   ```
   SUPABASE_URL = [valor do passo 3]
   SUPABASE_SERVICE_ROLE_KEY = [valor do passo 3]
   ADMIN_TOKEN = seu-token-admin-seguro
   SMTP_HOST = smtp.gmail.com (opcional)
   SMTP_PORT = 587 (opcional)
   SMTP_USER = seu-email@gmail.com (opcional)
   SMTP_PASSWORD = sua-senha-app (opcional)
   NOTIFICATION_EMAIL = admin@example.com (opcional)
   ```
7. Clique em **Deploy**
8. Aguarde (2-3 minutos)
9. Copie a URL do projeto (ex: `https://seu-projeto.vercel.app`)

### **PASSO 5: Configurar GitHub Pages (1 min)**

1. No repositório GitHub, vá para **Settings** → **Pages**
2. Em "Build and deployment":
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)**
3. Clique em **Save**

### **PASSO 6: Atualizar o Formulário (2 min)**

1. Abra o arquivo `README.md` (é o formulário HTML)
2. Vá para o final do arquivo, antes de `</body>`
3. Adicione:

```html
<script>
  // Defina com a URL do seu projeto Vercel
  window.API_ENDPOINT = 'https://seu-projeto.vercel.app/api/submissions';
</script>
<script src="scripts/form-submission.js"></script>
```

4. Commit e push:
```bash
git add README.md
git commit -m "feat: integrate backend API to form submission"
git push origin main
```

### **PASSO 7: Configurar Email (5 min - Opcional mas Recomendado)**

Para receber notificações por email:

1. **Se usar Gmail:**
   - Ative 2FA: https://myaccount.google.com/security
   - Vá para: https://myaccount.google.com/apppasswords
   - Selecione "Mail" e "Windows Computer"
   - Copie a senha gerada
   - No Vercel:
     - `SMTP_USER` = seu-email@gmail.com
     - `SMTP_PASSWORD` = senha-gerada
     - `NOTIFICATION_EMAIL` = seu-email@gmail.com

2. **Se usar outro serviço:**
   - SendGrid: https://sendgrid.com
   - Mailgun: https://mailgun.com
   - Postmark: https://postmarkapp.com

---

## ✅ Testar o Sistema

### **1. Testar Formulário**

1. Acesse seu formulário:
   ```
   https://apadrinhamentoleme-collab.github.io/
   ```
2. Preencha e envie
3. Verifique se aparece a mensagem de sucesso
4. Verifique o email de confirmação

### **2. Testar Dashboard**

1. Acesse:
   ```
   https://apadrinhamentoleme-collab.github.io/dashboard.html
   ```
2. Digite o token: `seu-token-admin-seguro`
3. Veja a inscrição que você fez
4. Teste os filtros
5. Exporte CSV

### **3. Testar Health Check**

```bash
curl https://seu-projeto.vercel.app/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## 🔒 Segurança - Importante!

### Antes de colocar em produção:

- [ ] **Mude o `ADMIN_TOKEN`** em Vercel
- [ ] **Mude a `DATABASE_PASSWORD`** do Supabase
- [ ] **Ative HTTPS** (Vercel faz automaticamente)
- [ ] **Configure Row Level Security** no Supabase
- [ ] **Adicione Rate Limiting** em produção
- [ ] **Use email real** para notificações
- [ ] **Faça backup** das dados regularmente

---

## 📊 Monitorar em Produção

### Verificar Logs do Vercel:

1. Acesse https://vercel.com
2. Selecione o projeto `apadrinhamento`
3. Clique em **Logs** → **Function Logs**
4. Acompanhe erros em tempo real

### Verificar Dados no Supabase:

1. Acesse https://supabase.com
2. Selecione seu projeto
3. Clique em **Table Editor**
4. Veja todas as inscrições

### Criar Backups:

1. No Supabase, vá para **Settings** → **Backups**
2. Configure backups automáticos
3. Configure Point-in-Time Recovery

---

## 🐛 Troubleshooting

### Erro: "Connection refused"
```
Solução:
- Verifique SUPABASE_URL em Vercel
- Verifique SUPABASE_SERVICE_ROLE_KEY
- Teste a conexão em https://supabase.com
```

### Erro: "CORS error"
```
Solução:
- Verifique se o domínio está na whitelist
- Em api/submissions.js, adicione seu domínio
- Teste com curl primeiro
```

### Email não chega
```
Solução:
- Verifique credenciais SMTP
- Tente com Gmail primeiro
- Verifique pasta de spam
- Aumente limite de taxa (rate limit)
```

### CPF duplicado
```
Solução:
- Normal! Significa duplicação de inscrição
- Retorna erro 409
- Verifique no dashboard
```

---

## 📱 URLs Finais

Depois de configurar tudo:

- **Formulário**: `https://apadrinhamentoleme-collab.github.io/`
- **Dashboard**: `https://apadrinhamentoleme-collab.github.io/dashboard.html`
- **API Base**: `https://seu-projeto.vercel.app`
- **Health Check**: `https://seu-projeto.vercel.app/api/health`

---

## 📞 Suporte

Para dúvidas:
- 📖 [Docs Supabase](https://supabase.com/docs)
- 📖 [Docs Vercel](https://vercel.com/docs)
- 🐛 [Issues GitHub](https://github.com/apadrinhamentoleme-collab/apadrinhamento/issues)
- 💬 [Discussions GitHub](https://github.com/apadrinhamentoleme-collab/apadrinhamento/discussions)

---

## 🎉 Parabéns!

Você agora tem um sistema profissional e completo para gerenciar inscrições do Projeto de Apadrinhamento!

**Próximos passos recomendados:**
1. Configurar domínio customizado (opcional)
2. Adicionar recaptcha (proteção contra bots)
3. Configurar CI/CD automático
4. Backup semanal dos dados
5. Monitoramento de performance

