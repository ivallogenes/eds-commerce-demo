const MEGA_HERO_STATS = [
  {
    value: '10K+',
    label: 'Products',
    icon: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10.6667 13.3333V2.66667C10.6667 2.31304 10.5262 1.97391 10.2761 1.72386C10.0261 1.47381 9.68696 1.33333 9.33333 1.33333H6.66667C6.31304 1.33333 5.97391 1.47381 5.72386 1.72386C5.47381 1.97391 5.33333 2.31304 5.33333 2.66667V13.3333" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M13.3333 4H2.66667C1.93029 4 1.33333 4.59695 1.33333 5.33333V12C1.33333 12.7364 1.93029 13.3333 2.66667 13.3333H13.3333C14.0697 13.3333 14.6667 12.7364 14.6667 12V5.33333C14.6667 4.59695 14.0697 4 13.3333 4Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,
  },
  {
    value: '98%',
    label: 'Satisfaction',
    icon: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M10.318 8.59333L11.328 14.2773C11.3393 14.3443 11.3299 14.4131 11.3011 14.4745C11.2722 14.536 11.2253 14.5871 11.1666 14.6212C11.1079 14.6553 11.0402 14.6706 10.9725 14.6651C10.9049 14.6597 10.8405 14.6337 10.788 14.5907L8.40133 12.7993C8.28612 12.7133 8.14615 12.6667 8.00233 12.6667C7.85851 12.6667 7.71855 12.7133 7.60333 12.7993L5.21267 14.59C5.16021 14.633 5.09591 14.6589 5.02833 14.6644C4.96075 14.6698 4.89311 14.6546 4.83444 14.6206C4.77577 14.5866 4.72885 14.5356 4.69995 14.4742C4.67104 14.4129 4.66152 14.3442 4.67267 14.2773L5.682 8.59333" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M8 9.33333C10.2091 9.33333 12 7.54247 12 5.33333C12 3.12419 10.2091 1.33333 8 1.33333C5.79086 1.33333 4 3.12419 4 5.33333C4 7.54247 5.79086 9.33333 8 9.33333Z" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,
  },
  {
    value: '24/7',
    label: 'Support',
    icon: `
      <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M14.6667 4.66667L9 10.3333L5.66667 7L1.33333 11.3333" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M10.6667 4.66667H14.6667V8.66667" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,
  },
];

const MEGA_HERO_FEATURE_ICON = `
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M18.1675 8.33333C18.5481 10.2011 18.2768 12.1429 17.399 13.8348C16.5212 15.5268 15.0899 16.8667 13.3438 17.6311C11.5976 18.3955 9.64219 18.5382 7.80358 18.0353C5.96498 17.5325 4.35433 16.4145 3.24023 14.8679C2.12613 13.3212 1.57594 11.4394 1.68139 9.53616C1.78684 7.63295 2.54157 5.82341 3.81971 4.40931C5.09785 2.99521 6.82215 2.06203 8.70505 1.76538C10.588 1.46873 12.5157 1.82655 14.1667 2.77917" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M7.5 9.16667L10 11.6667L18.3333 3.33333" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`;

const MEGA_HERO_PROMO_ICON = `
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M18.3333 5.83333L11.25 12.9167L7.08333 8.75L1.66667 14.1667" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M13.3333 5.83333H18.3333V10.8333" stroke="currentColor" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"></path>
  </svg>
`;

function getRows(block) {
  return [...block.querySelectorAll(':scope > div')];
}

function getSettingContentNodes(rows, keyName) {
  const settingRow = rows.slice(1).find((row) => {
    const [keyColumn] = [...row.children];
    return keyColumn && keyColumn.textContent.trim().toLowerCase() === keyName;
  });

  if (!settingRow) {
    return [];
  }

  const [, valueColumn] = [...settingRow.children];

  if (!valueColumn) {
    return [];
  }

  const nodes = [...valueColumn.childNodes]
    .map((node) => node.cloneNode(true))
    .filter((node) => node.nodeType !== Node.TEXT_NODE || node.textContent.trim());

  if (nodes.length) {
    return nodes;
  }

  const text = valueColumn.textContent.trim();

  if (!text) {
    return [];
  }

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  return [paragraph];
}

function buildInlineIcon(markup, className) {
  const icon = document.createElement('span');
  icon.className = className;
  icon.setAttribute('aria-hidden', 'true');
  icon.append(document.createRange().createContextualFragment(markup));

  return icon;
}

function buildStats() {
  const metrics = document.createElement('div');
  metrics.className = 'mega-hero__metrics';

  MEGA_HERO_STATS.forEach((item, index) => {
    const metric = document.createElement('div');
    metric.className = 'mega-hero__metric';

    const summary = document.createElement('div');
    summary.className = 'mega-hero__metric-summary';
    summary.append(buildInlineIcon(item.icon, 'mega-hero__metric-icon'));

    const value = document.createElement('p');
    value.className = 'mega-hero__metric-value';
    value.textContent = item.value;

    const label = document.createElement('p');
    label.className = 'mega-hero__metric-label';
    label.textContent = item.label;

    summary.append(value);
    metric.append(summary, label);
    metrics.append(metric);

    if (index < MEGA_HERO_STATS.length - 1) {
      const divider = document.createElement('span');
      divider.className = 'mega-hero__metric-divider';
      divider.setAttribute('aria-hidden', 'true');
      metrics.append(divider);
    }
  });

  return metrics;
}

function buildPromoCard(contentNodes) {
  if (!contentNodes.length) {
    return null;
  }

  const card = document.createElement('div');
  card.className = 'mega-hero__promo-card';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'mega-hero__promo-icon-wrap';
  iconWrap.append(buildInlineIcon(MEGA_HERO_PROMO_ICON, 'mega-hero__promo-icon'));

  const content = document.createElement('div');
  content.className = 'mega-hero__promo-content';

  contentNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const paragraph = document.createElement('p');
      paragraph.textContent = node.textContent.trim();
      content.append(paragraph);
      return;
    }

    content.append(node);
  });

  const paragraphs = [...content.querySelectorAll(':scope > p')];

  paragraphs.forEach((paragraph, index) => {
    paragraph.classList.add(index === 0 ? 'mega-hero__promo-title' : 'mega-hero__promo-text');
  });

  card.append(iconWrap, content);

  return card;
}

function decorateFeatureList(list) {
  if (!list) {
    return null;
  }

  list.className = 'mega-hero__feature-list';

  [...list.children].forEach((item) => {
    item.className = 'mega-hero__feature-item';
    item.prepend(buildInlineIcon(MEGA_HERO_FEATURE_ICON, 'mega-hero__feature-icon'));
  });

  return list;
}

function decorateActions(links) {
  if (!links.length) {
    return null;
  }

  const actions = document.createElement('div');
  actions.className = 'mega-hero__actions';

  links.forEach((link, index) => {
    link.className = `mega-hero__button ${index === 0 ? 'mega-hero__button--primary' : 'mega-hero__button--secondary'}`;
    actions.append(link);
  });

  return actions;
}

export default function decorate(block) {
  const rows = getRows(block);
  const [row] = rows;
  const columns = row ? [...row.children] : [];
  const [mediaColumn, contentColumn] = columns;

  if (!contentColumn || !mediaColumn) {
    return;
  }

  const directChildren = [...contentColumn.children];
  const paragraphs = directChildren.filter((element) => element.tagName === 'P');
  const textParagraphs = paragraphs.filter((element) => !element.querySelector('a'));
  const [subheading, description] = textParagraphs;
  const actionsParagraph = paragraphs.find((element) => element.querySelector('a'));
  const heading = directChildren.find((element) => /^H[1-6]$/.test(element.tagName));
  const list = directChildren.find((element) => element.tagName === 'UL');
  const links = actionsParagraph ? [...actionsParagraph.querySelectorAll('a')] : [];
  const picture = mediaColumn.querySelector('picture');
  const promoContentNodes = getSettingContentNodes(rows, 'badge-content');

  const layout = document.createRange().createContextualFragment(`
    <div class="mega-hero__inner">
      <div class="mega-hero__media"></div>
      <div class="mega-hero__content"></div>
    </div>
  `);

  const content = layout.querySelector('.mega-hero__content');
  const media = layout.querySelector('.mega-hero__media');

  if (subheading) {
    subheading.className = 'mega-hero__eyebrow';
    content.append(subheading);
  }

  if (heading) {
    heading.classList.add('mega-hero__heading');
    content.append(heading);
  }

  const headingAccent = document.createElement('span');
  headingAccent.className = 'mega-hero__heading-accent';
  headingAccent.setAttribute('aria-hidden', 'true');
  content.append(headingAccent);

  if (description) {
    description.className = 'mega-hero__description';
    content.append(description);
  }

  const featureList = decorateFeatureList(list);
  if (featureList) {
    content.append(featureList);
  }

  const actions = decorateActions(links);
  if (actions) {
    content.append(actions);
  }

  content.append(buildStats());

  if (picture) {
    const imageFrame = document.createElement('div');
    imageFrame.className = 'mega-hero__image-frame';
    imageFrame.append(picture);

    const promoCard = buildPromoCard(promoContentNodes);

    if (promoCard) {
      media.append(imageFrame, promoCard);
    } else {
      media.append(imageFrame);
    }
  }

  block.replaceChildren(layout);
}