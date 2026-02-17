# Overview

This project is an Adobe Commerce storefront built with Edge Delivery Services (EDS), combining AEM's block-based architecture with Adobe Commerce drop-in components for e-commerce functionality. The boilerplate is based on https://github.com/hlxsites/aem-boilerplate-commerce.

**Live Site:** https://{{branch-name}}--{{repo-name}}--{{owner}}.aem.live

As an agent, follow these instructions to deliver commerce storefronts based on Adobe's standards for high-performance, easy-to-author, and maintainable commerce experiences.

## Skills

You have access to a set of skills in ../.github/skills. Each skill consists of a SKILL.md file, and other files such as scripts and resources, which are referenced from there.

**YOU ARE REQUIRED TO USE THESE SKILLS TO ACCOMPLISH DEVELOPMENT TASKS.**

### How Skills Work

Each skill is a directory in `../.github/skills/` with the following structure:

```
../.github/skills/
  └── {skill-name}/
      ├── SKILL.md        # Main instructions (required)
      ├── scripts/        # Optional supporting scripts
      └── resources/      # Optional resources (examples, templates, etc.)
```

The SKILL.md file contains detailed instructions that you must follow exactly as written. Skills are designed to:
- Provide specialized workflows for common tasks
- Ensure consistency with project standards and best practices
- Reduce errors by codifying expert knowledge
- Chain together when tasks require multiple skill applications

### Skill Discovery and Execution Process

Always use the following process:

1. **Discovery**: When a new conversation starts, discover available skills by running `../.github/skills/discover-skills`. This script will show you all available skills with their names, paths, and descriptions without loading everything into context.

2. **Execution**:
   - Read the full SKILL.md file
   - Announce you are doing so by saying "Using Skill: {Skill Name}"
   - Follow the skill's instructions exactly as written
   - Read any referenced resources or scripts as needed
   - Complete all steps in the skill before moving to the next task

**For ALL development work involving blocks, core scripts, or functionality, you MUST start with the content-driven-development skill.** It will orchestrate other skills as needed throughout the development workflow.

## Project Overview

This project combines Edge Delivery Services for AEM Sites with Adobe Commerce to create high-performance commerce storefronts.

### Three-Layer System

1. **Core EDS Layer** (`scripts/aem.js`): Standard AEM block lifecycle - decoration, loading, sections
   - **NEVER MODIFY** `aem.js` - it's the core AEM library
   - Handles page loading (eager/lazy/delayed phases)
   - Manages sections and block decoration

2. **Commerce Integration Layer** (`scripts/commerce.js`): Adobe Commerce GraphQL integration
   - Page type detection (Product/Category/Cart/Checkout)
   - Commerce configuration and endpoints
   - Adobe Data Layer integration
   - Event bus coordination

3. **Drop-in Components** (`scripts/__dropins__/`): Pre-built commerce widgets
   - NPM packages from `@dropins/storefront-*`
   - Copied to `scripts/__dropins__/` via `postinstall.js`
   - Provide cart, checkout, product details, authentication, etc.

### Key Technologies

- **Edge Delivery Services** for high-performance content delivery
- **Adobe Commerce** as the commerce backend (via GraphQL API)
- **Commerce Drop-ins** for pre-built e-commerce UI components
- **Adobe Data Layer** for analytics and event tracking
- **Vanilla JavaScript** (ES6+), no transpiling
- **Vanilla CSS** to be updated
- **Node.js** tooling

### Documentation Resources

**Search Documentation:** Use `site:experienceleague.adobe.com/developer/commerce/storefront/` for commerce-specific docs, or `site:www.aem.live` for AEM docs when searching the web.

## Setup Commands

- Install dependencies: `npm install` (automatically runs `postinstall` to copy drop-ins)
- Start local development: `npx -y @adobe/aem-cli up --no-open --forward-browser-logs` (run in background, if possible)
  - Install the AEM CLI globally: `npm install -g @adobe/aem-cli` then `aem up` is equivalent
  - With live content: `aem up --url https://main--{site}--{org}.aem.page`
- Run linting: `npm run lint`
- Fix linting issues: `npm run lint:fix`
- Build CSS: `npm run build:css` (PostCSS from `styles/source/` to `styles/`)
- Watch CSS: `npm run watch:css` (for development)
- **Update drop-ins:** `npm install @dropins/storefront-cart@latest && npm run postinstall`

### Critical: Drop-in Dependency Updates

**Drop-ins are NOT served from `node_modules`.** They're copied to `scripts/__dropins__/` via:

```bash
npm install @dropins/storefront-cart@latest  # Updates node_modules
npm run postinstall                          # REQUIRED: Copies to scripts/__dropins__/
```

**Why:** EDS serves static files; `postinstall.js` bridges npm packages to servable assets. **Always run `npm run postinstall` after updating any `@dropins/*` package.**

## Project Structure

```
├── blocks/          # Reusable content blocks
    ├── {blockName}/        # Standard content blocks
    │   ├── {blockName}.js      # Block's JavaScript
    │   └── {blockName}.css     # Block's styles
    └── commerce-*/         # Commerce drop-in integration blocks
        ├── commerce-*.js       # Drop-in container rendering
        └── commerce-*.css      # Drop-in styling overrides
├── styles/          # Global styles and CSS
    ├── styles.css          # Minimal global styling (LCP critical)
    ├── lazy-styles.css     # Below-the-fold styling
    ├── fonts.css           # Font definitions
    └── source/             # PostCSS source files (nesting, etc.)
├── scripts/         # JavaScript libraries and utilities
    ├── aem.js              # Core AEM Library (NEVER MODIFY)
    ├── scripts.js          # Global utilities, main entry point
    ├── delayed.js          # Delayed loading (martech, etc.)
    ├── commerce.js         # Commerce integration layer
    ├── __dropins__/        # Drop-in components (copied from node_modules)
    ├── initializers/       # Drop-in initialization logic
    │   ├── index.js        # Main initializer, auth, event bus
    │   ├── pdp.js          # Product page initialization
    │   ├── cart.js         # Cart initialization
    │   └── checkout.js     # Checkout initialization
    └── acdl/               # Adobe Client Data Layer
├── config.json      # Commerce endpoints, headers, analytics config
├── fonts/           # Web fonts
├── icons/           # SVG icons
├── head.html        # Global HTML head content
└── 404.html         # Custom 404 page
```

## Code Style Guidelines

### JavaScript
- Use ES6+ features (arrow functions, destructuring, etc.)
- Follow Airbnb ESLint rules (already configured)
- Always include `.js` file extensions in imports
- Use Unix line endings (LF)

**For detailed JavaScript guidelines:** Use the **building-blocks** skill which includes comprehensive decoration patterns and best practices.

## CSS Development with PostCSS

This project uses PostCSS to enable modern CSS features like nesting while maintaining EDS performance.

- Mobile-first responsive design (breakpoints: 600px/900px/1200px)
- All selectors scoped to blocks: `.{blockName} .selector`
- Follow Stylelint standard configuration

**Quick Start:**

```bash
# Watch mode (recommended for development)
npm run watch:css    # Auto-compiles on save

# Or build once
npm run build:css    # Compile all CSS files before committing
```

**Workflow:**

1. Edit source files in `styles/source/` or `blocks/**/source/`
2. PostCSS auto-compiles to standard CSS
3. Commit both source and compiled files

**For detailed CSS guidelines:** Use the **building-blocks** skill which includes comprehensive styling patterns and best practices.

### HTML
- Use semantic HTML5 elements
- Ensure accessibility standards (ARIA labels, proper heading hierarchy)
- Follow AEM markup conventions for blocks and sections

## Key Concepts

### Content

CMS authored content is a key part of every AEM Website. The content of a page is broken into sections. Sections can have default content (text, headings, links, etc.) as well as content in blocks.

**For development workflow:** Use the **content-driven-development** skill for all development tasks. This skill ensures you identify or create test content before writing code, following AEM best practices.

### Blocks

Blocks are the re-usable building blocks of AEM. Blocks add styling and functionality to content. Each block has an initial content structure it expects, and transforms the HTML using DOM APIs to render a final structure.

**Key principle:** The initial content structure is the contract between authors and developers. Design this structure before writing any code, and be careful when making changes that could break existing pages.

**For creating or modifying blocks:** Use the **building-blocks** skill which guides you through:
- Content model design (via content-driven-development)
- JavaScript decoration patterns
- CSS styling conventions
- Testing and validation

**Tip:** Ask the user to inspect the HTML delivered by the backend and provide you with the code, before making assumptions.

### Auto-Blocking

Auto-blocking is the process of creating blocks that aren't explicitly authored into the page based on patterns in the content. See the `buildAutoBlocks` function in `scripts.js`.

### Three-Phase Page Loading

Pages are progressively loaded in three phases to maximize performance. This process begins when `loadPage` from scripts.js is called.

* Eager - load only what is required to get to LCP. This generally includes decorating the overall page content to create sections, blocks, buttons, etc. and loading the first section of the page.
* Lazy - load all other page content, including the header and footer.
* Delayed - load things that can be safely loaded later here and incur a performance penalty when loaded earlier

## Commerce Integration

### Configuration Flow

1. **Site Config** (`config.json`): Commerce endpoints, headers, auth
2. **Drop-in Initialization** (`scripts/initializers/index.js`): Sets GraphQL endpoint, auth headers, event bus
3. **Page Type Detection** (`scripts/commerce.js:detectPageType()`): Auto-detects Product/Category/Cart/Checkout pages
4. **Drop-in Initializers** (`scripts/initializers/`): Page-specific logic (e.g., `pdp.js` for product pages)

### Authentication Pattern

- User token stored in `auth_dropin_user_token` cookie
- `setAuthHeaders()` in `scripts/initializers/index.js` manages Authorization header
- Listen to `authenticated` event from event bus to sync auth state

### Event Bus Usage

```javascript
import { events } from '@dropins/tools/event-bus.js';

events.on('cart/data', (data) => {
  // React to cart changes
});

events.emit('aem/load'); // Notify drop-ins of loading state
```

### Custom Extensions

#### GraphQL Operation Overrides

Edit `build.mjs` to skip fragments or extend operations:

```javascript
overrideGQLOperations([
  {
    npm: '@dropins/storefront-cart',
    skipFragments: ['DOWNLOADABLE_CART_ITEMS_FRAGMENT'], // Adobe Commerce Cloud doesn't support downloadables
    operations: [],
  }
]);
```

Run `npm run install:dropins` after changes.

## Block Development Patterns

### Standard Block Structure

```javascript
// blocks/my-block/my-block.js
export default async function decorate(block) {
  // 1. Read block content from DOM (authored in table format)
  const config = block.querySelector('div:first-child');

  // 2. Clear block and build UI
  block.innerHTML = '';

  // 3. Render (can use drop-in containers)
  // See commerce blocks for drop-in integration examples
}
```

### Commerce Block Pattern (Drop-in Integration)

```javascript
import { render as provider } from '@dropins/storefront-cart/render.js';
import CartSummaryList from '@dropins/storefront-cart/containers/CartSummaryList.js';

export default async function decorate(block) {
  block.innerHTML = '';

  // Provider renders drop-in containers
  return provider.render(CartSummaryList, {})(block);
}
```

**Key Files:**
- `blocks/commerce-cart/commerce-cart.js` - Full cart implementation
- `blocks/product-list-page/product-list-page.js` - PLP with facets
- `blocks/commerce-checkout/commerce-checkout.js` - Multi-step checkout with custom slots

## Development Workflow

**For all development tasks:** Use the **content-driven-development** skill which orchestrates the complete workflow:
1. Content discovery and modeling
2. Implementation (invokes building-blocks skill for blocks)
3. Validation and testing (invokes testing-blocks skill)

### File Organization
- Block files: `blocks/{blockname}/{blockname}.js` and `{blockname}.css`
- Global styles: `styles/styles.css` (eager), `styles/lazy-styles.css` (lazy)
- Font definitions: `styles/fonts.css`
- Each block should be self-contained, responsive, and accessible

## Common Tasks

### Adding New Blocks
Use the **content-driven-development** skill which will guide you through:
1. Content modeling and test content creation
2. Block implementation (via building-blocks skill)
3. Testing and validation (via testing-blocks skill)

### Modifying Existing Blocks
Use the **content-driven-development** skill to ensure you have test content, then follow the building-blocks skill for implementation.

### Global Style Changes
1. Modify files in the `styles/` directory
2. Test across different blocks and pages
3. Ensure changes don't break existing layouts
4. Consider impact on performance, especially CLS

## Troubleshooting

**For Commerce Storefront documentation:** Search using `site:experienceleague.adobe.com/developer/commerce/storefront/` when searching the web for commerce-specific features, drop-ins, and implementation guidance.

**For AEM documentation:** Use the **docs-search** skill to search aem.live documentation and blogs for feature information, implementation guidance, and best practices.

**For reference implementations of blocks:** Use the **block-collection-and-party** skill to find similar blocks, patterns, and code examples from the Block Collection and Block Party repositories.

### Common Pitfalls

1. **Forgetting `npm run postinstall`** after updating drop-ins → stale code served
2. **Editing files in `scripts/__dropins__/`** → changes lost on next postinstall
3. **Not checking page type** → commerce logic runs on CMS pages unnecessarily
4. **Importing from `node_modules/@dropins`** → use `scripts/__dropins__/` paths instead
