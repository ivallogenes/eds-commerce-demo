import { readBlockConfig } from '../../scripts/aem.js';

const DEFAULT_COPY = Object.freeze({
  heading: 'Visit Our Store',
  iframeTitle: 'Store location map',
  fallbackMessage: 'Store location unavailable.',
});

function normalizeAddress(address) {
  if (Array.isArray(address)) {
    return address
      .filter(Boolean)
      .join(', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (typeof address !== 'string') {
    return '';
  }

  return address.replace(/\s+/g, ' ').trim();
}

function createEmbedUrl(address) {
  const url = new URL('https://www.google.com/maps');
  url.searchParams.set('q', address);
  url.searchParams.set('output', 'embed');
  return url.toString();
}

function createIframe(address) {
  const iframe = document.createElement('iframe');
  iframe.className = 'store-locator__map-frame';
  iframe.title = DEFAULT_COPY.iframeTitle;
  iframe.loading = 'lazy';
  iframe.referrerPolicy = 'no-referrer-when-downgrade';
  iframe.allowFullscreen = true;
  iframe.src = createEmbedUrl(address);
  return iframe;
}

/**
 * Builds the store locator block.
 * @param {Element} block The store locator block element.
 */
export default function decorate(block) {
  const { address } = readBlockConfig(block);
  const normalizedAddress = normalizeAddress(address);

  const fragment = document.createRange().createContextualFragment(`
    <div class="store-locator__content">
      <h2 class="store-locator__heading">${DEFAULT_COPY.heading}</h2>
      <div class="store-locator__map-shell">
        <div class="store-locator__map-canvas"></div>
      </div>
    </div>
  `);

  const mapCanvas = fragment.querySelector('.store-locator__map-canvas');

  if (normalizedAddress) {
    mapCanvas.append(createIframe(normalizedAddress));
  } else {
    const fallback = document.createElement('p');
    fallback.className = 'store-locator__fallback';
    fallback.textContent = DEFAULT_COPY.fallbackMessage;
    mapCanvas.append(fallback);
  }

  block.replaceChildren(fragment);
}
