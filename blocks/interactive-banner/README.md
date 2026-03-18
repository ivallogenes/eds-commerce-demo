# Interactive Banner Block

## Overview

The Interactive Banner block decorates a two-column authored layout into a promotional hero with a floating circle-image composition on desktop and a stacked image grid on mobile. The left authored column contains five anchor-wrapped images, which the block repositions into the required composition order without generating additional image markup. The right authored column contains the badge paragraph, heading, description, badge list, CTA links, and social-proof paragraph that are restyled into the final banner design.

## Integration

### Block Configuration

The block does not read configuration from `readBlockConfig()`. Its behavior is driven entirely by the authored content structure.

## Behavior Patterns

### Page Context Detection
- **Standard Authoring Contract**: The block expects a single authored row with two columns. The first column holds five image links with pictures, and the second column holds the content elements in the order described by the design.
- **Missing Required Content**: If the row, either column, or the authored image links are missing, the decorator exits early and leaves the authored markup unchanged.
- **No Badge Mode**: If the first paragraph in the content column contains `no-badge`, the top badge element is omitted.
- **Colorful Heading**: make the heading text bold or italic to change it's style to a colorful gradient font color effect.
- **Flexible Content**: Optional elements such as the list, action links, or social-proof paragraph are only rendered when authored.

### User Interaction Flows
1. **Media Decoration Flow**: The block finds the first five authored image links, moves them into the decorated media cluster, and assigns position-based classes for the floating layout.
2. **Badge List Flow**: The authored unordered list is restyled as chip badges, with the first three items receiving the downloaded Figma icons through CSS.
3. **CTA Flow**: The first authored action link becomes the primary icon button, while subsequent links render as secondary icon buttons.
4. **Social Proof Flow**: The final authored paragraph is transformed into a decorative social-proof row with generated marker circles and emphasized leading text.

### Error Handling
- **Incomplete Media Authoring**: When no anchor-wrapped pictures are found in the first column, the block returns without altering the DOM.
- **Partial Content Authoring**: Missing optional content blocks are skipped so the banner still renders with the remaining authored pieces.
- **Fallback Behavior**: The block limits the media cluster to the first five authored image links and ignores any additional links.
