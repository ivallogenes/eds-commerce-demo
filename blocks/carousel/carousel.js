import { fetchPlaceholders } from '../../scripts/commerce.js';

function copyAnchorAttributes(source, target) {
  ['href', 'target', 'rel', 'title', 'aria-label'].forEach((attribute) => {
    if (source.hasAttribute(attribute)) {
      target.setAttribute(attribute, source.getAttribute(attribute));
    }
  });
}

function getRealSlideIndex(slides, slideIndex) {
  if (slideIndex < 0) {
    return slides.length - 1;
  }

  if (slideIndex >= slides.length) {
    return 0;
  }

  return slideIndex;
}

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function decorateShopByDefaultContent(block) {
  const container = block.closest('.carousel-container');
  const defaultContent = container?.querySelector(':scope > .default-content-wrapper');

  if (!defaultContent) {
    return;
  }

  const badgeSource = defaultContent.querySelector(':scope > p');

  if (!badgeSource) {
    return;
  }

  const badgeText = badgeSource.textContent.trim();
  badgeSource.remove();

  if (!badgeText || badgeText.toLowerCase() === 'no-badge') {
    return;
  }

  const badge = document.createElement('p');
  badge.className = 'slider_badge';
  badge.textContent = badgeText;
  defaultContent.prepend(badge);
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  const realSlideIndex = getRealSlideIndex(slides, slideIndex);
  const activeSlide = slides[realSlideIndex];

  activeSlide
    .querySelectorAll('a')
    .forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function createNavigationButtons(placeholders) {
  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('carousel-navigation-buttons');

  const previousButton = document.createElement('button');
  previousButton.type = 'button';
  previousButton.className = 'slide-prev';
  previousButton.setAttribute('aria-label', placeholders.previous || 'Previous Slide');

  const nextButton = document.createElement('button');
  nextButton.type = 'button';
  nextButton.className = 'slide-next';
  nextButton.setAttribute('aria-label', placeholders.next || 'Next Slide');

  buttonContainer.append(previousButton, nextButton);

  return buttonContainer;
}

function createAutoplayController(block, interval = 3000) {
  let intervalId;

  const start = () => {
    const slides = block.querySelectorAll('.carousel-slide');

    if (intervalId || slides.length < 2) {
      return;
    }

    intervalId = window.setInterval(() => {
      const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
      showSlide(block, currentIndex + 1);
    }, interval);
  };

  const stop = () => {
    if (!intervalId) {
      return;
    }

    window.clearInterval(intervalId);
    intervalId = undefined;
  };

  return { start, stop };
}

function bindEvents(block, autoplayController) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  const slidesWrapper = block.querySelector('.carousel-slides');

  if (!slidesWrapper) return;

  slideIndicators?.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  const previousButton = block.querySelector('.carousel-navigation-buttons .slide-prev');
  const nextButton = block.querySelector('.carousel-navigation-buttons .slide-next');

  previousButton?.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentIndex - 1);
  });

  nextButton?.addEventListener('click', () => {
    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);
    showSlide(block, currentIndex + 1);
  });

  slidesWrapper.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea, select')) {
      return;
    }

    const currentIndex = parseInt(block.dataset.activeSlide || '0', 10);

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        showSlide(block, currentIndex - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        showSlide(block, currentIndex + 1);
        break;
      case 'Home':
        event.preventDefault();
        showSlide(block, 0);
        break;
      case 'End':
        event.preventDefault();
        showSlide(block, block.querySelectorAll('.carousel-slide').length - 1);
        break;
      default:
        break;
    }
  });

  if (autoplayController) {
    block.addEventListener('mouseenter', () => autoplayController.stop());
    block.addEventListener('mouseleave', () => autoplayController.start());
  }

  const slideObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) updateActiveSlide(entry.target);
      });
    },
    { threshold: 0.5 },
  );
  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(
      `carousel-slide-${colIdx === 0 ? 'image' : 'content'}`,
    );
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

function createShopBySlide(row, slideIndex, carouselId) {
  const columns = row.querySelectorAll(':scope > div');
  const imageColumn = columns[0];
  const contentColumn = columns[1];
  const image = imageColumn?.querySelector('picture');
  const actionLink = contentColumn?.querySelector('a[href]');

  if (!imageColumn || !contentColumn || !image || !actionLink) {
    return createSlide(row, slideIndex, carouselId);
  }

  const slide = document.createElement('li');
  const slideLabel = actionLink.textContent.trim();
  const slideLink = document.createElement('a');
  const slideText = document.createElement('span');

  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide', 'carousel-slide--shop-by');
  slide.setAttribute('aria-label', slideLabel || `Slide ${slideIndex + 1}`);

  imageColumn.classList.add('carousel-slide-image', 'carousel-slide-image--shop-by');

  slideLink.className = 'carousel-slide-link';
  copyAnchorAttributes(actionLink, slideLink);

  if (!slideLink.hasAttribute('aria-label') && slideLabel) {
    slideLink.setAttribute('aria-label', slideLabel);
  }

  slideText.className = 'carousel-slide-label';
  slideText.textContent = slideLabel;

  slideLink.append(imageColumn, slideText);
  slide.append(slideLink);

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const isSingleSlide = rows.length < 2;
  const isShopByVariant = block.classList.contains('shop-by');

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute(
    'aria-roledescription',
    placeholders.carousel || 'Carousel',
  );

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  slidesWrapper.setAttribute('tabindex', '0');

  let slideIndicatorsNav;
  let slideIndicators;
  if (!isSingleSlide) {
    slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute(
      'aria-label',
      placeholders.carouselSlideControls || 'Carousel Slide Controls',
    );

    slideIndicatorsNav.append(createNavigationButtons(placeholders));

    if (!isShopByVariant) {
      slideIndicators = document.createElement('ol');
      slideIndicators.classList.add('carousel-slide-indicators');
      slideIndicatorsNav.append(slideIndicators);
    }

    container.append(slideIndicatorsNav);
  }

  if (isShopByVariant) {
    decorateShopByDefaultContent(block);
  }

  rows.forEach((row, idx) => {
    const slide = isShopByVariant
      ? createShopBySlide(row, idx, carouselId)
      : createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button" aria-label="${
        placeholders.showSlide || 'Show Slide'
      } ${idx + 1} ${placeholders.of || 'of'} ${rows.length}"></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  container.append(slidesWrapper);
  block.prepend(container);
  updateActiveSlide(slidesWrapper.querySelector('.carousel-slide'));

  if (!isSingleSlide) {
    const autoplayController = isShopByVariant ? null : createAutoplayController(block);
    bindEvents(block, autoplayController);
    autoplayController?.start();
  }
}
