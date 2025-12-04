const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzet3mdRXmM46DGwW1gRQXQSbVgBm2MaZ4GioNa9F_9wLLBRfx6CTwzCCRXTNwz4SzG8g/exec';

function toggleNavigation() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen.toString());
    });
  }
}

function createStatusElement(form) {
  const status = document.createElement('p');
  status.className = 'form-status mini-text';
  status.setAttribute('role', 'status');
  status.hidden = true;
  form.appendChild(status);
  return status;
}

function buildPayload(form) {
  const formData = new FormData(form);
  const clean = (value) => (value || '').toString().trim();

  const messageParts = [];
  formData.forEach((value, key) => {
    if (!value) return;
    if (['name', 'company', 'email', 'phone', 'message', 'consent', 'source'].includes(key)) return;
    const labelMap = {
      size: 'Team Size',
      notes: 'Notes',
      crm: 'Primary CRM',
      scope: 'Scope',
      tier: 'Tier',
      timeline: 'Timeline',
      outcome: 'Outcome',
    };
    const label = labelMap[key] || key;
    messageParts.push(`${label}: ${clean(value)}`);
  });

  return {
    timestamp: new Date().toISOString(),
    page: window.location.href,
    source: form.dataset.analytics || 'contact-form',
    name: clean(formData.get('name')),
    company: clean(formData.get('company') || formData.get('crm')),
    email: clean(formData.get('email')),
    phone: clean(formData.get('phone')),
    consent: ['true', 'on', 'yes'].includes(clean(formData.get('consent')).toLowerCase()),
    message: clean(formData.get('message')) || messageParts.join(' | '),
  };
}

async function submitForm(form, statusEl) {
  const submitBtn = form.querySelector('[type="submit"]');
  const originalText = submitBtn?.textContent;

  statusEl.hidden = false;
  statusEl.textContent = 'Submitting…';
  statusEl.classList.remove('error', 'success');
  submitBtn && (submitBtn.disabled = true);
  submitBtn && (submitBtn.textContent = 'Submitting…');

  try {
    const payload = buildPayload(form);
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const delivered = response.ok || response.type === 'opaque';
    statusEl.textContent = delivered
      ? 'Thanks! Your request was received.'
      : 'Submitted, but please verify your network before re-trying.';
    statusEl.classList.toggle('success', delivered);
    statusEl.classList.toggle('error', !delivered);
    form.reset();
  } catch (error) {
    statusEl.textContent = 'Something went wrong. Please try again or email connect@integratewise.co.';
    statusEl.classList.add('error');
  } finally {
    submitBtn && (submitBtn.disabled = false);
    submitBtn && originalText && (submitBtn.textContent = originalText);
  }
}

function wireForms() {
  const forms = document.querySelectorAll('form[data-analytics]');
  forms.forEach((form) => {
    const statusEl = createStatusElement(form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitForm(form, statusEl);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  toggleNavigation();
  wireForms();
});
