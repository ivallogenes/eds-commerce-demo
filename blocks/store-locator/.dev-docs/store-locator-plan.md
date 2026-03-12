# Store Locator Block - Implementation Plan

## Status

Implementation complete and successful. The block is implemented, documented, and verified working as expected on the contact page.

## Executive Summary

Implement a new `store-locator` block for the contact page in the EDS Commerce app. The block will read a single authored configuration key, `address`, via `readBlockConfig()`, render a fixed heading `Visit Our Store`, and display a Google Maps embed for the configured location. The UI will be generated entirely by block logic and styled with scoped block CSS.

## Current State

- The DA-side `store-locator` block table already exists conceptually and is expected to provide one config row: `address`.
- The runtime block folder did not exist before this task.
- Similar local patterns already exist:
  - `blocks/contact-form/contact-form.js` for full UI generation from JS.
  - `blocks/commerce-account-header/commerce-account-header.js` for simple `readBlockConfig()` usage.
  - `blocks/fragment/_fragment.json` and `blocks/targeted-block/_targeted-block.json` for DA metadata and single-block model wiring.
- The repo requires mirrored DA metadata updates in both block-local JSON and aggregate model/filter files.

## Proposed Future State

- `store-locator` becomes a simple configuration-driven block with a one-field DA model.
- The block reads `address`, normalizes it, and creates a Google Maps embed URL safely.
- The rendered UI includes:
  - heading `Visit Our Store`
  - responsive map frame container
  - fallback empty/error state when the address is missing or unusable
- The block ships with:
  - runtime JS
  - source + compiled CSS
  - DA metadata definition and model
  - allow-list wiring in aggregate files
  - README documenting authoring and behavior

## Implementation Phases

### Phase 1: Block Scaffolding And Authoring Metadata

- Create `blocks/store-locator/store-locator.js`
- Create `blocks/store-locator/source/store-locator.css`
- Create `blocks/store-locator/store-locator.css`
- Create `blocks/store-locator/_store-locator.json`
- Add `store-locator` definition wiring to:
  - `models/_component-definition.json`
  - `models/_section.json`
  - `component-definition.json`
  - `component-filters.json`
- Add the new block model to the merged component models as needed through block-local metadata and aggregate outputs.

Acceptance criteria:
- Block files and metadata files exist in the expected locations.
- `store-locator` is allowed in the section block list.
- The DA model exposes a single `address` text field.

### Phase 2: Runtime Implementation

- Use `readBlockConfig(block)` to read `address`.
- Normalize the authored string:
  - trim whitespace
  - collapse repeated whitespace
  - reject empty values
- Generate an embed URL using a safe URL-building path rather than raw concatenation.
- Render semantic DOM for the block using block-owned markup.
- Provide a fallback state if no valid address is present.

Acceptance criteria:
- The block renders without authored display markup.
- A valid address produces a map iframe.
- Missing/blank address does not throw and produces a graceful fallback state.

### Phase 3: Styling

- Implement scoped block styles using theme tokens.
- Ensure the heading and map frame match the contact-page design intent.
- Keep mobile-first layout and responsive iframe sizing.

Acceptance criteria:
- Styles are scoped to `main .store-locator`.
- The iframe container is responsive and visually stable.
- The block looks correct on mobile and desktop widths.

### Phase 4: Documentation And Validation

- Create `blocks/store-locator/README.md`
- Document the DA-side authored config structure and runtime behavior.
- Run diagnostics/lint checks where possible.
- Update this dev-doc context and checklist after implementation milestones.

Acceptance criteria:
- README exists and matches the local block README pattern.
- Touched files report no workspace diagnostics.
- Dev-doc progress reflects actual implementation state.

## Technical Decisions

### Google Maps Rendering Strategy

Use a lightweight Google Maps iframe based on the authored address string.

Preferred URL shape:
- `https://www.google.com/maps?q=<encoded-address>&output=embed`

Reasoning:
- avoids backend integration
- avoids API-key management for this simple use case
- keeps authoring contract minimal
- matches the requested single-location display behavior

### Sanitization And Encoding

- Never inject the authored address as HTML.
- Normalize the string before using it.
- Build the embed URL with `URL` and `searchParams` or equivalently safe encoding.
- Use escaped text for any visible fallback message that includes user-authored content.

### Fallback Behavior

If no usable `address` is authored:
- still render the block heading
- show a simple block-scoped fallback message such as `Store location unavailable.`
- do not render a broken iframe

## Risks

- Google embed URLs may be affected by CSP or frame restrictions in some environments.
- Some authored addresses may resolve ambiguously on Google Maps.
- Invalid addresses may render a blank or unexpected map.
- If aggregate JSON files are not synchronized, the block may appear inconsistently in DA tooling.

## Mitigations

- Keep the embed approach minimal and testable.
- Handle missing/blank addresses before rendering the iframe.
- Update both source model files and mirrored aggregate JSON files.
- Prefer stable CSS aspect-ratio sizing to avoid layout shifts.

## Success Metrics

- The block can be authored with a single `address` field.
- A configured address renders a visible map on the contact page.
- The block does not rely on authored presentation markup.
- The block has no diagnostics on touched files.
- The block is documented for both developers and authors.