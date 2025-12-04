document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  // Form validation
  const forms = document.querySelectorAll('form[novalidate]');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      if (!form.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show errors for invalid fields
        const invalidFields = form.querySelectorAll(':invalid');
        invalidFields.forEach(field => {
          const errorId = field.getAttribute('aria-describedby');
          if (errorId) {
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
              field.setAttribute('aria-invalid', 'true');
              if (field.validity.valueMissing) {
                errorEl.textContent = 'This field is required.';
              } else if (field.validity.typeMismatch && field.type === 'email') {
                errorEl.textContent = 'Please enter a valid email address.';
              } else {
                errorEl.textContent = 'Please check this field.';
              }
            }
          }
        });
      } else {
        // Clear any previous errors
        form.querySelectorAll('[aria-invalid="true"]').forEach(field => {
          field.setAttribute('aria-invalid', 'false');
          const errorId = field.getAttribute('aria-describedby');
          if (errorId) {
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
              errorEl.textContent = '';
            }
          }
        });
      }
      form.classList.add('was-validated');
    });

    // Clear errors on input
    form.querySelectorAll('input, textarea, select').forEach(field => {
      field.addEventListener('input', () => {
        if (field.hasAttribute('aria-invalid')) {
          field.setAttribute('aria-invalid', 'false');
          const errorId = field.getAttribute('aria-describedby');
          if (errorId) {
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
              errorEl.textContent = '';
            }
          }
        }
      });
    });
  });
});
