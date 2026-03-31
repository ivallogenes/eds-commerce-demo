# Edge Delivery Services + Adobe Commerce Demo Storefront

Adobe Edge Delivery Services demo project that integrates with Adobe Commerce.

This project uses the Document Authoring (DA) tool as the content management system.

### Live Site: [https://main--eds-commerce-demo--ivallogenes.aem.live](https://main--eds-commerce-demo--ivallogenes.aem.live)

### Figma Design mockups: [https://www.figma.com/design/hl9x14ZQFTGKn7rEyUwLyQ/EDS-for-Commerce-Demo](https://www.figma.com/design/hl9x14ZQFTGKn7rEyUwLyQ/EDS-for-Commerce-Demo)

### Icons from [Lucide](https://lucide.dev/)

### Custom content blocks collection:

- banner (variant-1) | variant-2, variant-3, variant-4
- countdown-banner
- mega-hero
- interactive-banner | default and (corporate) variant
- contact-form
- store-locator
- newsletter-subscribe
- cards (shop-by)
- carousel (shop-by)

## Documentation

Before using the boilerplate, we recommend you to go through the documentation on <https://experienceleague.adobe.com/developer/commerce/storefront/> and more specifically:

1. [Storefront Developer Tutorial](https://experienceleague.adobe.com/developer/commerce/storefront/get-started/)
1. [AEM Docs](https://www.aem.live/docs/)
1. [AEM Developer Tutorial](https://www.aem.live/developer/tutorial)
1. [The Anatomy of an AEM Project](https://www.aem.live/developer/anatomy-of-a-project)
1. [Web Performance](https://www.aem.live/developer/keeping-it-100)
1. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Getting Started

Use the [Site Creator Tool](https://da.live/app/adobe-commerce/storefront-tools/tools/site-creator/site-creator) to quickly spin up your own copy of code and content.

Alternatively, you can follow our [Guide](https://experienceleague.adobe.com/developer/commerce/storefront/get-started/) for a more detailed walkthrough.

## Updating Drop-in dependencies

You may need to update one of the drop-in components, or `@adobe/magento-storefront-event-collector` or `@adobe/magento-storefront-events-sdk` to a new version. Besides checking the release notes for any breaking changes, ensure you also execute the `postinstall` script so that the dependenices in your `scripts/__dropins__` directory are updated to the latest build. This should be run immediately after you update the component, for example:

```bash
npm install @dropins/storefront-cart@2.0. # Updates the storefront-cart dependency in node_modules/
npm run postinstall # Copies scripts from node_modules into scripts/__dropins__
```

This is a custom script which copies files out of `node_modules` and into a local directory which EDS can serve. You must manually run `postinstall` due to a design choice in `npm` which does not execute `postinstall` after you install a _specific_ package.

### Product Detail Pages (PDPs)

Since October 2025, folder mapping is no longer configured by default as its [deprecated](https://www.aem.live/developer/folder-mapping). To keep it easy to start, static product pages have been created as part of the site template for all products listed on the homepage.

It is highly recommended to create physical product detail pages in Edge Delivery Services. Use the [AEM Commerce Prerenderer](https://github.com/adobe-rnd/aem-commerce-prerender) to implement a [byom overlay](https://www.aem.live/developer/byom#setup-byom-as-content-overlay) that creates and publishes product detail pages from the product data available in Catalog Service.
