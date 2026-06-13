import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async (req, res) => {
  // Simples health check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Testar conexão com Supabase
    const { data, error } = await supabase
      .from('submissions')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(503).json({ 
        status: 'degraded',
        message: 'Banco de dados indisponível',
        error: error.message 
      });
    }

    return res.status(200).json({ 
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'production'
    });

  } catch (error) {
    return res.status(503).json({ 
      status: 'error',
      message: error.message 
    });
  }
};
