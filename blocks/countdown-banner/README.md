# Countdown Banner

Config-driven promotional banner with a stable UTC countdown.

## Supported Config

- `badge`: Small label shown above the heading.
- `heading`: Main promo heading.
- `description`: Supporting copy below the heading.
- `button-text`: Text rendered in the CTA button.
- `button-link`: Optional URL for the CTA. If omitted, the block renders a non-link button for visual-only use.
- `promo-label`: Up to three lines used in the promo card on the right side.
- `promotion-duration`: Integer duration in hours, starting from the resolved page start timestamp.
- `background-color`: Hex color applied to the banner background.
- `font-color`: Hex color applied to text and used as the CTA background.

## Behavior

- The block resolves its start timestamp from page metadata first and falls back to `document.lastModified` when metadata is unavailable.
- The resolved countdown state is persisted in `localStorage` per page and block configuration, so reloads or repeated decoration do not restart the timer.
- If the page metadata timestamp changes after a republish, the block resets the stored countdown for that page/configuration.
- The resolved UTC start and end timestamps are written to `data-utc-start-time` and `data-utc-end-time` on the block.
- The timer updates every second and stops at `00:00:00`.