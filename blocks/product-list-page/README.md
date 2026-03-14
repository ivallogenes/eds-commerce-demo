# Product List Page Block

## Overview

The Product List Page block renders storefront product discovery results for either a category listing or a search results page. It wires Adobe Commerce product-discovery drop-ins for facets, sorting, pagination, wishlist toggles, and add-to-cart actions, while syncing the current search state back into the URL.

## Integration

### Block Configuration

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `urlpath` | string | `undefined` | Category path used to switch the block from keyword search mode into category listing mode | No | Adds `data-category` to the block and injects a `categoryPath` filter into the initial search request |

### URL Parameters
- `q` - Search phrase used when the block is operating as a search page
- `page` - Current results page number passed into the initial search request
- `sort` - Comma-separated sort values in the form `attribute_DIRECTION`
- `filter` - Pipe-separated filter string in the form `attribute:value|attribute:from-to`

<!-- ### Local Storage
- None. This block does not read or write browser storage directly.
-->

### Events

#### Event Listeners
- `events.on('search/result', callback, { eager: true })` - Updates result copy, empty-state styling, and the mobile facet button count as soon as search data is available
- `events.on('search/result', callback, { eager: false })` - Syncs the latest phrase, page, sort, and filter state back into the browser URL after the drop-ins update

<!-- #### Event Emitters
- None. This block reacts to search events but does not emit custom events directly.
-->

## Behavior Patterns

### Page Context Detection
- **Category Listing**: When `urlpath` is authored, the block runs a blank-phrase search scoped to that category path and stores the category on `data-category`
- **Search Results**: When `urlpath` is absent, the block reads the `q` query parameter and performs a keyword search
- **Empty Results**: When `search/result` returns `totalCount === 0`, the block adds `product-list-page--empty` and hides facets, sort controls, and pagination
- **Product Type Actions**: Complex products link to the PDP for configuration, while simple products add a single quantity directly to the cart API

### User Interaction Flows
1. **Initial Load**: The block reads authored config and URL params, renders the product-discovery layout shell, and triggers the first search request for either category or keyword mode.
2. **Filtering and Sorting**: Facets, sort, and pagination are rendered through the product-discovery drop-ins, and subsequent `search/result` events update result messaging and URL state.
3. **Add to Cart / Wishlist**: Each product card renders an add-to-cart action plus a wishlist toggle; complex products route to the PDP, while simple products call `cartApi.addProductsToCart()`.
4. **Responsive Facets**: On smaller viewports, the Filters button toggles facet visibility by adding or removing `search__facets--visible`.

### Error Handling
- **Initial Search Failure**: Both category and keyword searches wrap `search()` in `.catch()` and log an error to the console without throwing, allowing the block shell to remain rendered
- **Malformed Filter Parameters**: Invalid or missing `filter` params degrade to an empty filter array, so search still runs with the remaining valid inputs
- **Image Fallbacks**: Product imagery is delegated to `tryRenderAemAssetsImage()`, which allows the drop-in image rendering flow to remain the fallback path when AEM asset rendering is unavailable
- **Fallback Behavior**: If placeholders or optional URL params are missing, the block still renders with default drop-in UI and the current search request state