import { createOptimizedPicture } from '../../scripts/aem.js';

function copyAnchorAttributes(source, target) {
  ['href', 'target', 'rel', 'title', 'aria-label'].forEach((attribute) => {
    if (source.hasAttribute(attribute)) {
      target.setAttribute(attribute, source.getAttribute(attribute));
    }
  });
}

function wrapImageWithLink(imageContainer, sourceLink, fallbackLabel) {
  const picture = imageContainer.querySelector('picture');

  if (!picture || picture.closest('a')) {
    return;
  }

  const imageLink = document.createElement('a');
  imageLink.className = 'cards-card-image-link';
  copyAnchorAttributes(sourceLink, imageLink);

  if (!imageLink.hasAttribute('aria-label') && fallbackLabel) {
    imageLink.setAttribute('aria-label', fallbackLabel);
  }

  imageContainer.insertBefore(imageLink, picture);
  imageLink.append(picture);
}

/** Decorate the cards (shop-by) by variant */
function decorateShopByCard(card) {
  const imageContainer = card.querySelector('.cards-card-image');
  const body = card.querySelector('.cards-card-body');

  if (!imageContainer || !body) {
    return;
  }

  const bodyChildren = [...body.children];
  const actionLink = body.querySelector('a[href]');
  const actionContainer = bodyChildren.find((element) => actionLink && element.contains(actionLink));
  const textParagraphs = bodyChildren.filter((element) => element.tagName === 'P'
    && !element.querySelector('a[href]'));
  const [badge, heading, description] = textParagraphs;

  card.classList.add('cards-card--shop-by');
  imageContainer.classList.add('cards-card-image--shop-by');
  body.classList.add('cards-card-body--shop-by');

  const hideBadge = badge?.textContent?.trim().toLowerCase() === 'no-badge';

  if (badge && hideBadge) {
    badge.remove();
  } else if (badge) {
    badge.classList.add('image_badge');
    imageContainer.append(badge);
  }

  if (heading) {
    heading.classList.add('cards-card-heading');
  }

  if (description) {
    description.classList.add('cards-card-description');
  }

  if (actionContainer) {
    actionContainer.classList.add('cards-card-action');
  }

  if (actionLink) {
    actionLink.classList.add('cards-card-link');
    wrapImageWithLink(imageContainer, actionLink, heading?.textContent?.trim() || actionLink.textContent?.trim());
  }
}

export default function decorate(block) {
  const isShopByVariant = block.classList.contains('shop-by');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));

  if (isShopByVariant) {
    [...ul.children].forEach((card) => decorateShopByCard(card));
  }

  block.replaceChildren(ul);
}
