const SOCIAL_PROOF_MARKERS = ['A', 'M', 'S', 'K'];

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
 * Builds the styled social proof footer.
 * @param {HTMLParagraphElement} paragraph The authored paragraph.
 * @returns {HTMLDivElement}
 */
function buildSocialProof(paragraph) {
  const wrapper = document.createElement('div');
  wrapper.className = 'interactive-banner__social-proof';

  const markers = document.createElement('div');
  markers.className = 'interactive-banner__social-proof-markers';
  markers.setAttribute('aria-hidden', 'true');

  SOCIAL_PROOF_MARKERS.forEach((marker) => {
    const item = document.createElement('span');
    item.className = 'interactive-banner__social-proof-marker';
    item.textContent = marker;
    markers.append(item);
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

  wrapper.append(markers, text);
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
function getMediaItems(mediaColumn) {
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
function buildMediaCluster(items) {
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
 * Decorates the interactive-banner block.
 * @param {Element} block The block element.
 */
export default function decorate(block) {
  const [row] = getRows(block);
  const columns = row ? [...row.children] : [];
  const [mediaColumn, contentColumn] = columns;

  if (!mediaColumn || !contentColumn) {
    return;
  }

  const mediaItems = getMediaItems(mediaColumn);

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

  inner.append(buildMediaCluster(mediaItems));
  block.replaceChildren(fragment);
}
