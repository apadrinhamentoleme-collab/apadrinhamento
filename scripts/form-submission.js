// Script para submissão do formulário
// Este arquivo deve ser referenciado no HTML:
// <script src="scripts/form-submission.js"></script>

const API_ENDPOINT = window.API_ENDPOINT || process.env.VITE_API_URL || 'https://seu-projeto.vercel.app/api/submissions';

const collectFormData = () => {
  const form = document.getElementById('main-form');
  const formData = new FormData(form);
  const data = {};

  // Converter FormData para objeto
  for (let [key, value] of formData.entries()) {
    if (key === 'faixa_etaria') {
      if (!data[key]) data[key] = [];
      data[key].push(value);
    } else {
      data[key] = value;
    }
  }

  return data;
};

const validateSubmission = (data) => {
  const requiredFields = ['modalidade', 'nome', 'rg', 'cpf', 'nascimento', 'nacionalidade', 'profissao', 'logradouro', 'numero', 'bairro', 'cep', 'cidade', 'celular', 'email', 'horario_contato', 'estado_civil', 'qtd_moradores', 'composicao_familiar', 'substancia_psicoativa', 'motivacao', 'faixa_etaria'];

  const missing = requiredFields.filter(field => {
    const value = data[field];
    if (Array.isArray(value)) return value.length === 0;
    return !value || value.toString().trim() === '';
  });

  if (missing.length > 0) {
    throw new Error(`Por favor, preencha os campos obrigatórios: ${missing.join(', ')}`);
  }
};

const showErrorMessage = (message) => {
  // Criar elemento de erro se não existir
  let errorBox = document.getElementById('error-message');
  if (!errorBox) {
    errorBox = document.createElement('div');
    errorBox.id = 'error-message';
    errorBox.style.cssText = `
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 2rem;
      color: #721c24;
      font-size: 13px;
      line-height: 1.6;
    `;
    const mainWrap = document.querySelector('.main-wrap');
    mainWrap.insertBefore(errorBox, mainWrap.firstChild);
  }
  errorBox.innerHTML = `<strong>Erro:</strong> ${message}`;
  errorBox.style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const hideErrorMessage = () => {
  const errorBox = document.getElementById('error-message');
  if (errorBox) {
    errorBox.style.display = 'none';
  }
};

const submitForm = async (e) => {
  e.preventDefault();
  const submitBtn = document.querySelector('.submit-btn');
  const originalText = submitBtn.textContent;

  try {
    hideErrorMessage();

    // Coletar dados
    const data = collectFormData();

    // Validar
    validateSubmission(data);

    // Mostrar carregamento
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Enviar para API
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Erro ao enviar inscrição');
    }

    // Sucesso
    document.getElementById('main-form').style.display = 'none';
    document.querySelector('.progress-bar-wrap').style.display = 'none';
    document.getElementById('success-screen').style.display = 'block';

    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Log de sucesso
    console.log('Inscrição enviada com ID:', result.id);

  } catch (error) {
    console.error('Erro:', error);
    showErrorMessage(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
};

// Vincular ao formulário quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('main-form');
    if (form) {
      form.addEventListener('submit', submitForm);
    }
  });
} else {
  const form = document.getElementById('main-form');
  if (form) {
    form.addEventListener('submit', submitForm);
  }
}
