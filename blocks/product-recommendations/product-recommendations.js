// Dropin Tools
import { events } from '@dropins/tools/event-bus.js';
import { getConfigValue } from '@dropins/tools/lib/aem/configs.js';

// Dropin Components
import { Button, Icon, provider as UI } from '@dropins/tools/components.js';
import { tryRenderAemAssetsImage } from '@dropins/tools/lib/aem/assets.js';
import { h } from '@dropins/tools/preact.js';

// Cart Dropin
import * as cartApi from '@dropins/storefront-cart/api.js';

// Recommendations Dropin
import ProductList from '@dropins/storefront-recommendations/containers/ProductList.js';
import { render as provider } from '@dropins/storefront-recommendations/render.js';
import { publishRecsItemAddToCartClick } from '@dropins/storefront-recommendations/api.js';

// Wishlist Dropin
import { WishlistToggle } from '@dropins/storefront-wishlist/containers/WishlistToggle.js';
import { render as wishlistRender } from '@dropins/storefront-wishlist/render.js';

// Block-level
import { readBlockConfig } from '../../scripts/aem.js';
import { fetchPlaceholders, getProductLink } from '../../scripts/commerce.js';

// Initializers
import '../../scripts/initializers/recommendations.js';
import '../../scripts/initializers/wishlist.js';

const isMobile = window.matchMedia('only screen and (max-width: 900px)').matches;

/**
 * Gets product view history from localStorage
 * @param {string} storeViewCode - The store view code
 * @returns {Array} - Array of view history items
 */
function getProductViewHistory(storeViewCode) {
  try {
    const viewHistory = window.localStorage.getItem(`${storeViewCode}:productViewHistory`) || '[]';
    return JSON.parse(viewHistory);
  } catch (e) {
    window.localStorage.removeItem(`${storeViewCode}:productViewHistory`);
    console.error('Error parsing product view history', e);
    return [];
  }
}

/**
 * Gets purchase history from localStorage
 * @param {string} storeViewCode - The store view code
 * @returns {Array} - Array of purchase history items
 */
function getPurchaseHistory(storeViewCode) {
  try {
    const purchaseHistory = window.localStorage.getItem(`${storeViewCode}:purchaseHistory`) || '[]';
    return JSON.parse(purchaseHistory);
  } catch (e) {
    window.localStorage.removeItem(`${storeViewCode}:purchaseHistory`);
    console.error('Error parsing purchase history', e);
    return [];
  }
}

function createCarouselNavigationButton(direction, label) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = direction === 'previous' ? 'slide-prev' : 'slide-next';
  button.setAttribute('aria-label', label);
  return button;
}

function getCarouselScrollAmount(track) {
  const firstSlide = track.firstElementChild;

  if (!firstSlide) {
    return track.clientWidth;
  }

  const gapValue = window.getComputedStyle(track).gap || '0';
  const gap = parseFloat(gapValue) || 0;

  return firstSlide.getBoundingClientRect().width + gap;
}

function updateCarouselNavigationState(track, previousButton, nextButton) {
  const maxScrollLeft = track.scrollWidth - track.clientWidth;
  const currentScrollLeft = Math.round(track.scrollLeft);

  previousButton.disabled = currentScrollLeft <= 0;
  nextButton.disabled = currentScrollLeft >= Math.max(0, Math.round(maxScrollLeft) - 1);
}

function decorateRecommendationsCarousel(wrapper, labels) {
  wrapper.recommendationsCarouselCleanup?.();

  const header = wrapper.querySelector('.recommendations__header');
  const section = wrapper.querySelector('.recommendations__list .recommendations-product-list');
  const heading = section?.querySelector('.recommendations-product-list__heading');
  const track = section?.querySelector('.recommendations-carousel__content');

  if (!header || !section || !track || track.children.length < 2) {
    header?.replaceChildren();
    wrapper.classList.remove('recommendations--with-carousel-controls');
    wrapper.recommendationsCarouselCleanup = null;
    return;
  }

  wrapper.classList.add('recommendations--with-carousel-controls');

  const controls = document.createElement('div');
  controls.className = 'recommendations-carousel-controls';

  const headingText = heading?.textContent?.trim();
  const headingElement = document.createElement('div');
  headingElement.className = 'recommendations-carousel-heading';
  headingElement.textContent = headingText || labels?.Recommendations?.ProductList?.heading || 'You might also like';

  const navigation = document.createElement('div');
  navigation.className = 'carousel-navigation-buttons';

  const previousButton = createCarouselNavigationButton(
    'previous',
    labels.previous || 'Previous Slide',
  );
  const nextButton = createCarouselNavigationButton(
    'next',
    labels.next || 'Next Slide',
  );

  navigation.append(previousButton, nextButton);
  controls.append(headingElement, navigation);
  header.replaceChildren(controls);

  const scrollTrack = (direction) => {
    track.scrollBy({
      left: getCarouselScrollAmount(track) * direction,
      behavior: 'smooth',
    });
  };

  const handlePreviousClick = () => scrollTrack(-1);
  const handleNextClick = () => scrollTrack(1);
  const handleScroll = () => {
    updateCarouselNavigationState(track, previousButton, nextButton);
  };
  const handleResize = () => {
    updateCarouselNavigationState(track, previousButton, nextButton);
  };

  previousButton.addEventListener('click', handlePreviousClick);
  nextButton.addEventListener('click', handleNextClick);
  track.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize);

  updateCarouselNavigationState(track, previousButton, nextButton);

  wrapper.recommendationsCarouselCleanup = () => {
    previousButton.removeEventListener('click', handlePreviousClick);
    nextButton.removeEventListener('click', handleNextClick);
    track.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  };
}

function observeRecommendationsCarousel(list, wrapper, labels) {
  let frame = null;

  const scheduleDecoration = () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
    }

    frame = window.requestAnimationFrame(() => {
      frame = null;
      decorateRecommendationsCarousel(wrapper, labels);
    });
  };

  const observer = new MutationObserver(() => {
    scheduleDecoration();
  });

  observer.observe(list, {
    childList: true,
    subtree: true,
  });

  scheduleDecoration();

  return () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
    }

    observer.disconnect();
    wrapper.recommendationsCarouselCleanup?.();
    wrapper.recommendationsCarouselCleanup = null;
  };
}

export default async function decorate(block) {
  const labels = await fetchPlaceholders();

  // Hide configuration rows if they exist
  const children = [...block.children];
  children.forEach((child) => {
    child.style.display = 'none';
  });

  // Configuration
  const { currentsku, recid } = readBlockConfig(block);

  // Layout
  const fragment = document.createRange().createContextualFragment(`
    <div class="recommendations__wrapper">
      <div class="recommendations__header"></div>
      <div class="recommendations__list"></div>
    </div>
  `);

  const $list = fragment.querySelector('.recommendations__list');
  const $wrapper = fragment.querySelector('.recommendations__wrapper');
  const stopObservingCarousel = observeRecommendationsCarousel($list, $wrapper, labels);

  block.appendChild(fragment);

  let visibility = !isMobile;
  let isLoading = false;
  let loadTimeout = null;

  async function loadRecommendation(
    context,
    isVisible,
    container,
    forceReload = false,
  ) {
    // Only load once the recommendation becomes visible
    if (!isVisible) {
      return;
    }

    // Prevent multiple simultaneous loads
    if (isLoading) {
      return;
    }

    // Only proceed if container is empty or force reload is requested
    if (container.children.length > 0 && !forceReload) {
      return;
    }

    isLoading = true;

    // Clear container if reloading
    if (forceReload) {
      container.innerHTML = '';
    }

    const storeViewCode = getConfigValue('headers.cs.Magento-Store-View-Code');
    const createProductLink = (item) => getProductLink(item.urlKey, item.sku);

    // Get product view history
    context.userViewHistory = getProductViewHistory(storeViewCode);

    // Get purchase history
    context.userPurchaseHistory = getPurchaseHistory(storeViewCode);

    let recommendationsData = null;

    // Get data from the event bus to set publish events
    events.on(
      'recommendations/data',
      (data) => {
        recommendationsData = data;
        if (data?.items?.length) {
          recommendationsData = data;
        }
      },
      { eager: true },
    );

    try {
      await Promise.all([
        provider.render(ProductList, {
          routeProduct: createProductLink,
          recId: recid,
          currentSku: currentsku || context.currentSku,
          userViewHistory: context.userViewHistory,
          userPurchaseHistory: context.userPurchaseHistory,
          slots: {
            Footer: (ctx) => {
              const wrapper = document.createElement('div');
              wrapper.className = 'footer__wrapper';

              const addToCart = document.createElement('div');
              addToCart.className = 'footer__button--add-to-cart';
              wrapper.appendChild(addToCart);

              if (ctx.item.itemType === 'SimpleProductView') {
                // Add to Cart Button
                UI.render(Button, {
                  children: labels.Global?.AddProductToCart,
                  icon: h(Icon, { source: 'Cart' }),
                  onClick: (event) => {
                    cartApi.addProductsToCart([
                      { sku: ctx.item.sku, quantity: 1 },
                    ]);
                    // Prevent the click event from bubbling up to the parent span
                    // to avoid triggering the recs-item-click event
                    event.stopPropagation();
                    // Publish ACDL event for add to cart click
                    const recommendationUnit = recommendationsData?.find(
                      (unit) => unit.items?.some(
                        (unitItem) => unitItem.sku === ctx.item.sku,
                      ),
                    );
                    publishRecsItemAddToCartClick({
                      recommendationUnit,
                      pagePlacement: 'product-list',
                      yOffsetTop: addToCart.getBoundingClientRect().top ?? 0,
                      yOffsetBottom:
                        addToCart.getBoundingClientRect().bottom ?? 0,
                      productId: ctx.index,
                    });
                  },
                  variant: 'primary',
                })(addToCart);
              } else {
                // Select Options Button
                UI.render(Button, {
                  children:
                    labels.Global?.SelectProductOptions,
                  href: createProductLink(ctx.item),
                  variant: 'tertiary',
                })(addToCart);
              }

              // Wishlist Button
              const $wishlistToggle = document.createElement('div');
              $wishlistToggle.classList.add('footer__button--wishlist-toggle');

              // Render Icon
              wishlistRender.render(WishlistToggle, {
                product: ctx.item,
              })($wishlistToggle);

              // Append to Cart Item
              wrapper.appendChild($wishlistToggle);

              ctx.replaceWith(wrapper);
            },

            Thumbnail: (ctx) => {
              const { item, defaultImageProps } = ctx;
              const wrapper = document.createElement('a');
              wrapper.href = createProductLink(item);

              tryRenderAemAssetsImage(ctx, {
                alias: item.sku,
                imageProps: defaultImageProps,
                wrapper,

                params: {
                  width: defaultImageProps.width,
                  height: defaultImageProps.height,
                },
              });
            },
          },
        })($list),
      ]);
    } finally {
      isLoading = false;
    }
  }

  const context = {};
  // Debounced loader to prevent excessive API calls
  function debouncedLoadRecommendation(forceReload = false) {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }

    loadTimeout = setTimeout(() => {
      loadRecommendation(context, visibility, $list, forceReload);
    }, 300); // 300ms debounce
  }

  // Track previous context values to detect significant changes
  let previousContext = {};

  function shouldReloadRecommendations(newContext) {
    // Check if significant context changes occurred that warrant reloading recommendations
    const significantChanges = ['currentSku', 'pageType', 'category'];

    return significantChanges.some(
      (key) => newContext[key] !== previousContext[key] && newContext[key] !== undefined,
    );
  }

  function updateContext(updates) {
    const hasSignificantChanges = shouldReloadRecommendations({
      ...context,
      ...updates,
    });

    // Update context
    Object.assign(context, updates);

    // Update previous context for next comparison
    previousContext = { ...context };

    // Load or reload recommendations based on whether significant changes occurred
    if (hasSignificantChanges && $list.children.length > 0) {
      // Force reload if recommendations already exist and context changed significantly
      debouncedLoadRecommendation(true);
    } else {
      // Initial load or minor context changes
      debouncedLoadRecommendation(false);
    }
  }

  function handleProductChanges({ productContext }) {
    updateContext({ currentSku: productContext?.sku });
  }

  function handleCategoryChanges({ categoryContext }) {
    updateContext({ category: categoryContext?.name });
  }

  function handlePageTypeChanges({ pageContext }) {
    updateContext({ pageType: pageContext?.pageType });
  }

  function handleCartChanges({ shoppingCartContext }) {
    const cartSkus = shoppingCartContext?.totalQuantity === 0
      ? []
      : shoppingCartContext?.items?.map(({ product }) => product.sku);
    updateContext({ cartSkus });
  }

  window.adobeDataLayer.push((dl) => {
    dl.addEventListener('adobeDataLayer:change', handlePageTypeChanges, { path: 'pageContext' });
    dl.addEventListener('adobeDataLayer:change', handleProductChanges, { path: 'productContext' });
    dl.addEventListener('adobeDataLayer:change', handleCategoryChanges, { path: 'categoryContext' });
    dl.addEventListener('adobeDataLayer:change', handleCartChanges, { path: 'shoppingCartContext' });
  });

  if (isMobile) {
    const section = block.closest('.section');
    const inViewObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visibility = true;
          debouncedLoadRecommendation(false);
          inViewObserver.disconnect();
        }
      });
    });
    inViewObserver.observe(section);
  }

  block.cleanupRecommendationsCarousel = stopObservingCarousel;
}
