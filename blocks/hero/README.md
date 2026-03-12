# Hero Block

## Overview

The Hero block provides a full-width visual hero treatment for a leading image and headline. In its current form, the block does not perform any JavaScript decoration and relies on authored markup plus CSS to position the image behind the content and scale typography responsively.

## Integration

### Block Structure

The block metadata defines a single-row authoring model with these content fields:

- `image`: hero image reference
- `alt`: alt text for the image
- `text`: hero heading text

The authored markup is expected to include a `picture` and heading content inside the block. The CSS treats the `picture` as an absolutely positioned background layer and renders the text content above it.

<!--
### Block Configuration

This block does not read runtime configuration with `readBlockConfig()`. Its behavior is driven by authored content and CSS only.

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

- **Default context**: On any page, the block renders as a positioned content container with a minimum height of `300px`, padded content, and a full-bleed image behind the text.
- **`simple-white` context**: When an ancestor applies the `simple-white` class, paragraph text inside the hero is styled white, enlarged, and on desktop constrained to half width and aligned left.
- **Responsive context**: At `900px` and wider, horizontal padding increases, the inner content is constrained to `var(--layout-content-max-width)`, and the `h1` size increases from `48px` to `60px`.

### User Interaction Flows

1. **Authoring flow**: An author supplies the image, alt text, and heading content defined by the hero model.
2. **Block rendering flow**: When the page loads, the block uses the authored markup as-is because `hero.js` currently contains no decoration logic.
3. **Visual presentation flow**: CSS positions the `picture` absolutely behind the content, stretches the image to fill the block area, and keeps the text content in the foreground.
4. **Responsive layout flow**: On wider viewports, the block centers its inner content, increases heading size, and adjusts paragraph width in the `simple-white` presentation.

### Error Handling

- **Missing JavaScript decoration**: There is no JavaScript logic to validate or repair malformed markup, because the block currently performs no runtime transformation.
- **Missing optional content**: If descriptive paragraph text is absent, the block still renders the heading and image styling without error.
- **Missing expected media or heading**: The CSS assumes authored `picture` and heading markup exists. If either is missing, the remaining authored content still renders, but the final hero presentation may appear incomplete.
- **Fallback behavior**: Because the block leaves authored HTML untouched, unexpected or partial content falls back to standard browser rendering plus any matching scoped CSS rules.