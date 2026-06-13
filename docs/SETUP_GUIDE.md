# Guia de Configuração - Backend de Inscrições

## 📋 Visão Geral

Este sistema permite receber, validar e armazenar as fichas de pré-inscrição do Projeto de Apadrinhamento usando:
- **Vercel**: Para hospedar a API serverless (gratuito)
- **Supabase**: Para banco de dados PostgreSQL (gratuito)
- **GitHub**: Para controle de versão

## 🚀 Setup Passo a Passo

### Passo 1: Criar Conta no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project" → Sign up with GitHub
3. Autorize o Supabase em sua conta GitHub
4. Crie um novo projeto:
   - **Project Name**: `apadrinhamento`
   - **Database Password**: Salve em local seguro
   - **Region**: `South America (São Paulo)` para melhor latência
5. Aguarde o projeto ser criado (2-3 minutos)

### Passo 2: Criar Tabela no Supabase

1. No dashboard do Supabase, vá para **SQL Editor**
2. Clique em "New Query"
3. Cole o SQL abaixo:

```sql
-- Criar tabela de submissões
CREATE TABLE submissions (
  id BIGSERIAL PRIMARY KEY,
  -- Modalidade
  modalidade VARCHAR(50) NOT NULL,
  servico_desc TEXT,
  
  -- Identificação
  nome VARCHAR(255) NOT NULL,
  rg VARCHAR(50) NOT NULL,
  cpf VARCHAR(14) NOT NULL UNIQUE,
  nascimento DATE NOT NULL,
  naturalidade VARCHAR(100),
  nacionalidade VARCHAR(100),
  profissao VARCHAR(100) NOT NULL,
  escolaridade VARCHAR(100),
  
  -- Pessoa Jurídica (opcional)
  razao_social VARCHAR(255),
  cnpj VARCHAR(18),
  representante VARCHAR(255),
  
  -- Endereço
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(50) NOT NULL,
  complemento VARCHAR(100),
  bairro VARCHAR(100) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  estado VARCHAR(2),
  tempo_residencia VARCHAR(100),
  
  -- Contato
  celular VARCHAR(20) NOT NULL,
  telefone_alt VARCHAR(20),
  email VARCHAR(255) NOT NULL,
  horario_contato VARCHAR(50),
  
  -- Família
  estado_civil VARCHAR(50),
  conjuge_nome VARCHAR(255),
  conjuge_profissao VARCHAR(100),
  conjuge_idade INTEGER,
  conjuge_ciente VARCHAR(10),
  qtd_moradores VARCHAR(50),
  tem_criancas VARCHAR(10),
  composicao_familiar TEXT NOT NULL,
  substancia_psicoativa VARCHAR(10),
  
  -- Perfil
  motivacao TEXT NOT NULL,
  experiencia_previa VARCHAR(100),
  faixa_etaria TEXT,
  sexo_preferencia VARCHAR(50),
  necessidades_especiais VARCHAR(100),
  
  -- Metadados
  status VARCHAR(20) DEFAULT 'pending_review',
  submitted_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_submissions_email ON submissions(email);
CREATE INDEX idx_submissions_cpf ON submissions(cpf);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_created_at ON submissions(created_at);

-- Habilitar Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admin pode visualizar
CREATE POLICY "Only admins can view submissions"
  ON submissions
  FOR SELECT
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'email' = 'admin@example.com');
```

4. Clique em **Run** para executar

### Passo 3: Obter Credenciais do Supabase

1. No dashboard, vá para **Settings** → **API**
2. Copie:
   - **Project URL** → será `SUPABASE_URL`
   - **Service Role Secret** → será `SUPABASE_SERVICE_ROLE_KEY`
3. Guarde esses valores com segurança

### Passo 4: Configurar Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "Add New..." → "Project"
4. Selecione o repositório `apadrinhamento`
5. **Framework**: `Other` (ou deixe em branco)
6. **Root Directory**: deixe vazio (ou `.`)
7. Clique em **Environment Variables** e adicione:
   - `SUPABASE_URL` = valor copiado do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` = valor copiado do Supabase
8. Clique em **Deploy**

### Passo 5: Obter URL da API

1. Após deploy no Vercel, copie o URL do projeto (ex: `https://seu-projeto.vercel.app`)
2. A API estará em: `https://seu-projeto.vercel.app/api/submissions`
3. Adicione esta URL ao arquivo `.env` com a variável `VITE_API_URL`

### Passo 6: Atualizar o Formulário HTML

1. No arquivo `README.md`, antes da tag `</body>`, adicione:

```html
<script>
  // Defina a URL da API
  window.API_ENDPOINT = 'https://seu-projeto.vercel.app/api/submissions';
</script>
<script src="scripts/form-submission.js"></script>
```

2. Ou declare como variável de ambiente no seu build:
```javascript
VITE_API_URL=https://seu-projeto.vercel.app/api/submissions
```

## 🔐 Segurança

### Proteções Implementadas:

1. **CORS**: Apenas domínios autorizados podem enviar dados
2. **Validação**: Todos os campos são validados antes de salvar
3. **Sanitização**: Dados são limpos para prevenir injections
4. **Rate Limiting**: Implementar com Vercel Pro (opcional)
5. **Row Level Security**: Apenas admins autorizados podem visualizar dados

### Melhorias Recomendadas:

```javascript
// Adicione rate limiting em api/submissions.js:
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5 // 5 requisições por IP
});
```

## 📊 Visualizar Inscrições

### No Dashboard do Supabase:

1. Acesse [supabase.com](https://supabase.com)
2. Vá para seu projeto
3. Clique em **Table Editor**
4. Selecione a tabela `submissions`
5. Veja todas as inscrições recebidas

### Exportar para CSV:

1. No Table Editor, clique em **Download as CSV**
2. Abra no Excel ou Google Sheets

## 📧 Notificações por Email (Opcional)

Para receber email quando alguém se inscrever:

### Opção 1: Usando Supabase Webhooks

1. No Supabase, vá para **Database** → **Webhooks**
2. Clique em "Create a new webhook"
3. Configure:
   - **Table**: `submissions`
   - **Events**: `Insert`
   - **Webhook URL**: sua URL de webhook

### Opção 2: Usando SendGrid/Mailgun

Adicione ao `api/submissions.js`:

```javascript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendNotification = async (data) => {
  await sgMail.send({
    to: process.env.NOTIFICATION_EMAIL,
    from: 'noreply@apadrinhamento.com.br',
    subject: `Nova inscrição recebida: ${data.nome}`,
    html: `
      <h2>Nova Inscrição - ${data.modalidade}</h2>
      <p><strong>Nome:</strong> ${data.nome}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Telefone:</strong> ${data.celular}</p>
      <p><a href="https://supabase.com">Ver no Dashboard</a></p>
    `
  });
};
```

## 🐛 Troubleshooting

### Erro: "Falha ao conectar com Supabase"
- Verifique se `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` estão corretos
- Confirme que a tabela foi criada no Supabase

### Erro: "CORS error"
- Verifique se o domínio está na whitelist em `api/submissions.js`
- Adicione o domínio na variável `origin`

### Erro: "CPF já existe"
- Um CPF já foi cadastrado anteriormente
- Verifique se os dados estão corretos

### Inscrição não aparece
- Verifique se o status é "pending_review" (não "rejected")
- Atualize a página do Supabase
- Verifique se há regras RLS bloqueando a visualização

## 📱 Testar Localmente

```bash
# Instalar dependências
npm install

# Criar arquivo .env com credenciais
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# Executar em desenvolvimento
npm run dev

# A API estará em http://localhost:3000/api/submissions
```

## 📞 Suporte

Para dúvidas:
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Issues no GitHub](https://github.com/apadrinhamentoleme-collab/apadrinhamento/issues)
