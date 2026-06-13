import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const verifyAdminToken = (token) => {
  const validToken = process.env.ADMIN_TOKEN || 'admin-token-change-me';
  return token === validToken;
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
    const {
      limit = '50',
      offset = '0',
      modalidade,
      status,
      search
    } = req.query;

    const pageSize = Math.min(parseInt(limit), 100);
    const pageOffset = parseInt(offset);

    let query = supabase
      .from('submissions')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false });

    // Filtrar por modalidade
    if (modalidade && modalidade !== 'all') {
      query = query.eq('modalidade', modalidade);
    }

    // Filtrar por status
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Busca por nome ou email
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`nome.ilike.${searchTerm},email.ilike.${searchTerm},cpf.ilike.${searchTerm}`);
    }

    // Paginação
    query = query.range(pageOffset, pageOffset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar submissions:', error);
      return res.status(500).json({ error: 'Erro ao buscar inscrições' });
    }

    return res.status(200).json({
      data,
      total: count,
      limit: pageSize,
      offset: pageOffset,
      hasMore: (pageOffset + pageSize) < (count || 0)
    });

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ error: error.message });
  }
};
