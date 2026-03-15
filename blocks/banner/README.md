# Banner Block

## Overview

The Banner block transforms a simple two-column authored layout into a styled hero/banner experience. The implementation supports `variant-1`, `variant-2`, and `variant-3` presentations. `variant-1` renders a pill-style label, heading, description, CTA buttons, a featured image, hardcoded metrics, and a floating trend card. `variant-2` keeps the same main layout but switches to a softer editorial treatment with split-color heading styling, alternate hardcoded metrics, and an optional top-right image badge. `variant-3` reuses the `variant-2` design and logic, but expects the authored image in the left column and the text content in the right column.

## Integration

<!-- ### Block Configuration

No block configuration is read via `readBlockConfig()`. The block behavior is driven by authored content structure and optional variant classes on the block.

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `key-name` | string | `'default'` | Description of what this config does | No | How it affects block behavior |
-->

<!-- ### URL Parameters
- `param-name` - Description of parameter usage
-->

<!-- ### Local Storage
- `storage-key` - Description of stored data
-->

## Events

<!-- Event listeners and emitters -->

<!-- #### Event Listeners
- `events.on('event-name', callback)` - Description of what triggers this and what it does
- `events.on('another-event', callback)` - Description
-->

<!-- #### Event Emitters
- `events.emit('event-name', data)` - When this is emitted and what data is sent
-->

## Behavior Patterns

### Page Context Detection
- **Default Variant**: When no variant class is authored, `getVariant()` falls back to `variant-1` and applies the default banner layout.
- **Explicit Variant Class**: When the block includes a class beginning with `variant-`, that value is stored in `block.dataset.variant` and used to choose the decorator.
- **Incomplete Authoring**: When either the content column or media column is missing, the active decorator exits early and leaves the authored markup unchanged.
- **Partial Content**: When optional authored elements such as eyebrow text, description, CTAs, or image are missing, the block renders the remaining available pieces without failing.
- **Variant-2/3 Settings Row**: `variant-2` and `variant-3` read additional authored rows after the main content row as simple key/value settings. The `badge-content` key is used to render a badge inside the image frame.

### User Interaction Flows
1. **Banner Decoration Flow**: On block decoration, the block reads the variant class, captures the first authored row, extracts content and media columns, builds the banner shell, and replaces the original authored markup with the decorated layout.
2. **CTA Enhancement Flow**: When CTA links are authored in the third paragraph of the content column, the first link is styled as the primary button and subsequent links are styled as secondary buttons.
3. **Media Enhancement Flow**: When a `picture` is present in the media column, the block wraps it in an image frame and appends the variant-specific overlay treatment. `variant-1` adds the hardcoded trend card, while `variant-2` and `variant-3` add the optional authored badge.
4. **Metrics Rendering Flow**: For `variant-1`, the block always appends the predefined stats set, including a rating entry rendered with decorative stars.
5. **Heading Styling Flow**: For `variant-2` and `variant-3`, plain-text headings are split so the last word can render on its own accent-colored line.

### Error Handling
- **Missing Required Columns**: If the first authored row does not provide both content and media columns, the decorator returns immediately and avoids producing a broken layout.
- **Missing Optional Nodes**: Each optional authored element is checked before being moved into the new structure, so omitted content simply results in fewer rendered subcomponents.
- **Unsupported Variant Fallback**: If an unknown variant class is present, the block falls back to `variant-1` in the `switch` default branch.
- **Fallback Behavior**: The block relies on hardcoded metrics and overlay copy for both editorial variants, while `variant-2` and `variant-3` omit the badge when `badge-content` is not authored.
