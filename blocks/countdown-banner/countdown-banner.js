import { readBlockConfig } from '../../scripts/aem.js';

const BUTTON_ICON = `
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M5.33333 4.66667V4C5.33333 2.52724 6.52724 1.33333 8 1.33333C9.47276 1.33333 10.6667 2.52724 10.6667 4V4.66667" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"></path>
    <path d="M2.66667 5.33333H13.3333L12.6101 13.2978C12.5488 13.9717 11.9834 14.4867 11.3068 14.4867H4.69319C4.01664 14.4867 3.45122 13.9717 3.38996 13.2978L2.66667 5.33333Z" stroke="currentColor" stroke-width="1.33333" stroke-linejoin="round"></path>
  </svg>
`;

const DEFAULT_CONFIG = Object.freeze({
  badge: '',
  heading: '',
  description: '',
  'button-text': '',
  'button-link': '',
  'promo-label': [],
  'promotion-duration': '0',
  'background-color': '#53A257',
  'font-color': '#ffffff',
});

const COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const COUNTDOWN_STORAGE_KEY_PREFIX = 'countdown-banner:';
const COUNTDOWN_INTERVAL = Symbol('countdown-banner-interval');

function normalizeLines(value) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeColor(value, fallback) {
  const candidate = typeof value === 'string' ? value.trim() : '';
  return COLOR_PATTERN.test(candidate) ? candidate : fallback;
}

function parseDurationHours(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function createIcon(markup, className) {
  const icon = document.createElement('span');
  icon.className = className;
  icon.setAttribute('aria-hidden', 'true');
  icon.append(document.createRange().createContextualFragment(markup));
  return icon;
}

function createButton(buttonText, buttonLink) {
  if (!buttonText) {
    return null;
  }

  const element = buttonLink ? document.createElement('a') : document.createElement('button');
  element.className = 'countdown-banner__button';

  if (buttonLink) {
    element.href = buttonLink;
  } else {
    element.type = 'button';
  }

  const label = document.createElement('span');
  label.className = 'countdown-banner__button-text';
  label.textContent = buttonText;

  element.append(createIcon(BUTTON_ICON, 'countdown-banner__button-icon'), label);

  return element;
}

function getMetadataTimestamp() {
  const metaNames = ['article:modified_time', 'last-modified', 'publish-date', 'date'];
  const metaContent = metaNames
    .map((name) => document.head.querySelector(`meta[property="${name}"], meta[name="${name}"]`)?.content)
    .find(Boolean);

  const parsed = metaContent ? Date.parse(metaContent) : Number.NaN;
  return Number.isNaN(parsed) ? null : parsed;
}

function getDocumentTimestamp() {
  const parsed = Date.parse(document.lastModified);
  return Number.isNaN(parsed) ? null : parsed;
}

function hashValue(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function createCountdownStorageKey(config, promoLines, durationHours) {
  const signature = JSON.stringify([
    window.location.pathname,
    durationHours,
    config.badge,
    config.heading,
    config.description,
    config['button-text'],
    config['button-link'],
    promoLines,
  ]);

  return `${COUNTDOWN_STORAGE_KEY_PREFIX}${hashValue(signature)}`;
}

function readStoredCountdownState(storageKey) {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue);
    const hasValidShape = Number.isFinite(parsed?.startTimestamp)
      && Number.isFinite(parsed?.endTimestamp)
      && Number.isInteger(parsed?.durationHours);

    return hasValidShape ? parsed : null;
  } catch (error) {
    return null;
  }
}

function writeStoredCountdownState(storageKey, state) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    // Ignore storage access failures and continue with the current session state.
  }
}

function resolveCountdownState(storageKey, durationHours) {
  const metaTimestamp = getMetadataTimestamp();
  const storedState = readStoredCountdownState(storageKey);

  if (storedState && storedState.durationHours === durationHours) {
    const shouldResetFromMetadata = Number.isFinite(metaTimestamp)
      && storedState.metaTimestamp !== metaTimestamp;

    if (!shouldResetFromMetadata) {
      return storedState;
    }
  }

  const startTimestamp = metaTimestamp ?? getDocumentTimestamp() ?? Date.now();
  const countdownState = {
    durationHours,
    metaTimestamp,
    startTimestamp,
    endTimestamp: startTimestamp + (durationHours * 60 * 60 * 1000),
  };

  writeStoredCountdownState(storageKey, countdownState);

  return countdownState;
}

function getRemainingTime(endTimestamp) {
  const remainingMs = Math.max(endTimestamp - Date.now(), 0);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
  };
}

function updateTimer(timer, endTimestamp) {
  const parts = getRemainingTime(endTimestamp);

  timer.querySelector('[data-unit="hours"]').textContent = parts.hours;
  timer.querySelector('[data-unit="minutes"]').textContent = parts.minutes;
  timer.querySelector('[data-unit="seconds"]').textContent = parts.seconds;
  timer.setAttribute('aria-label', `${parts.hours} hours, ${parts.minutes} minutes, ${parts.seconds} seconds remaining`);

  return parts.hours === '00' && parts.minutes === '00' && parts.seconds === '00';
}

function createPromoCard(lines) {
  if (!lines.length) {
    return null;
  }

  const [value = '', title = '', description = ''] = lines;
  const promo = document.createElement('div');
  promo.className = 'countdown-banner__promo';

  const promoValue = document.createElement('p');
  promoValue.className = 'countdown-banner__promo-value';
  promoValue.textContent = value;

  const divider = document.createElement('span');
  divider.className = 'countdown-banner__promo-divider';
  divider.setAttribute('aria-hidden', 'true');

  const promoCopy = document.createElement('div');
  promoCopy.className = 'countdown-banner__promo-copy';

  const promoHeading = document.createElement('p');
  promoHeading.className = 'countdown-banner__promo-heading';
  promoHeading.textContent = title;

  const promoText = document.createElement('p');
  promoText.className = 'countdown-banner__promo-text';
  promoText.textContent = description;

  promoCopy.append(promoHeading, promoText);
  promo.append(promoValue, divider, promoCopy);

  return promo;
}

/**
 * Builds the countdown banner block.
 * @param {Element} block The countdown banner block element.
 */
export default function decorate(block) {
  const config = {
    ...DEFAULT_CONFIG,
    ...readBlockConfig(block),
  };
  const backgroundColor = normalizeColor(config['background-color'], DEFAULT_CONFIG['background-color']);
  const fontColor = normalizeColor(config['font-color'], DEFAULT_CONFIG['font-color']);
  const promoLines = normalizeLines(config['promo-label']);
  const durationHours = parseDurationHours(config['promotion-duration']);
  const storageKey = createCountdownStorageKey(config, promoLines, durationHours);

  if (block[COUNTDOWN_INTERVAL]) {
    window.clearInterval(block[COUNTDOWN_INTERVAL]);
    delete block[COUNTDOWN_INTERVAL];
  }

  const fragment = document.createRange().createContextualFragment(`
    <div class="countdown-banner__inner">
      <div class="countdown-banner__content"></div>
      <div class="countdown-banner__aside">
        <div class="countdown-banner__timer" role="timer" aria-live="off">
          <div class="countdown-banner__time-part">
            <p class="countdown-banner__time-value" data-unit="hours">00</p>
            <p class="countdown-banner__time-label">Hours</p>
          </div>
          <div class="countdown-banner__time-part">
            <p class="countdown-banner__time-value" data-unit="minutes">00</p>
            <p class="countdown-banner__time-label">Minutes</p>
          </div>
          <div class="countdown-banner__time-part">
            <p class="countdown-banner__time-value" data-unit="seconds">00</p>
            <p class="countdown-banner__time-label">Seconds</p>
          </div>
        </div>
      </div>
    </div>
  `);

  const content = fragment.querySelector('.countdown-banner__content');
  const aside = fragment.querySelector('.countdown-banner__aside');
  const timer = fragment.querySelector('.countdown-banner__timer');

  if (config.badge) {
    const badge = document.createElement('p');
    badge.className = 'countdown-banner__badge';
    badge.textContent = config.badge;
    content.append(badge);
  }

  if (config.heading) {
    const heading = document.createElement('h2');
    heading.className = 'countdown-banner__heading';
    heading.textContent = config.heading;
    content.append(heading);
  }

  if (config.description) {
    const description = document.createElement('p');
    description.className = 'countdown-banner__description';
    description.textContent = config.description;
    content.append(description);
  }

  const button = createButton(config['button-text'], config['button-link']);
  if (button) {
    content.append(button);
  }

  const promoCard = createPromoCard(promoLines);
  if (promoCard) {
    aside.append(promoCard);
  }

  block.style.setProperty('--countdown-banner-background', backgroundColor);
  block.style.setProperty('--countdown-banner-font-color', fontColor);
  block.dataset.promotionDurationHours = String(durationHours);

  const { startTimestamp, endTimestamp } = resolveCountdownState(storageKey, durationHours);

  block.dataset.utcStartTime = new Date(startTimestamp).toISOString();
  block.dataset.utcEndTime = new Date(endTimestamp).toISOString();

  block.replaceChildren(fragment);

  const stop = updateTimer(timer, endTimestamp);
  if (stop) {
    return;
  }

  block[COUNTDOWN_INTERVAL] = window.setInterval(() => {
    if (!block.isConnected) {
      window.clearInterval(block[COUNTDOWN_INTERVAL]);
      delete block[COUNTDOWN_INTERVAL];
      return;
    }

    const complete = updateTimer(timer, endTimestamp);

    if (complete) {
      window.clearInterval(block[COUNTDOWN_INTERVAL]);
      delete block[COUNTDOWN_INTERVAL];
    }
  }, 1000);
}