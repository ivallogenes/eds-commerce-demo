# Interactive Banner Block

## Overview

The Interactive Banner block decorates a two-column authored layout into a promotional hero. The default presentation uses a floating circle-image composition on desktop and a stacked image grid on mobile. The `corporate` variant switches to a reversed layout with the text content in the left column and five editorial media cards in the right column, using a staggered desktop collage and a two-column mobile card grid.

The default authored layout expects five anchor-wrapped images in the first column and content in the second column. The `corporate` authored layout expects content in the first column and five picture paragraphs in the second column, where each media item provides a title in the picture paragraph and an optional second text line either after a `<br>` in the same paragraph or in the immediately following plain paragraph.

## Integration

### Block Configuration

The block does not read configuration from `readBlockConfig()`. Its behavior is driven entirely by the authored content structure.

### The default variant handles images wrapped in links from the authoring side. All images must be wrapped in anchor tags to be recognized and decorated by the block. The block will decorate up to five image links, applying position-based classes for styling.

### The corporate variant expects picture paragraphs in the media column, not links. Each of up to 5 images are interactive on hover.

## Behavior Patterns

### Page Context Detection
- **Standard Authoring Contract**: The block expects a single authored row with two columns. The first column holds five image links with pictures, and the second column holds the content elements in the order described by the design.
- **Corporate Variant Contract**: When the block includes the `corporate` class, the first column becomes the content column and the second column becomes the media column. The content column expects badge paragraph, heading, description, three feature paragraphs, CTA paragraph, and a closing social-proof paragraph. The media column expects five picture paragraphs with title and subtitle text authored as described above.
- **Missing Required Content**: If the row, either column, or the authored image links are missing, the decorator exits early and leaves the authored markup unchanged.
- **No Badge Mode**: If the first paragraph in the content column contains `no-badge`, the top badge element is omitted.
- **Colorful Heading**: make the heading text bold or italic to change it's style to a colorful gradient font color effect.
- **Flexible Content**: Optional elements such as the list, action links, or social-proof paragraph are only rendered when authored.

### User Interaction Flows
1. **Media Decoration Flow**: The block finds the first five authored image links, moves them into the decorated media cluster, and assigns position-based classes for the floating layout.
2. **Corporate Media Flow**: In the `corporate` variant, the block converts the five authored picture paragraphs into editorial cards, extracts one or two authored text lines per card, and repositions the cards into the desktop/mobile layouts defined by the design.
2. **Badge List Flow**: The authored unordered list is restyled as chip badges, with the first three items receiving the downloaded Figma icons through CSS.
3. **CTA Flow**: The first authored action link becomes the primary icon button, while subsequent links render as secondary icon buttons.
4. **Social Proof Flow**: The final authored paragraph is transformed into a decorative social-proof row with generated marker circles and emphasized leading text.

### Error Handling
- **Incomplete Media Authoring**: When no anchor-wrapped pictures are found in the first column, the block returns without altering the DOM.
- **Corporate Media Fallback**: When the `corporate` variant does not contain picture paragraphs in the media column, the block leaves the authored markup unchanged.
- **Partial Content Authoring**: Missing optional content blocks are skipped so the banner still renders with the remaining authored pieces.
- **Fallback Behavior**: The block limits the media cluster to the first five authored image links and ignores any additional links.
