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
 * Hardcoded stats for banner variant 2.
 * @type {{ value: string, label: string }[]}
 */
const VARIANT_2_STATS = [
  {
    value: '500+',
    label: 'Products',
  },
  {
    value: '50+',
    label: 'Brands',
  },
  {
    value: '4.9★',
    label: 'Rating',
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
 * Returns the authored rows for the banner block.
 * @param {Element} block The block element.
 * @returns {Element[]}
 */
function getRows(block) {
  return [...block.querySelectorAll(':scope > div')];
}

/**
 * Extracts config-like rows authored after the main banner row.
 * The first authored row is the banner's real content/media layout, so using
 * the shared readBlockConfig helper against the whole block would incorrectly
 * treat that structural row as configuration. This helper intentionally reads
 * only the trailing key/value rows used by variant-specific settings such as
 * badge-content.
 * @param {Element[]} rows The authored rows.
 * @returns {Record<string, string>}
 */
function getAuthoredSettings(rows) {
  return rows.slice(1).reduce((settings, row) => {
    const columns = [...row.children];
    const [keyColumn, valueColumn] = columns;

    if (!keyColumn || !valueColumn) {
      return settings;
    }

    const key = keyColumn.textContent.trim().toLowerCase();
    const value = valueColumn.textContent.trim();

    if (key) {
      settings[key] = value;
    }

    return settings;
  }, {});
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
 * Builds the banner metrics block for variant 2.
 * @returns {HTMLDivElement}
 */
function buildVariant2Metrics() {
  const metrics = document.createElement('div');
  metrics.className = 'banner__metrics';

  VARIANT_2_STATS.forEach((item) => {
    const metric = document.createElement('div');
    metric.className = 'banner__metric';

    const value = document.createElement('p');
    value.className = 'banner__metric-value';
    value.textContent = item.value;

    const label = document.createElement('p');
    label.className = 'banner__metric-label';
    label.textContent = item.label;

    metric.append(value, label);
    metrics.append(metric);
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
  const [row] = getRows(block);
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
 * Styles the last word of the heading for banner variant 2.
 * @param {Element} heading The authored heading.
 */
function decorateVariant2Heading(heading) {
  if (!heading || heading.children.length) {
    return;
  }

  const words = heading.textContent.trim().split(/\s+/);

  if (words.length < 2) {
    return;
  }

  const accentWord = words.pop();
  const baseText = words.join(' ');

  heading.textContent = '';

  const baseLine = document.createElement('span');
  baseLine.className = 'banner__heading-line';
  baseLine.textContent = baseText;

  const accentLine = document.createElement('span');
  accentLine.className = 'banner__heading-line banner__heading-line--accent';
  accentLine.textContent = accentWord;

  heading.append(baseLine, accentLine);
}

/**
 * Builds the media badge for banner variant 2.
 * @param {string} text The badge content.
 * @returns {HTMLDivElement|null}
 */
function buildVariant2Badge(text) {
  if (!text) {
    return null;
  }

  const badge = document.createElement('div');
  badge.className = 'banner__badge';
  badge.textContent = text;

  return badge;
}

/**
 * Decorates the editorial banner variants.
 * @param {Element} block The block element.
 * @param {{ mediaFirst?: boolean }} options Decoration options.
 */
function decorateEditorialVariant(block, options = {}) {
  const { mediaFirst = false } = options;
  const rows = getRows(block);
  const [row] = rows;
  const settings = getAuthoredSettings(rows);
  const columns = row ? [...row.children] : [];
  const [firstColumn, secondColumn] = columns;
  const [contentColumn, mediaColumn] = mediaFirst
    ? [secondColumn, firstColumn]
    : [firstColumn, secondColumn];

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
  const badge = buildVariant2Badge(settings['badge-content']);

  const layout = document.createRange().createContextualFragment(`
    <div class="banner__inner">
      ${mediaFirst
    ? '<div class="banner__media"></div><div class="banner__content"></div>'
    : '<div class="banner__content"></div><div class="banner__media"></div>'}
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
    decorateVariant2Heading(heading);
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

  content.append(buildVariant2Metrics());

  if (picture) {
    const imageFrame = document.createElement('div');
    imageFrame.className = 'banner__image-frame';
    imageFrame.append(picture);

    if (badge) {
      imageFrame.append(badge);
    }

    media.append(imageFrame);
  }

  block.replaceChildren(layout);
}

/**
 * Decorates banner variant 2.
 * @param {Element} block The block element.
 */
function decorateVariant2(block) {
  decorateEditorialVariant(block);
}

/**
 * Decorates banner variant 3.
 * @param {Element} block The block element.
 */
function decorateVariant3(block) {
  decorateEditorialVariant(block, { mediaFirst: true });
}

/**
 * Decorates the banner block.
 * @param {Element} block The block element.
 */
export default function decorate(block) {
  const variant = getVariant(block);
  block.dataset.variant = variant;

  switch (variant) {
    case 'variant-3':
      decorateVariant3(block);
      break;
    case 'variant-2':
      decorateVariant2(block);
      break;
    case 'variant-1':
    default:
      decorateVariant1(block);
      break;
  }
}
