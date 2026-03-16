# Countdown Banner

Config-driven promotional banner with a publish-time UTC countdown.

## Supported Config

- `badge`: Small label shown above the heading.
- `heading`: Main promo heading.
- `description`: Supporting copy below the heading.
- `button-text`: Text rendered in the CTA button.
- `button-link`: Optional URL for the CTA. If omitted, the block renders a non-link button for visual-only use.
- `promo-label`: Up to three lines used in the promo card on the right side.
- `promotion-duration`: Integer duration in hours, starting from the page publish timestamp.
- `background-color`: Hex color applied to the banner background.
- `font-color`: Hex color applied to text and used as the CTA background.

## Behavior

- The block reads the page publish timestamp from the server `Last-Modified` header when available.
- If that header is unavailable, it falls back to page metadata and then `document.lastModified`.
- The resolved UTC start and end timestamps are written to `data-utc-start-time` and `data-utc-end-time` on the block.
- The timer updates every second and stops at `00:00:00`.