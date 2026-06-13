# Esquema do Banco de Dados

## Tabela: `submissions`

Armazena todas as fichas de pré-inscrição recebidas.

### Estrutura

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|----------|
| **id** | BIGSERIAL | ✅ | ID único da inscrição (chave primária) |
| **modalidade** | VARCHAR(50) | ✅ | Tipo: 'afetivo', 'financeiro', 'servicos' |
| **servico_desc** | TEXT | ❌ | Descrição do serviço (se modalidade = 'servicos') |
| **nome** | VARCHAR(255) | ✅ | Nome completo do candidato |
| **rg** | VARCHAR(50) | ✅ | RG com órgão emissor |
| **cpf** | VARCHAR(14) | ✅ | CPF (formato: 000.000.000-00) |
| **nascimento** | DATE | ✅ | Data de nascimento |
| **naturalidade** | VARCHAR(100) | ❌ | Cidade/Estado de nascimento |
| **nacionalidade** | VARCHAR(100) | ✅ | Nacionalidade |
| **profissao** | VARCHAR(100) | ✅ | Profissão/Ocupação atual |
| **escolaridade** | VARCHAR(100) | ❌ | Nível de escolaridade |
| **razao_social** | VARCHAR(255) | ❌ | Razão social (pessoa jurídica) |
| **cnpj** | VARCHAR(18) | ❌ | CNPJ da empresa |
| **representante** | VARCHAR(255) | ❌ | Representante legal |
| **logradouro** | VARCHAR(255) | ✅ | Rua/Avenida |
| **numero** | VARCHAR(50) | ✅ | Número do endereço |
| **complemento** | VARCHAR(100) | ❌ | Complemento (apto, bloco) |
| **bairro** | VARCHAR(100) | ✅ | Bairro |
| **cep** | VARCHAR(10) | ✅ | CEP |
| **cidade** | VARCHAR(100) | ✅ | Cidade |
| **estado** | VARCHAR(2) | ❌ | UF (ex: SP, MG) |
| **tempo_residencia** | VARCHAR(100) | ❌ | Tempo de moradia no endereço |
| **celular** | VARCHAR(20) | ✅ | Telefone celular (WhatsApp) |
| **telefone_alt** | VARCHAR(20) | ❌ | Telefone alternativo |
| **email** | VARCHAR(255) | ✅ | Email |
| **horario_contato** | VARCHAR(50) | ✅ | Melhor horário para contato |
| **estado_civil** | VARCHAR(50) | ✅ | Estado civil |
| **conjuge_nome** | VARCHAR(255) | ❌ | Nome do cônjuge/companheiro |
| **conjuge_profissao** | VARCHAR(100) | ❌ | Profissão do cônjuge |
| **conjuge_idade** | INTEGER | ❌ | Idade do cônjuge |
| **conjuge_ciente** | VARCHAR(10) | ❌ | Cônjuge ciente da inscrição? |
| **qtd_moradores** | VARCHAR(50) | ✅ | Quantidade de moradores |
| **tem_criancas** | VARCHAR(10) | ❌ | Há crianças na residência? |
| **composicao_familiar** | TEXT | ✅ | Descrição dos membros da família |
| **substancia_psicoativa** | VARCHAR(10) | ✅ | Há dependência na residência? |
| **motivacao** | TEXT | ✅ | Motivação para o programa |
| **experiencia_previa** | VARCHAR(100) | ❌ | Experiência anterior com crianças |
| **faixa_etaria** | TEXT | ✅ | Faixas etárias preferidas (array JSON) |
| **sexo_preferencia** | VARCHAR(50) | ❌ | Preferência de sexo do apadrinhado |
| **necessidades_especiais** | VARCHAR(100) | ❌ | Aceita crianças com necessidades? |
| **status** | VARCHAR(20) | ✅ | Status: 'pending_review', 'approved', 'rejected' |
| **submitted_at** | TIMESTAMP | ✅ | Data/hora de envio |
| **ip_address** | VARCHAR(50) | ❌ | IP de origem |
| **created_at** | TIMESTAMP | ✅ | Data/hora de criação no BD |

### Índices

```sql
-- Para buscar por email
CREATE INDEX idx_submissions_email ON submissions(email);

-- Para validar duplicação de CPF
CREATE INDEX idx_submissions_cpf ON submissions(cpf);

-- Para filtrar por status
CREATE INDEX idx_submissions_status ON submissions(status);

-- Para ordenar por data
CREATE INDEX idx_submissions_created_at ON submissions(created_at);
```

### Restrições

```sql
-- CPF deve ser único
ALTER TABLE submissions ADD CONSTRAINT unique_cpf UNIQUE(cpf);

-- Email deve ser válido
ALTER TABLE submissions ADD CONSTRAINT check_email CHECK (email LIKE '%@%');

-- Status deve ser um dos valores válidos
ALTER TABLE submissions 
  ADD CONSTRAINT check_status 
  CHECK (status IN ('pending_review', 'approved', 'rejected'));
```

### Segurança (Row Level Security)

```sql
-- Apenas admins autenticados podem ler
CREATE POLICY "Only authenticated users can read"
  ON submissions
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Apenas sistema pode inserir
CREATE POLICY "Only API can insert"
  ON submissions
  FOR INSERT
  WITH CHECK (true);

-- Ninguém pode deletar (apenas staff admin)
CREATE POLICY "No one can delete"
  ON submissions
  FOR DELETE
  USING (false);
```

## Exemplo de Consultas SQL

### Contar inscrições por modalidade

```sql
SELECT modalidade, COUNT(*) as total
FROM submissions
GROUP BY modalidade
ORDER BY total DESC;
```

### Inscrições dos últimos 7 dias

```sql
SELECT id, nome, email, modalidade, submitted_at
FROM submissions
WHERE submitted_at >= NOW() - INTERVAL '7 days'
ORDER BY submitted_at DESC;
```

### Inscrições pendentes de revisão

```sql
SELECT nome, email, modalidade, submitted_at
FROM submissions
WHERE status = 'pending_review'
ORDER BY submitted_at ASC;
```

### CPFs já cadastrados (para validação)

```sql
SELECT cpf, nome, COUNT(*) as vezes
FROM submissions
GROUP BY cpf, nome
HAVING COUNT(*) > 1;
```

### Exportar para relatório

```sql
SELECT 
  nome, cpf, email, celular, modalidade, 
  profissao, cidade, submitted_at
FROM submissions
WHERE status = 'pending_review'
ORDER BY submitted_at DESC;
```
