# Footer Block

## Overview

The footer block provides site-wide footer content with support for multistore environments. It dynamically loads footer content from fragments and includes an interactive store switcher modal for multistore configurations. The block handles responsive design, accessibility features, and integrates with Adobe Commerce drop-in UI components.

## Integration

### Block Configuration

<!-- Configuration keys read via `readBlockConfig()` -->

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `footer` (metadata) | string | `'/footer'` | Path to the footer fragment content | No | Determines which fragment is loaded for footer content |

### URL Parameters
<!-- Any URL query parameters that affect block behavior -->
- No URL parameters directly affect this block

### Local Storage
<!-- Any localStorage keys used -->
- No localStorage keys are used by this block

### Events

<!-- Event listeners and emitters -->

#### Event Listeners
- `click` events on store switcher elements - Toggles accordion expansion for store selection
- `keydown` events (Enter/Space) on store switcher elements - Provides keyboard navigation for accessibility

#### Event Emitters
- No events are emitted by this block

## Behavior Patterns

### Page Context Detection
<!-- How the block behaves in different contexts -->
- **Single Store**: When `isMultistore()` returns false, only displays standard footer fragment content
- **Multistore**: When `isMultistore()` returns true, adds store switcher button with modal functionality

### User Interaction Flows
<!-- Key user interaction patterns -->
1. **Store Selection Flow**:
   - User clicks store switcher button in footer
   - Modal opens with available stores/regions
   - User can expand/collapse store regions using click or keyboard (Enter/Space)
   - User selects a store which redirects to that store's URL
   - Modal automatically closes on selection

2. **Fragment Loading**:
   - Block reads 'footer' metadata to determine fragment path
   - Loads footer fragment content asynchronously
   - Renders fragment content within the footer container

### Error Handling
<!-- How errors are handled -->
- **Fragment Loading Error**: If footer fragment fails to load, block continues without error but may display empty footer
- **Store Switcher Fragment Error**: If store-switcher fragment is missing in multistore mode, logs error and returns early, preventing footer rendering
- **Missing Selected Store**: If no store URL matches current root path, store switcher still renders but without pre-selected state

## Technical Implementation

### Dependencies
- `@dropins/tools/lib/aem/configs.js` - For `getRootPath()` and `isMultistore()` configuration
- `@dropins/tools/components.js` - For Button UI component and provider
- `../modal/modal.js` - For modal functionality in store switcher
- `../../scripts/aem.js` - For `getMetadata()` utility
- `../fragment/fragment.js` - For `loadFragment()` functionality

### CSS Classes Applied
- `.storeview-switcher-button` - Store switcher button container
- `.storeview-modal-storeview-title` - Modal title section
- `.storeview-modal-storeview-list` - Modal store list section
- `.storeview-selection` - Parent UL for store regions
- `.storeview-single-store` - Single store per region styling
- `.storeview-multiple-stores` - Multiple stores per region with accordion
- `.storeviews` - Applied to regions with multiple store options

### Accessibility Features
- Keyboard navigation support (Enter/Space keys)
- Proper ARIA attributes (`aria-expanded` for accordion states)
- Tab index management for focusable elements
- Semantic HTML structure for screen readers