import nodemailer from 'nodemailer';

let transporter = null;

const initTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  return transporter;
};

export const sendAdminNotification = async (submissionData) => {
  if (!process.env.NOTIFICATION_EMAIL || !process.env.SMTP_USER) {
    console.log('Email notifications not configured');
    return;
  }

  try {
    const transporter = initTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3C3489; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; color: #3C3489; border-bottom: 2px solid #3C3489; padding-bottom: 10px; margin-bottom: 10px; }
          .field { margin-bottom: 8px; }
          .label { font-weight: bold; color: #534AB7; }
          .footer { background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; text-align: center; margin-top: 30px; }
          .button { display: inline-block; background: #3C3489; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎉 Nova Inscrição Recebida</h2>
            <p>Projeto de Apadrinhamento - Comarca de Leme/SP</p>
          </div>

          <div class="section">
            <div class="section-title">📋 Informações Gerais</div>
            <div class="field"><span class="label">Nome:</span> ${submissionData.nome || 'N/A'}</div>
            <div class="field"><span class="label">Email:</span> ${submissionData.email || 'N/A'}</div>
            <div class="field"><span class="label">Telefone:</span> ${submissionData.celular || 'N/A'}</div>
            <div class="field"><span class="label">Modalidade:</span> ${formatModalidade(submissionData.modalidade)}</div>
          </div>

          <div class="section">
            <div class="section-title">👤 Identificação</div>
            <div class="field"><span class="label">CPF:</span> ${submissionData.cpf || 'N/A'}</div>
            <div class="field"><span class="label">Data de Nascimento:</span> ${formatDate(submissionData.nascimento)}</div>
            <div class="field"><span class="label">Profissão:</span> ${submissionData.profissao || 'N/A'}</div>
            <div class="field"><span class="label">Nacionalidade:</span> ${submissionData.nacionalidade || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">📍 Endereço</div>
            <div class="field">${submissionData.logradouro || ''}, ${submissionData.numero || ''} ${submissionData.complemento ? '- ' + submissionData.complemento : ''}</div>
            <div class="field">${submissionData.bairro || ''}, ${submissionData.cep || ''}</div>
            <div class="field">${submissionData.cidade || ''}, ${submissionData.estado || 'SP'}</div>
          </div>

          <div class="section">
            <div class="section-title">👨‍👩‍👧 Situação Familiar</div>
            <div class="field"><span class="label">Estado Civil:</span> ${submissionData.estado_civil || 'N/A'}</div>
            <div class="field"><span class="label">Moradores:</span> ${submissionData.qtd_moradores || 'N/A'}</div>
            <div class="field"><span class="label">Há crianças na residência:</span> ${submissionData.tem_criancas || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">💭 Motivação</div>
            <div class="field">${submissionData.motivacao ? truncateText(submissionData.motivacao, 300) : 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">📊 Status</div>
            <div class="field"><span class="label">Data de Submissão:</span> ${formatDateTime(submissionData.submitted_at)}</div>
            <div class="field"><span class="label">Status:</span> Pendente de Revisão</div>
          </div>

          <center>
            <a href="https://supabase.com" class="button">Ver no Dashboard Supabase</a>
          </center>

          <div class="footer">
            <p>Esta é uma mensagem automática do sistema de inscrição do Projeto de Apadrinhamento.</p>
            <p>Não responda este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Apadrinhamento Leme" <${process.env.SMTP_USER}>`,
      to: process.env.NOTIFICATION_EMAIL,
      subject: `[Nova Inscrição] ${submissionData.nome} - ${formatModalidade(submissionData.modalidade)}`,
      html: htmlContent,
      replyTo: submissionData.email
    });

    console.log(`Email de notificação enviado para ${process.env.NOTIFICATION_EMAIL}`);
  } catch (error) {
    console.error('Erro ao enviar email de notificação:', error);
    // Não falha a submissão se o email não for enviado
  }
};

export const sendCandidateConfirmation = async (submissionData) => {
  if (!process.env.SMTP_USER) {
    console.log('Email notifications not configured');
    return;
  }

  try {
    const transporter = initTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3C3489; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .content { line-height: 1.6; }
          .footer { background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Inscrição Confirmada</h2>
            <p>Projeto de Apadrinhamento - Comarca de Leme/SP</p>
          </div>

          <div class="content">
            <p>Olá <strong>${submissionData.nome}</strong>,</p>

            <p>Agradecemos sua inscrição no Projeto de Apadrinhamento! Recebemos com sucesso sua ficha de pré-inscrição.</p>

            <h3>📋 Próximos Passos:</h3>
            <ol>
              <li>Sua inscrição será analisada pela equipe técnica da entidade</li>
              <li>Você será contatado no telefone <strong>${submissionData.celular}</strong> para agendamento de entrevista</li>
              <li>O processo de aprovação leva aproximadamente 30 dias úteis</li>
            </ol>

            <h3>📞 Dúvidas?</h3>
            <p>Se tiver dúvidas sobre o andamento de sua inscrição, entre em contato:</p>
            <ul>
              <li>Email: ${process.env.NOTIFICATION_EMAIL || 'apadrinhamento@comarca.sp.gov.br'}</li>
              <li>Telefone: (19) 3571-1234</li>
            </ul>

            <h3>⚖️ Referências Legais:</h3>
            <p>Este programa segue a <strong>Portaria Conjunta nº 01/2025</strong> e o <strong>Provimento CG 36/2024</strong>.</p>
          </div>

          <div class="footer">
            <p><strong>Dados da Inscrição:</strong></p>
            <p>Data: ${formatDateTime(submissionData.submitted_at)}<br>
            Modalidade: ${formatModalidade(submissionData.modalidade)}</p>
            <p>Esta é uma mensagem automática. Não responda este email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"Apadrinhamento Leme" <${process.env.SMTP_USER}>`,
      to: submissionData.email,
      subject: '✅ Sua inscrição foi recebida com sucesso!',
      html: htmlContent
    });

    console.log(`Email de confirmação enviado para ${submissionData.email}`);
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
  }
};

const formatModalidade = (mod) => {
  const map = {
    'afetivo': '💜 Apadrinhamento Afetivo',
    'financeiro': '💛 Apadrinhamento Financeiro',
    'servicos': '🤝 Prestação de Serviços Voluntários'
  };
  return map[mod] || mod;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('pt-BR');
};

const truncateText = (text, maxLength) => {
  if (!text) return 'N/A';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
