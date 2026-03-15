# Mega Hero Block

## Overview

The Mega Hero block renders the corporate hero layout that was previously implemented as `banner.variant-4`. It expects a two-column authored row with media on the left and content on the right, then transforms that structure into a dedicated full-width hero with a styled feature list, CTA row, hardcoded stats, and a floating promo card over the media.

## Integration

<!-- ### Block Configuration

No block configuration is read via `readBlockConfig()`. The block behavior is driven by authored content structure.

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| key-name | string | 'default' | Description of what this config does | No | How it affects block behavior |
-->

### Block Configuration

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| badge-content | rich text | none | Content inserted into the floating promo card inside the media area. The first paragraph renders as the bold lead line and subsequent paragraphs render as supporting copy. | No | When omitted, the promo card is not rendered. |

## Behavior Patterns

### Page Context Detection
- **Expected Content Row**: The first authored row must contain media in the left column and content in the right column.
- **Expected Content Order**: Inside the content column, the block expects a subheading paragraph, heading, description paragraph, unordered list, and CTA paragraph in that order.
- **Incomplete Authoring**: If either required column is missing, the block exits early and leaves the authored markup unchanged.

### User Interaction Flows
1. **Mega Hero Decoration Flow**: On block decoration, the block captures the authored media and content columns, rebuilds the layout using the `mega-hero__*` namespace, and moves the authored nodes into the new structure.
2. **Feature List Enhancement Flow**: When an authored unordered list is present, each list item receives the Figma-derived inline check icon and block-specific styling.
3. **CTA Enhancement Flow**: When CTA links are authored in a paragraph, the first link is styled as the primary button and subsequent links are styled as secondary buttons.
4. **Media Enhancement Flow**: When a `picture` is present, it is wrapped in the hero image frame and paired with a floating promo card when `badge-content` is authored in the second row settings.
5. **Stats Rendering Flow**: The block always appends a predefined corporate stats row with inline SVG icons.

### Error Handling
- **Missing Required Columns**: If the first authored row does not provide both columns, decoration stops immediately.
- **Missing Optional Nodes**: The block checks optional content nodes before moving them, so missing description, list, CTAs, or image simply result in fewer rendered subcomponents.
- **Fallback Behavior**: The block relies on hardcoded stat values, while authored content remains the source for the subheading, heading, description, feature list, CTAs, and optional promo card copy.