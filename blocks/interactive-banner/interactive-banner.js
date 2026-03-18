const DEFAULT_SOCIAL_PROOF_MARKERS = ['A', 'M', 'S', 'K'];

const CORPORATE_SOCIAL_PROOF_MARKERS = ['J', 'R', 'L', 'T'];

/**
 * Returns the authored rows for a block.
 * @param {Element} block The block element.
 * @returns {Element[]}
 */
function getRows(block) {
  return [...block.querySelectorAll(':scope > div')];
}

/**
 * Returns whether the provided element is a heading.
 * @param {Element | undefined} element The candidate element.
 * @returns {boolean}
 */
function isHeading(element) {
  return Boolean(element && /^H[1-6]$/.test(element.tagName));
}

/**
 * Returns the first authored heading inside the content column.
 * @param {Element[]} children Direct children of the content column.
 * @returns {HTMLHeadingElement | null}
 */
function getHeading(children) {
  return children.find((child) => isHeading(child)) || null;
}

/**
 * Returns the active banner variant.
 * @param {Element} block The block element.
 * @returns {'default' | 'corporate'}
 */
function getVariant(block) {
  return block.classList.contains('corporate') ? 'corporate' : 'default';
}

/**
 * Extracts trailing text lines from a paragraph after media content.
 * @param {HTMLParagraphElement} paragraph The authored paragraph.
 * @returns {string[]}
 */
function getParagraphLines(paragraph) {
  const lines = [];
  let currentLine = '';

  [...paragraph.childNodes].forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = /** @type {Element} */ (node);

      if (element.tagName === 'PICTURE') {
        return;
      }

      if (element.tagName === 'BR') {
        if (currentLine.trim()) {
          lines.push(currentLine.trim());
        }

        currentLine = '';
        return;
      }
    }

    const text = node.textContent || '';

    if (text) {
      currentLine += text;
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

/**
 * Builds the styled social proof footer.
 * @param {HTMLParagraphElement} paragraph The authored paragraph.
 * @param {string[]} markers Marker letters for the social proof cluster.
 * @returns {HTMLDivElement}
 */
function buildSocialProof(paragraph, markers = DEFAULT_SOCIAL_PROOF_MARKERS) {
  const wrapper = document.createElement('div');
  wrapper.className = 'interactive-banner__social-proof';

  const markersWrapper = document.createElement('div');
  markersWrapper.className = 'interactive-banner__social-proof-markers';
  markersWrapper.setAttribute('aria-hidden', 'true');

  markers.forEach((marker) => {
    const item = document.createElement('span');
    item.className = 'interactive-banner__social-proof-marker';
    item.textContent = marker;
    markersWrapper.append(item);
  });

  const text = document.createElement('p');
  text.className = 'interactive-banner__social-proof-text';

  const content = paragraph.textContent.trim();
  const match = content.match(/^(\S+)(?:\s+(.+))?$/);

  if (match) {
    const value = document.createElement('strong');
    value.className = 'interactive-banner__social-proof-value';
    value.textContent = match[1];
    text.append(value);

    if (match[2]) {
      text.append(` ${match[2]}`);
    }
  } else {
    text.textContent = content;
  }

  wrapper.append(markersWrapper, text);
  return wrapper;
}

/**
 * Builds the action row using authored links.
 * @param {HTMLParagraphElement} paragraph The paragraph containing action links.
 * @returns {HTMLDivElement | null}
 */
function buildActions(paragraph) {
  if (!paragraph) {
    return null;
  }

  const links = [...paragraph.querySelectorAll('a')];

  if (!links.length) {
    return null;
  }

  const actions = document.createElement('div');
  actions.className = 'interactive-banner__actions';

  links.forEach((link, index) => {
    link.className = [
      'interactive-banner__button',
      index === 0
        ? 'interactive-banner__button--primary'
        : 'interactive-banner__button--secondary',
    ].join(' ');
    actions.append(link);
  });

  return actions;
}

/**
 * Extracts media links and labels from the authored media column.
 * @param {Element} mediaColumn The authored media column.
 * @returns {{ link: HTMLAnchorElement, label: string }[]}
 */
function getDefaultMediaItems(mediaColumn) {
  const paragraphs = [...mediaColumn.querySelectorAll(':scope > p')];

  const items = paragraphs
    .map((paragraph) => {
      const link = paragraph.querySelector('a');

      if (!link || !link.querySelector('picture')) {
        return null;
      }

      const labelSource = paragraph.cloneNode(true);
      labelSource.querySelector('a')?.remove();

      return {
        link,
        label: labelSource.textContent.trim(),
      };
    })
    .filter(Boolean);

  if (items.length) {
    return items.slice(0, 5);
  }

  return [...mediaColumn.querySelectorAll('a')]
    .filter((link) => link.querySelector('picture'))
    .slice(0, 5)
    .map((link) => ({
      link,
      label: '',
    }));
}

/**
 * Builds the floating image cluster from authored media items.
 * @param {{ link: HTMLAnchorElement, label: string }[]} items The authored media items.
 * @returns {HTMLDivElement}
 */
function buildDefaultMediaCluster(items) {
  const media = document.createElement('div');
  media.className = 'interactive-banner__media';

  const orbitOuter = document.createElement('span');
  orbitOuter.className = 'interactive-banner__orbit interactive-banner__orbit--outer';
  orbitOuter.setAttribute('aria-hidden', 'true');

  const orbitInner = document.createElement('span');
  orbitInner.className = 'interactive-banner__orbit interactive-banner__orbit--inner';
  orbitInner.setAttribute('aria-hidden', 'true');

  const cluster = document.createElement('div');
  cluster.className = 'interactive-banner__media-cluster';

  items.slice(0, 5).forEach(({ link, label }, index) => {
    const item = document.createElement('div');
    item.className = 'interactive-banner__media-item';
    item.dataset.position = String(index + 1);

    link.className = 'interactive-banner__media-link';
    link.dataset.position = String(index + 1);

    const picture = link.querySelector('picture');
    const image = link.querySelector('img');

    if (picture) {
      picture.classList.add('interactive-banner__picture');
    }

    if (image) {
      image.classList.add('interactive-banner__image');
    }

    item.append(link);

    if (label) {
      const labelElement = document.createElement('p');
      labelElement.className = 'interactive-banner__media-label';
      labelElement.textContent = label;
      item.append(labelElement);
    }

    cluster.append(item);
  });

  media.append(orbitOuter, orbitInner, cluster);
  return media;
}

/**
 * Extracts corporate media cards from the authored media column.
 * @param {Element} mediaColumn The authored media column.
 * @returns {{ picture: HTMLPictureElement, title: string, subtitle: string }[]}
 */
function getCorporateMediaItems(mediaColumn) {
  const paragraphs = [...mediaColumn.querySelectorAll(':scope > p')];
  const items = [];

  for (let index = 0; index < paragraphs.length && items.length < 5; index += 1) {
    const paragraph = paragraphs[index];
    const picture = paragraph.querySelector('picture');

    if (!picture) {
      continue;
    }

    const lines = getParagraphLines(paragraph);
    const title = lines[0] || '';
    let subtitle = lines.slice(1).join(' ').trim();
    const nextParagraph = paragraphs[index + 1];

    if (!subtitle && nextParagraph && !nextParagraph.querySelector('picture')) {
      subtitle = nextParagraph.textContent.trim();
      index += 1;
    }

    items.push({
      picture,
      title,
      subtitle,
    });
  }

  return items;
}

/**
 * Builds the corporate media card cluster.
 * @param {{ picture: HTMLPictureElement, title: string, subtitle: string }[]} items The authored media items.
 * @returns {HTMLDivElement}
 */
function buildCorporateMediaCluster(items) {
  const media = document.createElement('div');
  media.className = 'interactive-banner__media interactive-banner__media--corporate';

  const cards = document.createElement('div');
  cards.className = 'interactive-banner__media-cards';

  items.slice(0, 5).forEach(({ picture, title, subtitle }, index) => {
    const item = document.createElement('article');
    item.className = 'interactive-banner__card-item';
    item.dataset.position = String(index + 1);

    const shell = document.createElement('div');
    shell.className = 'interactive-banner__card-shell';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'interactive-banner__card-image';

    const image = picture.querySelector('img');

    picture.classList.add('interactive-banner__picture');
    if (image) {
      image.classList.add('interactive-banner__image');
    }

    imageWrapper.append(picture);

    const copy = document.createElement('div');
    copy.className = 'interactive-banner__card-copy';

    if (title) {
      const titleElement = document.createElement('p');
      titleElement.className = 'interactive-banner__card-title';
      titleElement.textContent = title;
      copy.append(titleElement);
    }

    if (subtitle) {
      const subtitleElement = document.createElement('p');
      subtitleElement.className = 'interactive-banner__card-subtitle';
      subtitleElement.textContent = subtitle;
      copy.append(subtitleElement);
    }

    shell.append(imageWrapper, copy);
    item.append(shell);
    cards.append(item);
  });

  media.append(cards);
  return media;
}

/**
 * Builds a badge list from authored paragraphs.
 * @param {HTMLParagraphElement[]} paragraphs Authored badge paragraphs.
 * @returns {HTMLUListElement | null}
 */
function buildBadgeListFromParagraphs(paragraphs) {
  const items = paragraphs
    .map((paragraph) => paragraph.textContent.trim())
    .filter(Boolean);

  if (!items.length) {
    return null;
  }

  const list = document.createElement('ul');
  list.className = 'interactive-banner__badge-list';

  items.forEach((text) => {
    const item = document.createElement('li');
    item.className = 'interactive-banner__badge-item';
    item.textContent = text;
    list.append(item);
  });

  return list;
}

/**
 * Decorates the default interactive-banner block.
 * @param {Element} block The block element.
 */
function decorateDefault(block) {
  const [row] = getRows(block);
  const columns = row ? [...row.children] : [];
  const [mediaColumn, contentColumn] = columns;

  if (!mediaColumn || !contentColumn) {
    return;
  }

  const mediaItems = getDefaultMediaItems(mediaColumn);

  if (!mediaItems.length) {
    return;
  }

  const contentChildren = [...contentColumn.children];
  const heading = getHeading(contentChildren);
  const list = contentChildren.find((child) => child.tagName === 'UL') || null;
  const actionParagraph = contentChildren.find(
    (child) => child.tagName === 'P' && child.querySelectorAll('a').length,
  ) || null;
  const footerParagraph = contentChildren.at(-1)?.tagName === 'P'
    ? contentChildren.at(-1)
    : null;
  const topBadge = contentChildren[0]?.tagName === 'P' ? contentChildren[0] : null;
  const description = contentChildren.find((child) => (
    child.tagName === 'P'
    && child !== topBadge
    && child !== actionParagraph
    && child !== footerParagraph
  )) || null;

  const fragment = document.createRange().createContextualFragment(`
    <div class="interactive-banner__inner">
      <div class="interactive-banner__content"></div>
    </div>
  `);

  const inner = fragment.querySelector('.interactive-banner__inner');
  const content = fragment.querySelector('.interactive-banner__content');

  if (
    topBadge
    && topBadge.textContent.trim().toLowerCase() !== 'no-badge'
  ) {
    topBadge.className = 'interactive-banner__top-badge';
    content.append(topBadge);
  }

  if (heading) {
    heading.classList.add('interactive-banner__heading');
    content.append(heading);
  }

  if (description) {
    description.className = 'interactive-banner__description';
    content.append(description);
  }

  if (list) {
    list.className = 'interactive-banner__badge-list';
    [...list.children].forEach((item) => {
      item.classList.add('interactive-banner__badge-item');
    });
    content.append(list);
  }

  const actions = buildActions(actionParagraph);
  if (actions) {
    content.append(actions);
  }

  if (footerParagraph) {
    content.append(buildSocialProof(footerParagraph));
  }

  inner.append(buildDefaultMediaCluster(mediaItems));
  block.replaceChildren(fragment);
}

/**
 * Decorates the corporate interactive-banner block.
 * @param {Element} block The block element.
 */
function decorateCorporate(block) {
  const [row] = getRows(block);
  const columns = row ? [...row.children] : [];
  const [contentColumn, mediaColumn] = columns;

  if (!contentColumn || !mediaColumn) {
    return;
  }

  const mediaItems = getCorporateMediaItems(mediaColumn);

  if (!mediaItems.length) {
    return;
  }

  const contentChildren = [...contentColumn.children];
  const heading = getHeading(contentChildren);
  const actionParagraph = contentChildren.find(
    (child) => child.tagName === 'P' && child.querySelectorAll('a').length,
  ) || null;
  const footerParagraph = contentChildren.at(-1)?.tagName === 'P'
    ? contentChildren.at(-1)
    : null;
  const topBadge = contentChildren[0]?.tagName === 'P' ? contentChildren[0] : null;
  const description = contentChildren.find((child) => (
    child.tagName === 'P'
    && child !== topBadge
    && child !== actionParagraph
    && child !== footerParagraph
  )) || null;

  const descriptionIndex = description ? contentChildren.indexOf(description) : -1;
  const actionIndex = actionParagraph ? contentChildren.indexOf(actionParagraph) : contentChildren.length;
  const footerIndex = footerParagraph ? contentChildren.indexOf(footerParagraph) : contentChildren.length;
  const endIndex = Math.min(actionIndex, footerIndex);
  const badgeParagraphs = contentChildren
    .slice(descriptionIndex + 1, endIndex)
    .filter((child) => child.tagName === 'P');

  const fragment = document.createRange().createContextualFragment(`
    <div class="interactive-banner__inner">
      <div class="interactive-banner__content"></div>
    </div>
  `);

  const inner = fragment.querySelector('.interactive-banner__inner');
  const content = fragment.querySelector('.interactive-banner__content');

  if (
    topBadge
    && topBadge.textContent.trim().toLowerCase() !== 'no-badge'
  ) {
    topBadge.className = 'interactive-banner__top-badge';
    content.append(topBadge);
  }

  if (heading) {
    heading.classList.add('interactive-banner__heading');
    content.append(heading);
  }

  if (description) {
    description.className = 'interactive-banner__description';
    content.append(description);
  }

  const badgeList = buildBadgeListFromParagraphs(badgeParagraphs);
  if (badgeList) {
    content.append(badgeList);
  }

  const actions = buildActions(actionParagraph);
  if (actions) {
    content.append(actions);
  }

  if (footerParagraph) {
    content.append(buildSocialProof(footerParagraph, CORPORATE_SOCIAL_PROOF_MARKERS));
  }

  inner.append(buildCorporateMediaCluster(mediaItems));
  block.replaceChildren(fragment);
}

/**
 * Decorates the interactive-banner block.
 * @param {Element} block The block element.
 */
export default function decorate(block) {
  block.dataset.variant = getVariant(block);

  if (block.dataset.variant === 'corporate') {
    decorateCorporate(block);
    return;
  }

  decorateDefault(block);
}
