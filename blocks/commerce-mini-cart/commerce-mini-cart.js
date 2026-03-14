import { render as provider } from '@dropins/storefront-cart/render.js';
import MiniCart from '@dropins/storefront-cart/containers/MiniCart.js';
import { events } from '@dropins/tools/event-bus.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import {
  InLineAlert,
  Icon,
  provider as UI,
  Button,
} from '@dropins/tools/components.js';
import { h } from '@dropins/tools/preact.js';

import createModal from '../modal/modal.js';
import createMiniPDP from '../../scripts/components/commerce-mini-pdp/commerce-mini-pdp.js';

// Initializers
import '../../scripts/initializers/cart.js';

import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, rootLink, getProductLink } from '../../scripts/commerce.js';

const MINI_CART_CLOSE_EVENT = 'commerce-mini-cart:close';

function renderSafeCartIcon() {
  const namespace = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(namespace, 'svg');

  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('aria-hidden', 'true');

  const cartBody = document.createElementNS(namespace, 'path');
  cartBody.setAttribute(
    'd',
    'M18.3601 18.16H6.5601L4.8801 3H2.3501M19.6701 19.59C19.6701 20.3687 19.0388 21 18.2601 21C17.4814 21 16.8501 20.3687 16.8501 19.59C16.8501 18.8113 17.4814 18.18 18.2601 18.18C19.0388 18.18 19.6701 18.8113 19.6701 19.59ZM7.42986 19.59C7.42986 20.3687 6.79858 21 6.01986 21C5.24114 21 4.60986 20.3687 4.60986 19.59C4.60986 18.8113 5.24114 18.18 6.01986 18.18C6.79858 18.18 7.42986 18.8113 7.42986 19.59Z',
  );
  cartBody.setAttribute('stroke', 'currentColor');
  cartBody.setAttribute('stroke-linejoin', 'round');
  cartBody.setAttribute('vector-effect', 'non-scaling-stroke');

  const cartHandle = document.createElementNS(namespace, 'path');
  cartHandle.setAttribute('d', 'M5.25 6.37L20.89 8.06L20.14 14.8H6.19');
  cartHandle.setAttribute('stroke', 'currentColor');
  cartHandle.setAttribute('stroke-linejoin', 'round');
  cartHandle.setAttribute('vector-effect', 'non-scaling-stroke');

  svg.append(cartBody, cartHandle);

  return svg;
}

// Renders the mini-cart empty state with a safe inline icon that avoids the drop-in SVG ID collision,
// which results in all cart icons on "add to cart" btns disappearing after empty mini cart is opened and closed.
function renderEmptyCartState(ctx, { emptyCartHeading, emptyCartCTA, startShoppingURL }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'cart-empty-cart';

  const content = document.createElement('div');
  content.className = 'cart-empty-cart__wrapper dropin-illustrated-message';
  content.setAttribute('data-testid', 'cart-empty-cart');

  const card = document.createElement('div');
  card.className = 'dropin-card dropin-card--secondary';

  const icon = renderSafeCartIcon();
  icon.classList.add('cart-empty-cart__icon', 'dropin-illustrated-message__icon');

  const heading = document.createElement('h2');
  heading.className = 'dropin-illustrated-message__heading';
  heading.textContent = emptyCartHeading;

  card.append(icon, heading);

  if (startShoppingURL) {
    const action = document.createElement('div');
    action.className = 'dropin-illustrated-message__action';

    UI.render(Button, {
      children: emptyCartCTA,
      size: 'medium',
      variant: 'primary',
      href: rootLink(startShoppingURL),
    })(action);

    card.append(action);
  }

  content.append(card);
  wrapper.append(content);

  ctx.replaceWith(wrapper);
}

export default async function decorate(block) {
  const {
    'start-shopping-url': startShoppingURL = '',
    'cart-url': cartURL = '',
    'checkout-url': checkoutURL = '',
    'enable-item-quantity-update': enableUpdateItemQuantity = 'true',
    'enable-updating-product': enableUpdatingProduct = 'false',
    'undo-remove-item': undo = 'false',
  } = readBlockConfig(block);

  // Get translations for custom messages
  const placeholders = await fetchPlaceholders();

  const MESSAGES = {
    ADDED: placeholders?.Global?.MiniCartAddedMessage,
    UPDATED: placeholders?.Global?.MiniCartUpdatedMessage,
  };

  const closeMiniCartLabel = placeholders?.Global?.Close || 'Close mini cart';
  const emptyCartHeading = placeholders?.Global?.MiniCartEmptyHeading || 'Your cart is empty';
  const emptyCartCTA = placeholders?.Global?.MiniCartStartShopping || 'Start shopping';

  // Modal state
  let currentModal = null;
  let currentCartNotification = null;

  // Create a container for the update message
  const updateMessage = document.createElement('div');
  updateMessage.className = 'commerce-mini-cart__update-message';

  // Create shadow wrapper
  const shadowWrapper = document.createElement('div');
  shadowWrapper.className = 'commerce-mini-cart__message-wrapper';
  shadowWrapper.appendChild(updateMessage);

  const showMessage = (message) => {
    updateMessage.textContent = message;
    updateMessage.classList.add('commerce-mini-cart__update-message--visible');
    shadowWrapper.classList.add('commerce-mini-cart__message-wrapper--visible');
    setTimeout(() => {
      updateMessage.classList.remove(
        'commerce-mini-cart__update-message--visible',
      );
      shadowWrapper.classList.remove(
        'commerce-mini-cart__message-wrapper--visible',
      );
    }, 3000);
  };

  // Handle Edit Button Click
  async function handleEditButtonClick(cartItem) {
    try {
      // Create mini PDP content
      const miniPDPContent = await createMiniPDP(
        cartItem,
        async (_updateData) => {
          const productName = cartItem.name
            || cartItem.product?.name
            || placeholders?.Global?.CartUpdatedProductName;
          const message = placeholders?.Global?.CartUpdatedProductMessage?.replace(
            '{product}',
            productName,
          );

          // Show message in the main cart page
          const cartNotification = document.querySelector(
            '.cart__notification',
          );
          if (cartNotification) {
            // Clear any existing cart notifications
            currentCartNotification?.remove();

            currentCartNotification = await UI.render(InLineAlert, {
              heading: message,
              type: 'success',
              variant: 'primary',
              icon: h(Icon, { source: 'CheckWithCircle' }),
              'aria-live': 'assertive',
              role: 'alert',
              onDismiss: () => {
                currentCartNotification?.remove();
              },
            })(cartNotification);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
              currentCartNotification?.remove();
            }, 5000);
          }

          // Also trigger message in the mini-cart
          showMessage(message);
        },
        () => {
          if (currentModal) {
            currentModal.removeModal();
            currentModal = null;
          }
        },
      );

      currentModal = await createModal([miniPDPContent]);

      if (currentModal.block) {
        currentModal.block.setAttribute('id', 'mini-pdp-modal');
      }

      currentModal.showModal();
    } catch (error) {
      console.error('Error opening mini PDP modal:', error);

      // Show error message using mini-cart's message system
      showMessage(
        placeholders?.Global?.ProductLoadError,
      );
    }
  }

  // Add event listeners for cart updates
  events.on('cart/product/added', () => showMessage(MESSAGES.ADDED), {
    eager: true,
  });
  events.on('cart/product/updated', () => showMessage(MESSAGES.UPDATED), {
    eager: true,
  });

  // Prevent mini cart from closing when undo is enabled
  if (undo === 'true') {
    // Add event listener to prevent event bubbling from remove buttons
    block.addEventListener('click', (e) => {
      // Check if click is on a remove button or within an undo-related element
      const isRemoveButton = e.target.closest('[class*="remove"]')
        || e.target.closest('[data-testid*="remove"]')
        || e.target.closest('[class*="undo"]')
        || e.target.closest('[data-testid*="undo"]');

      if (isRemoveButton) {
        // Stop the event from bubbling up to document level
        e.stopPropagation();
      }
    });
  }

  block.innerHTML = '';

  // Render MiniCart
  const createProductLink = (product) => getProductLink(product.url.urlKey, product.topLevelSku);
  await provider.render(MiniCart, {
    routeEmptyCartCTA: startShoppingURL ? () => rootLink(startShoppingURL) : undefined,
    routeCart: cartURL ? () => rootLink(cartURL) : undefined,
    routeCheckout: checkoutURL ? () => rootLink(checkoutURL) : undefined,
    routeProduct: createProductLink,
    enableQuantityUpdate: enableUpdateItemQuantity === 'true',
    undo: undo === 'true',
    slots: {
      Heading: (ctx) => {
        const miniCartTitle = 'Shopping Cart';
        const miniCartSubtitle = 'Free shipping on orders over $50';

        const fragment = document.createRange().createContextualFragment(`
          <section class="mini-cart-heading">
            <div class="mini-cart-heading__copy">
              <p class="mini-cart-heading__title"></p>
              <p class="mini-cart-heading__subtitle"></p>
            </div>
            <button type="button" class="commerce-mini-cart__close-button" aria-label="${closeMiniCartLabel}">
              <span class="commerce-mini-cart__close-icon" aria-hidden="true"></span>
            </button>
          </section>
        `);

        const root = fragment.firstElementChild;
        const title = root.querySelector('.mini-cart-heading__title');
        const subtitle = root.querySelector('.mini-cart-heading__subtitle');
        const closeButton = root.querySelector('.commerce-mini-cart__close-button');

        title.textContent = ctx.count ? `${miniCartTitle} (${ctx.count})` : '';
        subtitle.textContent = ctx.count ? `${miniCartSubtitle}` : '';

        closeButton?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          document.dispatchEvent(new CustomEvent(MINI_CART_CLOSE_EVENT));
        });

        ctx.replaceWith(root);
      },
      EmptyCart: (ctx) => {
        renderEmptyCartState(ctx, {
          emptyCartHeading,
          emptyCartCTA,
          startShoppingURL,
        });
      },
      Thumbnail: (ctx) => {
        const { item, defaultImageProps } = ctx;
        const anchorWrapper = document.createElement('a');
        anchorWrapper.href = createProductLink(item);

        tryRenderAemAssetsImage(ctx, {
          alias: item.sku,
          imageProps: defaultImageProps,
          wrapper: anchorWrapper,

          params: {
            width: defaultImageProps.width,
            height: defaultImageProps.height,
          },
        });

        if (item?.itemType === 'ConfigurableCartItem' && enableUpdatingProduct === 'true') {
          const editLinkContainer = document.createElement('div');
          editLinkContainer.className = 'cart-item-edit-container';

          const editLink = document.createElement('div');
          editLink.className = 'cart-item-edit-link';

          UI.render(Button, {
            children: placeholders?.Global?.CartEditButton,
            variant: 'tertiary',
            size: 'medium',
            icon: h(Icon, { source: 'Edit' }),
            onClick: () => handleEditButtonClick(item),
          })(editLink);

          editLinkContainer.appendChild(editLink);
          ctx.appendChild(editLinkContainer);
        }
      },
    },
  })(block);

  // Find the products container and add the message div at the top
  const productsContainer = block.querySelector('.cart-mini-cart__products');
  if (productsContainer) {
    productsContainer.insertBefore(shadowWrapper, productsContainer.firstChild);
  } else {
    console.info('Products container not found, appending message to block');
    block.appendChild(shadowWrapper);
  }

  return block;
}
