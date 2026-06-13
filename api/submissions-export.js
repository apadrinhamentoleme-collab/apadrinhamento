import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const verifyAdminToken = (token) => {
  const validToken = process.env.ADMIN_TOKEN || 'admin-token-change-me';
  return token === validToken;
};

const convertToCSV = (data) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Colunas a exportar
  const columns = [
    'id',
    'nome',
    'cpf',
    'email',
    'celular',
    'modalidade',
    'profissao',
    'cidade',
    'estado',
    'estado_civil',
    'qtd_moradores',
    'motivacao',
    'faixa_etaria',
    'status',
    'submitted_at'
  ];

  // Header
  const header = columns.map(col => `"${col}"`).join(',');

  // Rows
  const rows = data.map(row => {
    return columns.map(col => {
      let value = row[col] || '';
      
      // Converter arrays em string
      if (Array.isArray(value)) {
        value = value.join('; ');
      }
      
      // Escape quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
      }
      
      return `"${value}"`;
    }).join(',');
  });

  return [header, ...rows].join('\n');
};

export default async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Verificar token de autenticação
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');

    if (!verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Parâmetros de query
    const { modalidade, status, startDate, endDate } = req.query;

    let query = supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    // Filtrar por modalidade
    if (modalidade && modalidade !== 'all') {
      query = query.eq('modalidade', modalidade);
    }

    // Filtrar por status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filtrar por data
    if (startDate) {
      query = query.gte('submitted_at', startDate);
    }
    if (endDate) {
      query = query.lte('submitted_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao exportar:', error);
      return res.status(500).json({ error: 'Erro ao exportar dados' });
    }

    // Converter para CSV
    const csv = convertToCSV(data);

    // Retornar como arquivo
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="apadrinhamento-inscricoes-${new Date().toISOString().split('T')[0]}.csv"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));

    return res.status(200).send(csv);

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
};
