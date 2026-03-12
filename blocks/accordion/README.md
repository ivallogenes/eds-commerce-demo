# Accordion Block

## Overview

The Accordion block transforms each authored row into a native HTML `details`/`summary` pair. The first column becomes the clickable label, the second column becomes the collapsible body, and CSS provides the visual treatment for the expanded and collapsed states.

## Integration

### Block Structure

Each authored row must contain two columns:

- First column: accordion label content
- Second column: accordion body content

At decoration time, each row is replaced with this structure:

```html
<details class="accordion-item">
  <summary class="accordion-item-label">...</summary>
  <div class="accordion-item-body">...</div>
</details>
```

<!--
### Block Configuration

This block does not read runtime configuration with `readBlockConfig()`. Behavior is driven entirely by the authored two-column row structure.

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| None | n/a | n/a | This block has no runtime configuration keys. | No | None |
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

- **Any page context**: The block behaves the same on all page types and only depends on the authored markup inside the block.
- **Responsive context**: The accordion stays as a single-column stack, while the section wrapper constrains width and centers default section copy above it.

### User Interaction Flows

1. **Block initialization**: When the block decorates, it iterates over each authored row and converts it into a `details.accordion-item` element.
2. **Label extraction**: The first cell's child nodes are moved into a generated `summary.accordion-item-label`, preserving authored inline formatting and links.
3. **Body extraction**: The second cell is reused as `.accordion-item-body`, preserving its existing authored content.
4. **Expand and collapse**: Users click or keyboard-toggle the native `summary` element to open and close each item, with CSS updating the indicator arrow and body border treatment.

### Error Handling

- **Malformed row structure**: The implementation expects every row to contain both a label cell and a body cell. If either cell is missing, decoration can fail because the block does not validate the authored structure before transforming it.
- **Fallback behavior**: There is no custom recovery path in JavaScript. When the authored structure is valid, the block relies on native `details`/`summary` browser behavior for interaction and accessibility.