/**
 * Hardcoded stats for banner variant 1.
 * @type {{ value?: string, label: string, rating?: string }[]}
 */
const VARIANT_1_STATS = [
  {
    value: '10k+',
    label: 'Happy Customers',
  },
  {
    value: '500+',
    label: 'Products',
  },
  {
    rating: '4.8',
    label: 'Average Rating',
  },
];

/**
 * Returns the active banner variant.
 * @param {Element} block The block element.
 * @returns {string}
 */
function getVariant(block) {
  return [...block.classList].find((className) => className.startsWith('variant-')) || 'variant-1';
}

/**
 * Builds the banner metrics block for variant 1.
 * @returns {HTMLDivElement}
 */
function buildVariant1Metrics() {
  const metrics = document.createElement('div');
  metrics.className = 'banner__metrics';

  VARIANT_1_STATS.forEach((item, index) => {
    const metric = document.createElement('div');
    metric.className = 'banner__metric';

    if (item.rating) {
      const stars = document.createElement('div');
      stars.className = 'banner__metric-stars';
      stars.setAttribute('aria-hidden', 'true');
      stars.textContent = '★★★★★';

      const label = document.createElement('p');
      label.className = 'banner__metric-label';
      label.textContent = `${item.rating} ${item.label}`;

      metric.append(stars, label);
    } else {
      const value = document.createElement('p');
      value.className = 'banner__metric-value';
      value.textContent = item.value;

      const label = document.createElement('p');
      label.className = 'banner__metric-label';
      label.textContent = item.label;

      metric.append(value, label);
    }

    metrics.append(metric);

    if (index < VARIANT_1_STATS.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'banner__metric-divider';
      divider.setAttribute('aria-hidden', 'true');
      metrics.append(divider);
    }
  });

  return metrics;
}

/**
 * Builds the floating trend card for variant 1.
 * @returns {HTMLDivElement}
 */
function buildVariant1TrendCard() {
  const card = document.createElement('div');
  card.className = 'banner__trend-card';

  const icon = document.createRange().createContextualFragment(`
    <svg class="banner__trend-icon" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M7 22L13 16L17 20L25 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M19 12H25V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>
  `);

  const content = document.createElement('div');
  content.className = 'banner__trend-content';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'banner__trend-eyebrow';
  eyebrow.textContent = 'Trending';

  const title = document.createElement('p');
  title.className = 'banner__trend-title';
  title.textContent = 'Best Sellers';

  content.append(eyebrow, title);
  card.append(icon, content);

  return card;
}

/**
 * Decorates banner variant 1.
 * @param {Element} block The block element.
 */
function decorateVariant1(block) {
  const row = block.querySelector(':scope > div');
  const columns = row ? [...row.children] : [];
  const [contentColumn, mediaColumn] = columns;

  if (!contentColumn || !mediaColumn) {
    return;
  }

  const paragraphs = contentColumn.querySelectorAll(':scope > p');
  const eyebrow = paragraphs[0];
  const description = paragraphs[1];
  const actionsParagraph = paragraphs[2];
  const heading = contentColumn.querySelector('h1, h2, h3, h4, h5, h6');
  const links = actionsParagraph ? [...actionsParagraph.querySelectorAll('a')] : [];
  const picture = mediaColumn.querySelector('picture');

  const layout = document.createRange().createContextualFragment(`
    <div class="banner__inner">
      <div class="banner__content"></div>
      <div class="banner__media"></div>
    </div>
  `);

  const content = layout.querySelector('.banner__content');
  const media = layout.querySelector('.banner__media');

  if (eyebrow) {
    eyebrow.className = 'banner__eyebrow';
    content.append(eyebrow);
  }

  if (heading) {
    heading.classList.add('banner__heading');
    content.append(heading);
  }

  if (description) {
    description.className = 'banner__description';
    content.append(description);
  }

  if (links.length) {
    const actions = document.createElement('div');
    actions.className = 'banner__actions';

    links.forEach((link, index) => {
      link.className = `banner__button ${index === 0 ? 'banner__button--primary' : 'banner__button--secondary'}`;
      actions.append(link);
    });

    content.append(actions);
  }

  content.append(buildVariant1Metrics());

  if (picture) {
    const imageFrame = document.createElement('div');
    imageFrame.className = 'banner__image-frame';
    imageFrame.append(picture);
    media.append(imageFrame, buildVariant1TrendCard());
  }

  block.replaceChildren(layout);
}

/**
 * Decorates the banner block.
 * @param {Element} block The block element.
 */
export default function decorate(block) {
  const variant = getVariant(block);
  block.dataset.variant = variant;

  switch (variant) {
    case 'variant-1':
    default:
      decorateVariant1(block);
      break;
  }
}
