# PostCSS Setup for EDS Commerce

## Overview

This project uses PostCSS to enable modern CSS features like nesting while maintaining compatibility with Edge Delivery Services' buildless architecture. **Source CSS files are compiled locally before being committed to git.**

## Directory Structure

```
eds-commerce/
├── styles/
│   ├── source/              # Source CSS with modern features
│   │   ├── styles.css       # Main global styles (source)
│   │   ├── lazy-styles.css  # Post-LCP styles (source)
│   │   └── fonts.css        # Font declarations (source)
│   ├── styles.css           # Compiled (committed to git)
│   ├── lazy-styles.css      # Compiled (committed to git)
│   └── fonts.css            # Compiled (committed to git)
├── blocks/
│   └── footer/
│       ├── source/
│       │   └── footer.css   # Source with nesting
│       └── footer.css       # Compiled (committed to git)
└── postcss.config.js        # PostCSS configuration
```

## Features Enabled

- **CSS Nesting**: Native CSS nesting syntax
- **@import**: Import other CSS files
- **Modern CSS**: `color-mix()`, custom media queries, etc.
- **Autoprefixer**: Automatic vendor prefixes

## Development Workflow

### 1. Initial Setup

```bash
# Install dependencies (includes PostCSS)
npm install
```

### 2. Daily Development

**Option A: Watch Mode (Recommended)**

```bash
# Start CSS watch mode in one terminal
npm run watch:css

# Start dev server in another terminal
npm start
```

This automatically recompiles CSS on save.

**Option B: Manual Build**

```bash
# Build CSS once
npm run build:css

# Then start dev server
npm start
```

### 3. Edit Source Files

Work in source directories:
- Global styles: `styles/source/*.css`
- Block styles: `blocks/**/source/*.css`

**Example with nesting:**

```css
/* blocks/footer/source/footer.css */
.footer {
  background: var(--color-neutral-100);

  & .footer-nav {
    display: flex;

    & a {
      color: var(--color-brand-500);

      &:hover {
        color: var(--color-brand-700);
      }
    }
  }

  @media (min-width: 900px) {
    padding: var(--spacing-big);
  }
}
```

### 4. Compiled Output

PostCSS generates browser-compatible CSS:

```css
/* blocks/footer/footer.css - Auto-generated */
.footer {
  background: var(--color-neutral-100);
}

.footer .footer-nav {
  display: flex;
}

.footer .footer-nav a {
  color: var(--color-brand-500);
}

.footer .footer-nav a:hover {
  color: var(--color-brand-700);
}

@media (min-width: 900px) {
  .footer {
    padding: var(--spacing-big);
  }
}
```

### 5. Commit Changes

```bash
# Compile CSS
npm run build:css

# Verify compiled files
git status

# Commit both source and compiled files
git add styles/source/ styles/*.css
git add blocks/**/source/ blocks/**/*.css
git commit -m "feat: update footer styles"
```

## NPM Scripts

```json
{
  "build:css": "Build all CSS (global + blocks)",
  "build:css:global": "Build global styles only",
  "build:css:blocks": "Build block styles only",
  "watch:css": "Watch mode for all CSS",
  "watch:css:global": "Watch global styles",
  "watch:css:blocks": "Watch block styles"
}
```

## Creating New Blocks

When creating a new block, use this structure:

```bash
blocks/
└── my-new-block/
    ├── source/
    │   └── my-new-block.css   # Source with nesting
    ├── my-new-block.css        # Will be generated
    └── my-new-block.js
```

**Workflow:**

1. Create `blocks/my-new-block/source/my-new-block.css`
2. Run `npm run build:css` or have watch mode running
3. The compiled `blocks/my-new-block/my-new-block.css` is auto-generated
4. Commit both files

## Configuration

### postcss.config.js

Current configuration uses:
- `postcss-import` - @import support
- `postcss-nesting` - Native CSS nesting
- `postcss-preset-env` - Stage 3+ features
- `autoprefixer` - Vendor prefixes

You can customize features in `postcss.config.js`.

## Best Practices

### DO ✅

- **Always edit source files** in `source/` directories
- **Run `npm run watch:css`** during development
- **Commit both source and compiled** files together
- **Use CSS custom properties** (already defined in :root)
- **Keep nesting shallow** (max 3-4 levels)
- **Use semantic naming** for clarity

### DON'T ❌

- **Don't edit compiled files** directly (they'll be overwritten)
- **Don't forget to build** before committing
- **Don't over-nest** (impacts specificity)
- **Don't use preprocessor-specific** syntax (we use PostCSS, not Sass)

## Performance Considerations

### LCP Impact

Compiled CSS must remain minimal for Largest Contentful Paint:
- Global `styles.css` target: < 50KB
- Block CSS individual files: < 10KB each

### Optimization Tips

1. **Minimize nesting depth** - flatter structure = smaller output
2. **Avoid duplicating selectors** - use shared classes
3. **Leverage CSS custom properties** - already defined in :root
4. **Put non-critical styles in `lazy-styles.css`**

## Troubleshooting

### Issue: CSS changes not appearing

```bash
# Rebuild CSS
npm run build:css

# Clear browser cache
# Or hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
```

### Issue: PostCSS errors

Check syntax in source file:
```bash
# Run build to see errors
npm run build:css
```

Common issues:
- Missing semicolons
- Unclosed brackets
- Invalid nesting syntax

### Issue: Stylelint errors

Our stylelint runs on **compiled** CSS:
```bash
npm run lint:css
```

If errors appear in compiled files, fix the **source** file and rebuild.

## Why This Approach?

### Advantages

✅ **No build step in EDS** - maintains Edge Delivery performance
✅ **Modern CSS features** - nesting, imports, etc.
✅ **Transparent output** - can review compiled CSS before deploying
✅ **No runtime overhead** - browsers get standard CSS
✅ **Simple debugging** - source maps not needed, compiled CSS is readable

### Alternative Considered

Using only native CSS features - viable, but nesting support is nascent. PostCSS provides:
- Consistent syntax across all browsers
- Future-proof as CSS evolves
- Minimal tooling impact

## Support

- PostCSS docs: https://postcss.org/
- CSS Nesting: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
- EDS Performance: https://www.aem.live/developer/keeping-it-100

## Migration Notes

Existing CSS files have been copied to `source/` directories with nesting applied where beneficial. The compiled versions match the original output to ensure no visual regressions.

To verify: compare current deployed styles with new compiled output before committing.
