# Banner Block

## Overview

The Banner block transforms a simple two-column authored layout into a styled hero/banner experience. The current implementation supports a single `variant-1` presentation with a pill-style label, heading, description, CTA buttons, a featured image, hardcoded metrics, and a floating trend card.

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
- **Incomplete Authoring**: When either the content column or media column is missing, `decorateVariant1()` exits early and leaves the authored markup unchanged.
- **Partial Content**: When optional authored elements such as eyebrow text, description, CTAs, or image are missing, the block renders the remaining available pieces without failing.

### User Interaction Flows
1. **Banner Decoration Flow**: On block decoration, the block reads the variant class, captures the first authored row, extracts content and media columns, builds the banner shell, and replaces the original authored markup with the decorated layout.
2. **CTA Enhancement Flow**: When CTA links are authored in the third paragraph of the content column, the first link is styled as the primary button and subsequent links are styled as secondary buttons.
3. **Media Enhancement Flow**: When a `picture` is present in the media column, the block wraps it in an image frame and appends the hardcoded trend card overlay.
4. **Metrics Rendering Flow**: For `variant-1`, the block always appends the predefined stats set, including a rating entry rendered with decorative stars.

### Error Handling
- **Missing Required Columns**: If the first authored row does not provide both content and media columns, the decorator returns immediately and avoids producing a broken layout.
- **Missing Optional Nodes**: Each optional authored element is checked before being moved into the new structure, so omitted content simply results in fewer rendered subcomponents.
- **Unsupported Variant Fallback**: If an unknown variant class is present, the block falls back to `variant-1` in the `switch` default branch.
- **Fallback Behavior**: The block relies on hardcoded metrics and trend-card copy for `variant-1`, ensuring those UI elements still render even when authored content is minimal.
