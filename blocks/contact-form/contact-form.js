const DEFAULT_COPY = Object.freeze({
  heading: 'Send Us a Message',
  description: 'Fill out the form below and our team will get back to you within 24 hours.',
  buttonLabel: 'Send Message',
  successMessage: 'Thanks for reaching out. This demo form is a mockup, so no message was sent.',
  errorMessage: 'Please complete all required fields before sending your message.',
});

const STATUS_COPY = Object.freeze({
  success: {
    title: 'Message received',
    message: DEFAULT_COPY.successMessage,
  },
  error: {
    title: 'Please review your form',
    message: DEFAULT_COPY.errorMessage,
  },
});

const FIELDS = Object.freeze([
  {
    name: 'name',
    label: 'Your Name',
    placeholder: 'Sun Shine',
    type: 'text',
    autocomplete: 'name',
  },
  {
    name: 'email',
    label: 'Email Address',
    placeholder: 'sunshine@example.com',
    type: 'email',
    autocomplete: 'email',
  },
  {
    name: 'subject',
    label: 'Subject',
    placeholder: 'How can we help?',
    type: 'text',
    autocomplete: 'off',
  },
  {
    name: 'message',
    label: 'Message',
    placeholder: 'Tell us more about your inquiry...',
    type: 'textarea',
    autocomplete: 'off',
  },
]);

function escapeHTML(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getAuthoredCopy(block) {
  const heading = block.querySelector('h1, h2, h3, h4, h5, h6')?.textContent?.trim();
  const description = block.querySelector('p')?.textContent?.trim();
  const buttonLabel = block.querySelector('a, button')?.textContent?.trim();

  return {
    heading: heading || DEFAULT_COPY.heading,
    description: description || DEFAULT_COPY.description,
    buttonLabel: buttonLabel || DEFAULT_COPY.buttonLabel,
  };
}

function buildFieldMarkup(baseId) {
  return FIELDS.map((field) => {
    const fieldId = `${baseId}-${field.name}`;

    if (field.type === 'textarea') {
      return `
        <div class="contact-form__field">
          <label class="contact-form__label" for="${fieldId}">${escapeHTML(field.label)}</label>
          <textarea
            class="contact-form__textarea"
            id="${fieldId}"
            name="${field.name}"
            placeholder="${escapeHTML(field.placeholder)}"
            autocomplete="${field.autocomplete}"
            rows="3"
            required
          ></textarea>
        </div>
      `;
    }

    return `
      <div class="contact-form__field">
        <label class="contact-form__label" for="${fieldId}">${escapeHTML(field.label)}</label>
        <input
          class="contact-form__input"
          id="${fieldId}"
          name="${field.name}"
          type="${field.type}"
          placeholder="${escapeHTML(field.placeholder)}"
          autocomplete="${field.autocomplete}"
          required
        >
      </div>
    `;
  }).join('');
}

function getStatusIcon(state) {
  if (state === 'success') {
    return `
      <svg viewBox="0 0 20 20" role="presentation" focusable="false">
        <path d="M10 1.67a8.33 8.33 0 1 0 0 16.66 8.33 8.33 0 0 0 0-16.66Zm3.5 6.18-4.03 5.05a.83.83 0 0 1-.62.31h-.03a.83.83 0 0 1-.61-.26L6.5 11.08a.83.83 0 1 1 1.21-1.13l1.05 1.13 3.44-4.32a.83.83 0 0 1 1.3 1.04Z" fill="currentColor"/>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 20 20" role="presentation" focusable="false">
      <path d="M10 1.67a8.33 8.33 0 1 0 0 16.66 8.33 8.33 0 0 0 0-16.66Zm0 4.16a.83.83 0 0 1 .83.84v4.16a.83.83 0 1 1-1.66 0V6.67A.83.83 0 0 1 10 5.83Zm0 8.34a1.04 1.04 0 1 1 0-2.09 1.04 1.04 0 0 1 0 2.09Z" fill="currentColor"/>
    </svg>
  `;
}

function renderStatus(status, state) {
  const { title, message } = STATUS_COPY[state];

  status.replaceChildren(document.createRange().createContextualFragment(`
    <div class="dropin-in-line-alert dropin-in-line-alert--${state} dropin-in-line-alert--primary">
      <div class="dropin-in-line-alert__heading">
        <div class="dropin-in-line-alert__title-container">
          <span class="dropin-in-line-alert__icon" aria-hidden="true">
            ${getStatusIcon(state)}
          </span>
          <span class="dropin-in-line-alert__title">${escapeHTML(title)}</span>
        </div>
      </div>
      <div class="dropin-in-line-alert__content">${escapeHTML(message)}</div>
    </div>
  `));

  status.dataset.state = state;
}

/**
 * Builds the contact form block.
 * @param {Element} block The contact form block element.
 */
export default function decorate(block) {
  const copy = getAuthoredCopy(block);
  const baseId = `contact-form-${Math.random().toString(36).slice(2, 10)}`;
  const statusId = `${baseId}-status`;

  const fragment = document.createRange().createContextualFragment(`
    <div class="contact-form__content">
      <h2 class="contact-form__heading">${escapeHTML(copy.heading)}</h2>
      <p class="contact-form__description">${escapeHTML(copy.description)}</p>
      <form class="contact-form__form" aria-describedby="${statusId}">
        ${buildFieldMarkup(baseId)}
        <button class="contact-form__button" type="submit">
          <span class="contact-form__button-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" role="presentation" focusable="false">
              <path d="M14.5 2 1.5 7.56l4.88 1.75L8.13 14 14.5 2Zm-7.31 7.03-.94 3.17L4.3 8.54l8-3.43-5.11 3.92Z" fill="currentColor"/>
            </svg>
          </span>
          <span>${escapeHTML(copy.buttonLabel)}</span>
        </button>
      </form>
      <div class="contact-form__status" id="${statusId}" aria-live="polite"></div>
    </div>
  `);

  const form = fragment.querySelector('.contact-form__form');
  const status = fragment.querySelector('.contact-form__status');

  const clearStatus = () => {
    status.replaceChildren();
    delete status.dataset.state;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      renderStatus(status, 'error');
      return;
    }

    renderStatus(status, 'success');
    form.reset();
  });

  form.addEventListener('input', clearStatus);

  block.replaceChildren(fragment);
}