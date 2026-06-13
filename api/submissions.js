import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import { sendAdminNotification, sendCandidateConfirmation } from './notifications.js';

const corsHandler = cors({
  origin: ['https://apadrinhamentoleme-collab.github.io', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const runCors = (req, res) => {
  return new Promise((resolve, reject) => {
    corsHandler(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

const validateFormData = (data) => {
  const requiredFields = ['modalidade', 'nome', 'cpf', 'email', 'celular'];
  const missing = requiredFields.filter(field => !data[field]);
  
  if (missing.length > 0) {
    throw new Error(`Campos obrigatórios faltando: ${missing.join(', ')}`);
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    throw new Error('Email inválido');
  }

  // Validar CPF (formato básico)
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  if (!cpfRegex.test(data.cpf)) {
    throw new Error('CPF deve estar no formato: 000.000.000-00');
  }

  return true;
};

const sanitizeData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = value.trim().substring(0, 1000);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.slice(0, 20).map(v => 
        typeof v === 'string' ? v.trim().substring(0, 500) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export default async (req, res) => {
  // Handle CORS
  await runCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const formData = req.body;

    // Validar dados
    validateFormData(formData);

    // Sanitizar dados
    const sanitized = sanitizeData(formData);

    // Verificar se CPF já existe
    const { data: existingCPF } = await supabase
      .from('submissions')
      .select('id')
      .eq('cpf', sanitized.cpf)
      .limit(1);

    if (existingCPF && existingCPF.length > 0) {
      return res.status(409).json({ 
        error: 'Este CPF já possui uma inscrição registrada' 
      });
    }

    // Inserir no Supabase
    const { data, error } = await supabase
      .from('submissions')
      .insert([
        {
          ...sanitized,
          submitted_at: new Date().toISOString(),
          ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          status: 'pending_review'
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao inserir dados:', error);
      return res.status(500).json({ error: 'Erro ao salvar inscrição' });
    }

    // Enviar notificações (assíncronas - não falha se houver erro)
    const submittedData = data[0];
    Promise.all([
      sendAdminNotification(submittedData),
      sendCandidateConfirmation(submittedData)
    ]).catch(err => console.error('Erro ao enviar notificações:', err));

    // Sucesso
    return res.status(201).json({
      success: true,
      message: 'Inscrição recebida com sucesso!',
      id: submittedData.id,
      timestamp: submittedData.submitted_at
    });

  } catch (error) {
    console.error('Erro na submissão:', error.message);
    return res.status(400).json({
      error: error.message || 'Erro ao processar inscrição'
    });
  }
};
