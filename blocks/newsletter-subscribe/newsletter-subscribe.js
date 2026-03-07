/**
 * Builds the newsletter subscribe block.
 * @param {Element} block The newsletter subscribe block element.
 */
export default function decorate(block) {
  const inputId = `newsletter-subscribe-email-${Math.random().toString(36).slice(2, 10)}`;
  const statusId = `${inputId}-status`;

  const fragment = document.createRange().createContextualFragment(`
    <div class="newsletter-subscribe__content">
      <h2 class="newsletter-subscribe__heading">Stay Updated</h2>
      <p class="newsletter-subscribe__description">
        Subscribe to our newsletter and get exclusive deals, new arrivals, and updates delivered to your inbox.
      </p>
      <form class="newsletter-subscribe__form" aria-describedby="${statusId}">
        <label class="newsletter-subscribe__label" for="${inputId}">Email address</label>
        <input
          class="newsletter-subscribe__input"
          id="${inputId}"
          name="email"
          type="email"
          autocomplete="email"
          placeholder="Enter your email"
          required
        >
        <button class="newsletter-subscribe__button" type="submit">Subscribe</button>
      </form>
      <p class="newsletter-subscribe__note">
        By subscribing, you agree to our Privacy Policy and consent to receive updates.
      </p>
      <p class="newsletter-subscribe__status" id="${statusId}" aria-live="polite"></p>
    </div>
  `);

  const form = fragment.querySelector('.newsletter-subscribe__form');
  const input = fragment.querySelector('.newsletter-subscribe__input');
  const status = fragment.querySelector('.newsletter-subscribe__status');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!input.checkValidity()) {
      input.reportValidity();
      status.textContent = 'Please enter a valid email address.';
      status.dataset.state = 'error';
      return;
    }

    status.textContent = `Thanks! ${input.value} has been added to this mock newsletter list.`;
    status.dataset.state = 'success';
    form.reset();
  });

  input.addEventListener('input', () => {
    if (status.dataset.state === 'error') {
      status.textContent = '';
      delete status.dataset.state;
    }
  });

  block.replaceChildren(fragment);
}
