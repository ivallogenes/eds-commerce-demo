import { fetchPlaceholders } from '../../scripts/commerce.js';

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

  if (!slideIndicators || !slidesWrapper) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
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

  block.addEventListener('mouseenter', () => autoplayController.stop());
  block.addEventListener('mouseleave', () => autoplayController.start());

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

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = Array.from(block.querySelectorAll(':scope > div'));
  const isSingleSlide = rows.length < 2;

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
  block.prepend(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute(
      'aria-label',
      placeholders.carouselSlideControls || 'Carousel Slide Controls',
    );
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(createNavigationButtons(placeholders), slideIndicators);
    container.append(slideIndicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
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
    const autoplayController = createAutoplayController(block);
    bindEvents(block, autoplayController);
    autoplayController.start();
  }
}
