# PostCSS Quick Reference

## Daily Commands

```bash
# Start dev server with CSS watch
npm run watch:css &    # Terminal 1: CSS compilation
npm start              # Terminal 2: Dev server

# Or build CSS once
npm run build:css
```

## File Structure

```
✏️  EDIT HERE                    📦 AUTO-GENERATED (commit both)
styles/source/styles.css    →   styles/styles.css
styles/source/lazy-styles.css → styles/lazy-styles.css
blocks/hero/source/hero.css →   blocks/hero/hero.css
```

## CSS Nesting Examples

### Before (flat)
```css
.card { }
.card .card-title { }
.card .card-title:hover { }
.card .card-body { }
```

### After (nested)
```css
.card {
  & .card-title {
    &:hover { }
  }

  & .card-body { }
}
```

## Media Queries
```css
.hero {
  padding: var(--spacing-small);

  @media (min-width: 900px) {
    padding: var(--spacing-big);
  }
}
```

## Pseudo-selectors
```css
button {
  background: var(--color-brand-500);

  &:hover {
    background: var(--color-brand-600);
  }

  &:disabled {
    background: var(--color-neutral-300);
  }

  &.primary {
    font-weight: bold;
  }
}
```

## Common Patterns

### Component with variants
```css
.button {
  /* Base styles */
  padding: 1em 2em;

  &.secondary {
    background: transparent;
  }

  &.large {
    font-size: 2rem;
  }

  &:hover:not(:disabled) {
    opacity: 0.9;
  }
}
```

### Block with nested elements
```css
.product-card {
  border: 1px solid var(--color-neutral-300);

  & .product-card__image {
    width: 100%;

    & img {
      object-fit: cover;
    }
  }

  & .product-card__title {
    font: var(--type-headline-2-strong-font);
  }

  & .product-card__price {
    color: var(--color-brand-500);

    &.sale {
      color: var(--color-alert-500);
    }
  }
}
```

## Design Tokens

```css
/* Colors */
var(--color-brand-500)
var(--color-neutral-50)
var(--color-positive-500)
var(--color-alert-500)

/* Spacing */
var(--spacing-small)    /* 12px */
var(--spacing-medium)   /* 16px */
var(--spacing-big)      /* 24px */
var(--spacing-xbig)     /* 32px */

/* Typography */
var(--type-headline-1-font)
var(--type-body-1-default-font)
var(--type-button-2-font)

/* Borders */
var(--shape-border-radius-2)  /* 4px */
var(--shape-border-width-1)   /* 1px */
```

## Troubleshooting

```bash
# CSS not updating?
npm run build:css           # Rebuild manually
# Then hard refresh browser (Ctrl+Shift+R)

# Check for syntax errors
npm run build:css           # Will show PostCSS errors

# Lint compiled CSS
npm run lint:css
```

## Best Practices

✅ Always edit `source/` files
✅ Run watch mode during dev
✅ Keep nesting max 3-4 levels
✅ Use design tokens (CSS custom properties)
✅ Commit both source + compiled files

❌ Never edit compiled files directly
❌ Don't over-nest (bloats output)
❌ Don't forget to build before commit

## Creating New Block

```bash
# 1. Create directory structure
mkdir -p blocks/my-block/source

# 2. Create source CSS
# blocks/my-block/source/my-block.css
.my-block {
  /* Your nested styles */
}

# 3. Compile
npm run build:css

# 4. Commit both
git add blocks/my-block/
```

## Links

- Full docs: [docs/POSTCSS-SETUP.md](POSTCSS-SETUP.md)
- PostCSS: https://postcss.org/
- CSS Nesting: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting
