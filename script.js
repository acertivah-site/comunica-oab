const STORAGE_KEY = 'oab_solicitacao_arte_draft';
const totalSteps = 7;
let currentStep = 1;
let siteData = null;
let formContent = null;

const modal = document.getElementById('project-modal');
const openButtons = document.querySelectorAll('[data-open-project]');
const closeButton = document.querySelector('.modal-close');
const steps = [...document.querySelectorAll('.form-step')];
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const prevBtn = document.getElementById('prev-step');
const nextBtn = document.getElementById('next-step');
const submitBtn = document.getElementById('submit-step');
const feedback = document.getElementById('form-feedback');
const form = document.getElementById('project-form');
const reviewBox = document.getElementById('review-box');
const approvalGate = document.getElementById('approval-gate');
const approvalChoices = [...document.querySelectorAll('[data-approval]')];
const approvalResult = document.getElementById('approval-result');
const formProgress = document.getElementById('form-progress');

function $(id) { return document.getElementById(id); }
function text(id, value) { const el = $(id); if (el && value !== undefined) el.textContent = value; }
function htmlEscape(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function nl(value = '') { return htmlEscape(value).replace(/\n/g, '<br>'); }

async function loadContent() {
  const [siteRes, formRes] = await Promise.all([
    fetch('content/site.json'),
    fetch('content/form.json')
  ]);
  siteData = await siteRes.json();
  formContent = await formRes.json();
  applySiteContent();
  applyFormContent();
  loadDraft();
  updateStep();
}

function applySiteContent() {
  if (!siteData) return;
  document.title = siteData.meta_title || document.title;
  $('meta-description').setAttribute('content', siteData.meta_description || '');

  text('brand-name', siteData.brand_name);
  text('brand-subtitle', siteData.brand_subtitle);
  text('page-title', siteData.meta_title);
  text('footer-title', siteData.footer?.title);
  text('footer-description', siteData.footer?.description);

  const logo = $('brand-logo');
  if (siteData.logo) {
    logo.src = siteData.logo;
    logo.hidden = false;
  } else {
    logo.hidden = true;
  }

  text('hero-eyebrow', siteData.hero?.eyebrow);
  text('hero-title', siteData.hero?.title);
  text('hero-description', siteData.hero?.description);
  text('hero-primary-button', siteData.hero?.primary_button);
  text('hero-secondary-button', siteData.hero?.secondary_button);
  text('hero-card-label', siteData.hero?.card_label);
  text('hero-card-title', siteData.hero?.card_title);
  text('hero-card-description', siteData.hero?.card_description);

  text('cards-eyebrow', siteData.cards_section?.eyebrow);
  text('cards-title', siteData.cards_section?.title);
  text('cards-description', siteData.cards_section?.description);

  text('flow-eyebrow', siteData.flow_section?.eyebrow);
  text('flow-title', siteData.flow_section?.title);
  text('flow-description', siteData.flow_section?.description);

  text('cta-eyebrow', siteData.cta?.eyebrow);
  text('cta-title', siteData.cta?.title);
  text('cta-button', siteData.cta?.button);

  renderInfoCards(siteData.info_cards || []);
  renderFlowSteps(siteData.flow_steps || []);
}

function renderInfoCards(cards) {
  const grid = $('info-grid');
  grid.innerHTML = cards.map(card => `
    <article class="info-card">
      <span>${htmlEscape(card.icon || '')}</span>
      <h3>${htmlEscape(card.title || '')}</h3>
      <p>${htmlEscape(card.description || '')}</p>
    </article>
  `).join('');
}

function renderFlowSteps(steps) {
  const list = $('flow-list');
  list.innerHTML = steps.map((item, index) => `
    <li>
      <div class="flow-index">${String(index + 1).padStart(2, '0')}</div>
      <div>
        <h3>${htmlEscape(item.title || '')}</h3>
        <p>${htmlEscape(item.description || '')}</p>
      </div>
    </li>
  `).join('');
}

function applyFormContent() {
  if (!formContent) return;
  text('modal-eyebrow', formContent.modal?.eyebrow);
  text('project-title', formContent.modal?.title);
  setApprovalGate();

  setStep1(); setStep2(); setStep3(); setStep4(); setStep5(); setStep6(); setStep7(); setButtons();
}

function setPlaceholder(name, value) { const el = form.elements[name]; if (el && value !== undefined) el.placeholder = value; }
function setLabel(id, value) { text(id, value); }

function setApprovalGate() {
  const a = formContent.approval_gate || {};
  text('approval-kicker', a.kicker || 'Confirmação inicial');
  text('approval-question', a.question || 'Essa solicitação de arte já foi aprovada pela Presidência?');
  text('approval-description', a.description || 'Selecione uma opção para continuar.');
  text('approval-yes', a.yes_label || 'Sim');
  text('approval-no', a.no_label || 'Não');
}

function setStep1() {
  const s = formContent.step1 || {};
  text('step1-title', s.title); text('step1-description', s.description);
  setLabel('step1-nome-label', s.nome_label); setPlaceholder('nome', s.nome_placeholder);
  setLabel('step1-setor-label', s.setor_label); setPlaceholder('setor', s.setor_placeholder);
  setLabel('step1-whatsapp-label', s.whatsapp_label); setPlaceholder('whatsapp', s.whatsapp_placeholder);
}
function fillSelect(el, placeholder, options) {
  el.innerHTML = '';
  const first = document.createElement('option');
  first.value = ''; first.textContent = placeholder || 'Selecione';
  el.appendChild(first);
  (options || []).forEach(option => {
    const op = document.createElement('option');
    op.value = option; op.textContent = option;
    el.appendChild(op);
  });
}
function setStep2() {
  const s = formContent.step2 || {};
  text('step2-title', s.title); text('step2-description', s.description);
  setLabel('step2-projeto-label', s.projeto_label); setPlaceholder('projeto', s.projeto_placeholder);
  setLabel('step2-tipo-label', s.tipo_label); fillSelect($('tipo-select'), s.tipo_placeholder, s.tipo_options);
  setLabel('step2-canal-label', s.canal_label); fillSelect($('canal-select'), s.canal_placeholder, s.canal_options);
  setLabel('step2-objetivo-label', s.objetivo_label); setPlaceholder('objetivo', s.objetivo_placeholder);
  setLabel('step2-publico-label', s.publico_label); setPlaceholder('publico', s.publico_placeholder);
}
function setStep3() {
  const s = formContent.step3 || {};
  text('step3-title', s.title); text('step3-description', s.description);
  setLabel('step3-texto-label', s.texto_label); setPlaceholder('texto', s.texto_placeholder);
  setLabel('step3-texto-pendente-label', s.texto_pendente_label);
  setLabel('step3-obrigatorias-label', s.obrigatorias_label); setPlaceholder('obrigatorias', s.obrigatorias_placeholder);
  setLabel('step3-destaque-label', s.destaque_label); setPlaceholder('destaque', s.destaque_placeholder);
}
function setStep4() {
  const s = formContent.step4 || {};
  text('step4-title', s.title); text('step4-description', s.description);
  text('step4-style-legend', s.style_legend);
  text('step4-colors-legend', s.colors_legend);
  setLabel('step4-evitar-label', s.evitar_label); setPlaceholder('evitar', s.evitar_placeholder);

  const styleWrap = $('style-options');
  styleWrap.innerHTML = (s.style_options || []).map((item, idx) => `
    <label class="chip-option">
      <input type="checkbox" name="estilo" value="${htmlEscape(item)}" />
      <span>${htmlEscape(item)}</span>
    </label>
  `).join('');

  const colorWrap = $('color-options');
  colorWrap.innerHTML = (s.color_options || []).map((item, idx) => `
    <label class="color-option">
      <input type="checkbox" name="cores" value="${htmlEscape(item.value)}" />
      <span><i class="swatch-${htmlEscape(item.swatch)}"></i>${htmlEscape(item.label)}</span>
    </label>
  `).join('');

  styleWrap.querySelectorAll('input[name="estilo"]').forEach(input => input.addEventListener('change', enforceStyleLimit));
}
function setStep5() {
  const s = formContent.step5 || {};
  text('step5-title', s.title); text('step5-description', s.description);
  setLabel('step5-referencia-link-label', s.referencia_link_label); setPlaceholder('referencia_link', s.referencia_link_placeholder);
  setLabel('step5-referencia-obs-label', s.referencia_obs_label); setPlaceholder('referencia_obs', s.referencia_obs_placeholder);
  text('step5-note', s.note);
}
function setStep6() {
  const s = formContent.step6 || {};
  text('step6-title', s.title); text('step6-description', s.description);
  setLabel('step6-prazo-label', s.prazo_label);
  setLabel('step6-data-critica-label', s.data_critica_label); setPlaceholder('data_critica', s.data_critica_placeholder);
  setLabel('step6-observacoes-label', s.observacoes_label); setPlaceholder('observacoes', s.observacoes_placeholder);
}
function setStep7() {
  const s = formContent.step7 || {};
  text('step7-title', s.title); text('step7-description', s.description);
  text('step7-confirmation', s.confirmation);
}
function setButtons() {
  const b = formContent.buttons || {};
  prevBtn.textContent = b.back || 'Voltar';
  nextBtn.textContent = b.next || 'Continuar';
  submitBtn.textContent = b.submit || 'Enviar pelo WhatsApp';
}

function resetApprovalGate() {
  approvalGate.hidden = false;
  formProgress.hidden = true;
  form.hidden = true;
  approvalResult.hidden = true;
  approvalResult.classList.remove('blocked', 'allowed');
  approvalChoices.forEach(btn => btn.classList.remove('selected'));
  feedback.textContent = '';
  currentStep = 1;
  updateStep();
}

function handleApprovalAnswer(answer, button) {
  approvalChoices.forEach(btn => btn.classList.toggle('selected', btn === button));
  const a = formContent.approval_gate || {};

  if (answer === 'no') {
    formProgress.hidden = true;
    form.hidden = true;
    approvalResult.hidden = false;
    approvalResult.classList.remove('allowed');
    approvalResult.classList.add('blocked');
    text('approval-result-title', a.blocked_title || 'Solicitação ainda não aprovada');
    text('approval-result-message', a.blocked_message || 'Esta solicitação precisa ser aprovada pela Presidência antes de continuar.');
    return;
  }

  approvalResult.hidden = false;
  approvalResult.classList.remove('blocked');
  approvalResult.classList.add('allowed');
  text('approval-result-title', 'Pode continuar');
  text('approval-result-message', a.allowed_message || 'Como a solicitação já foi aprovada, você pode continuar.');
  approvalGate.hidden = true;
  formProgress.hidden = false;
  form.hidden = false;
  currentStep = 1;
  updateStep();
}

approvalChoices.forEach(button => {
  button.addEventListener('click', () => handleApprovalAnswer(button.dataset.approval, button));
});

function openModal() {
  resetApprovalGate();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
openButtons.forEach(btn => btn.addEventListener('click', openModal));
closeButton.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(); });

function updateStep() {
  steps.forEach(step => step.classList.toggle('active', Number(step.dataset.step) === currentStep));
  const progress = (currentStep / totalSteps) * 100;
  progressBar.style.width = `${progress}%`;
  progressText.textContent = `Etapa ${currentStep} de ${totalSteps}`;
  prevBtn.hidden = currentStep === 1;
  nextBtn.hidden = currentStep === totalSteps;
  submitBtn.hidden = currentStep !== totalSteps;
  if (currentStep === 7) renderReview();
}

function getStepFields(step) {
  const map = {
    1: ['nome', 'setor', 'whatsapp'],
    2: ['projeto', 'tipo', 'canal', 'objetivo'],
    3: [],
    4: [],
    5: [],
    6: ['prazo'],
    7: ['confirmacao']
  };
  return map[step] || [];
}

function validateStep(step) {
  feedback.textContent = '';
  if (step === 4) {
    const styles = [...form.querySelectorAll('input[name="estilo"]:checked')];
    if (styles.length > 4) {
      feedback.textContent = formContent.messages?.style_limit || 'Escolha no máximo 4 características.';
      return false;
    }
  }

  const fields = getStepFields(step);
  for (const name of fields) {
    const field = form.elements[name];
    if (!field) continue;
    if (field.type === 'checkbox') {
      if (!field.checked) {
        feedback.textContent = formContent.messages?.required_error || 'Preencha os campos obrigatórios para continuar.';
        return false;
      }
    } else if (!field.value.trim()) {
      feedback.textContent = formContent.messages?.required_error || 'Preencha os campos obrigatórios para continuar.';
      field.focus();
      return false;
    }
  }
  return true;
}

function enforceStyleLimit() {
  const checked = [...form.querySelectorAll('input[name="estilo"]:checked')];
  if (checked.length > 4) {
    this.checked = false;
    feedback.textContent = formContent.messages?.style_limit || 'Escolha no máximo 4 características.';
  } else {
    feedback.textContent = '';
  }
}

nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  currentStep = Math.min(currentStep + 1, totalSteps);
  updateStep();
  saveDraft();
});
prevBtn.addEventListener('click', () => {
  feedback.textContent = '';
  currentStep = Math.max(currentStep - 1, 1);
  updateStep();
  saveDraft();
});

function getCheckboxValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}
function value(name) {
  const field = form.elements[name];
  if (!field) return '';
  if (field.type === 'checkbox') return field.checked ? 'Sim' : 'Não';
  return field.value.trim();
}

function renderReview() {
  const chunks = [
    ['Solicitante', `Nome: ${value('nome')}\nComissão/setor: ${value('setor')}\nWhatsApp: ${value('whatsapp')}`],
    ['Sobre a arte', `Projeto: ${value('projeto')}\nTipo: ${value('tipo')}\nCanal: ${value('canal')}\nObjetivo: ${value('objetivo')}\nPúblico: ${value('publico') || 'Não informado'}`],
    ['Conteúdo', `Texto da arte: ${value('texto') || (form.elements['texto_pendente'].checked ? 'Ainda não definido' : 'Não informado')}\nInformações obrigatórias: ${value('obrigatorias') || 'Não informado'}\nDestaque principal: ${value('destaque') || 'Não informado'}`],
    ['Direção visual', `Estilo: ${getCheckboxValues('estilo').join(', ') || 'Não informado'}\nCores: ${getCheckboxValues('cores').join(', ') || 'Não informado'}\nEvitar: ${value('evitar') || 'Não informado'}`],
    ['Referência', `Link: ${value('referencia_link') || 'Não informado'}\nObservações: ${value('referencia_obs') || 'Não informado'}`],
    ['Prazo', `Data desejada: ${value('prazo')}\nData do evento/publicação: ${value('data_critica') || 'Não informado'}\nObservações finais: ${value('observacoes') || 'Não informado'}`]
  ];

  reviewBox.innerHTML = chunks.map(([title, body]) => `
    <div class="review-item">
      <h4>${htmlEscape(title)}</h4>
      <p>${nl(body)}</p>
    </div>
  `).join('');
}

function formatWhatsAppMessage() {
  const lines = [
    '🎨 *NOVA SOLICITAÇÃO DE ARTE — OAB GUARAPUAVA*',
    '',
    '*SOLICITANTE*',
    `Nome: ${value('nome')}`,
    `Comissão/diretoria/setor: ${value('setor')}`,
    `WhatsApp: ${value('whatsapp')}`,
    '',
    '*SOBRE A ARTE*',
    `Projeto: ${value('projeto')}`,
    `Tipo: ${value('tipo')}`,
    `Canal de uso: ${value('canal')}`,
    `Objetivo: ${value('objetivo')}`,
    `Público: ${value('publico') || 'Não informado'}`,
    '',
    '*CONTEÚDO*',
    `Texto da arte: ${value('texto') || (form.elements['texto_pendente'].checked ? 'Ainda não definido' : 'Não informado')}`,
    `Informações obrigatórias: ${value('obrigatorias') || 'Não informado'}`,
    `Destaque principal: ${value('destaque') || 'Não informado'}`,
    '',
    '*DIREÇÃO VISUAL*',
    `Características: ${getCheckboxValues('estilo').join(', ') || 'Não informado'}`,
    `Cores desejadas: ${getCheckboxValues('cores').join(', ') || 'Não informado'}`,
    `Evitar: ${value('evitar') || 'Não informado'}`,
    '',
    '*REFERÊNCIA*',
    `Link: ${value('referencia_link') || 'Não informado'}`,
    `Observações sobre a referência: ${value('referencia_obs') || 'Não informado'}`,
    '',
    '*PRAZO*',
    `Data desejada: ${value('prazo')}`,
    `Data do evento/publicação: ${value('data_critica') || 'Não informado'}`,
    `Observações finais: ${value('observacoes') || 'Não informado'}`
  ];
  return lines.join('\n');
}

function getWhatsAppLink() {
  const number = (siteData?.whatsapp_number || '').replace(/\D/g, '');
  const text = encodeURIComponent(formatWhatsAppMessage());
  return `https://wa.me/${number}?text=${text}`;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateStep(currentStep)) return;
  if (!siteData?.whatsapp_number) {
    feedback.textContent = 'Defina o número do WhatsApp no CMS antes de publicar o formulário.';
    return;
  }
  const url = getWhatsAppLink();
  window.open(url, '_blank');
  feedback.textContent = formContent.messages?.success || 'Solicitação pronta para envio no WhatsApp.';
  saveDraft();
});

function saveDraft() {
  const data = {
    nome: value('nome'),
    setor: value('setor'),
    whatsapp: value('whatsapp'),
    projeto: value('projeto'),
    tipo: value('tipo'),
    canal: value('canal'),
    objetivo: value('objetivo'),
    publico: value('publico'),
    texto: value('texto'),
    texto_pendente: form.elements['texto_pendente'].checked,
    obrigatorias: value('obrigatorias'),
    destaque: value('destaque'),
    estilos: getCheckboxValues('estilo'),
    cores: getCheckboxValues('cores'),
    evitar: value('evitar'),
    referencia_link: value('referencia_link'),
    referencia_obs: value('referencia_obs'),
    prazo: value('prazo'),
    data_critica: value('data_critica'),
    observacoes: value('observacoes')
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    Object.entries(data).forEach(([key, val]) => {
      if (key === 'estilos') return;
      if (key === 'cores') return;
      const field = form.elements[key];
      if (!field) return;
      if (field.type === 'checkbox') {
        field.checked = Boolean(val);
      } else {
        field.value = val;
      }
    });
    (data.estilos || []).forEach(v => {
      const input = form.querySelector(`input[name="estilo"][value="${CSS.escape(v)}"]`);
      if (input) input.checked = true;
    });
    (data.cores || []).forEach(v => {
      const input = form.querySelector(`input[name="cores"][value="${CSS.escape(v)}"]`);
      if (input) input.checked = true;
    });
  } catch (error) {
    console.error('Erro ao carregar rascunho:', error);
  }
}

form.addEventListener('input', saveDraft);
form.addEventListener('change', saveDraft);

loadContent().catch((error) => {
  console.error(error);
  feedback.textContent = 'Não foi possível carregar o conteúdo do formulário.';
});
