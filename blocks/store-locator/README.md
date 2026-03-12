# Store Locator Block

## Overview

The Store Locator block renders a simple contact-page location section with a fixed heading and a Google Maps embed. The block reads a single authored configuration key, `address`, and generates all UI from block logic.

## DA Authoring Structure

Expected authored key-value block structure:

| store-locator |
| --- |
| `address` |
| `123 Commerce Street, San Francisco, 94102` |

Notes:
- The block reads the `address` value via `readBlockConfig(block)`.
- The heading is not authored; it is always rendered as `Visit Our Store`.
- The map UI is not authored; it is generated entirely by the block implementation.

## Integration

### Block Configuration

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `address` | string | `''` | The location string used to build the Google Maps embed URL. Expected format: `Street, City, Postal code`. | Yes | If blank or invalid, the block renders a fallback message instead of an iframe. |

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
-->

<!-- #### Event Emitters
- `events.emit('event-name', data)` - When this is emitted and what data is sent
-->

## Behavior Patterns

### Page Context Detection
- **Configured Address**: When `address` is authored, the block renders the fixed heading and a Google Maps iframe for that location.
- **Missing Address**: When `address` is blank or missing, the block renders the fixed heading and a fallback message instead of a broken map.

### User Interaction Flows
1. **Initial Render**: The block reads `address`, normalizes the value, builds the block DOM, and renders either the map iframe or fallback state.
2. **Configured Display**: When a valid address is present, the block creates a Google Maps embed URL and assigns it to the iframe.
3. **Fallback Display**: When no usable address is authored, the block shows a simple `Store location unavailable.` message.

### Error Handling
- **Missing Address**: The block avoids rendering a broken iframe and falls back to a simple unavailable message.
- **Unsafe Input Handling**: The address is normalized before being added to the Google Maps query string.
- **Fallback Behavior**: The block remains renderable even without valid configuration.