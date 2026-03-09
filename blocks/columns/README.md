# Columns Block

## Overview

The Columns block renders each authored row as a responsive multi-column layout. It inspects the first row to determine the number of columns, adds a `columns-{n}-cols` class for styling hooks, and treats picture-only cells as image columns so they can be visually prioritized on smaller viewports.

## Integration

### Block Structure

In Document Authoring, this block is exposed as separate presets so authors can insert the desired layout directly from the block picker:

- `Two columns`
- `Three columns`
- `Four columns`

Each preset inserts the same underlying `columns` block with a different initial column count.

<!--
### Block Configuration

This block does not read runtime configuration with `readBlockConfig()`. Layout behavior is driven by the authored row/cell structure.
-->

<!--
### URL Parameters
No URL query parameters affect this block's behavior.
-->

<!--
### Local Storage
No localStorage keys are used by this block.
-->

<!--
### Events

This block does not listen for or emit custom events.

#### Event Listeners
- None

#### Event Emitters
- None
-->

## Behavior Patterns

### Page Context Detection
- **Any page context**: The block behaves the same on all page types and only depends on the authored block markup.
- **Responsive context**: On narrow viewports, rows stack vertically; on viewports `900px` and wider, cells display side by side in a flex row.

### User Interaction Flows
1. **Block initialization**: When the block decorates, it reads the first authored row, counts its child columns, and adds a `columns-{n}-cols` class to the block root.
2. **Image column detection**: For each cell, the block checks for a `picture` wrapped as the cell's only content. If found, that wrapper receives the `columns-img-col` class.
3. **Responsive ordering**: On mobile-sized viewports, image-only columns are ordered before text columns. On larger viewports, default source order is restored and all columns share available width.
4. **Image presentation**: Images inside detected image columns are displayed as block elements with a rounded corner treatment.

### Error Handling
- **Missing expected structure**: If the block has no picture-only cell wrappers, it still renders as a standard columns layout without image-column enhancements.
- **Mixed cell content**: If a cell contains a `picture` plus additional content, it is not treated as an image column, preventing unintended reordering.
- **Fallback behavior**: The block performs lightweight class decoration only; authored markup remains intact, so partially unexpected content still renders using the default block structure and CSS.
