# Carousel Block

## Overview

The Carousel Block provides a responsive carousel/slider component for displaying multiple items in a rotating slideshow format.

## Features

- Auto-rotation with a 3 second interval
- Navigation controls (previous/next buttons)
- Pagination indicators
- Native horizontal swipe/scroll support
- Keyboard navigation
- Pause on hover
- Responsive design
- Accessibility support
- `shop-by` variant for circular linked category slides

## Usage

The carousel block automatically initializes when added to a page. Structure your content in a table format:

| carousel |
|----------|
| Slide 1  |
| Slide 2  |
| Slide 3  |

Each slide expects two columns:
- Column 1: background image
- Column 2: rich text content

Slides render in the same order they are sorted in authoring.

### `shop-by` variant

Author with `carousel (shop-by)` and keep the same two-column slide structure:

| Image | Content |
|-------|---------|
| ![Watches](watches.jpg) | <p><a href="/collections/watches">Watches</a></p> |

Variant behavior:

- The first column image becomes a circular slide.
- The first link in the second column becomes the slide destination.
- The full image is wrapped with that same link.
- The link text is overlaid inside the circular slide.
- The authored content column is treated as source content and is not rendered as a separate visible text panel.

When the carousel sits inside a section with a `.default-content-wrapper`, the first authored paragraph in that default content becomes the `slider_badge`. If that paragraph contains `no-badge`, the badge is suppressed. Remaining paragraphs continue to render as the section copy.
