# DKW Plastics homepage clone

The project now also includes shop/contact/blog routes. See [full-site continuation status](fullsite-status.md) for current scope, source gaps, and the capture command. The homepage-only scope notes below describe the earlier phase.

Source: https://dkwplastics.com/

## Routes and ownership

| Source | Local | Files |
| --- | --- | --- |
| `/` | `http://localhost:3000/` | `src/app/page.tsx`, `src/components/sites/dkwplastics/dkw-home.tsx` |
| `/#journey` | `/#journey` | Client introduction and logos in `dkw-home.tsx` |
| `/#client-reviews` | `/#client-reviews` | Customer carousel in `dkw-home.tsx` |

The source homepage is rebuilt as editable React components. The original WordPress scripts, tracking scripts, page-save browser extension markup, and production bundles are not executed or embedded. `content.json` contains extracted, inspectable copy. Product descriptions contain only sanitized text, paragraph, list, emphasis, and line-break markup. Styles are scoped in `dkw.css`.

`public/sites/dkwplastics/` owns the source images, original inline SVG logo, original Red Hat Display variable font, and original JPEG hero background. `asset-map.json` records the saved-file mapping and original font/background URLs. All displayed homepage assets are local.

## Observed design and states

- Original source viewed in Chrome at 1920 × 945 and 766 × 715 content viewports. Local page rendered at the same sizes for hero comparison.
- Navy textured hero, white contact strip, centered original logo and four-link desktop navigation. White separator below desktop contacts. Mobile replaces navigation with a menu, centers a smaller logo, and stacks statistics in two columns.
- Original page-wide CSS overrides every font with Red Hat Display and uses 1px letter spacing; hero title retains its specific 1.5px spacing. Desktop hero title is 50px; mobile is 26px. Hero statistics are 30px desktop and 16px mobile.
- Original global content width is 1140px. Eight product cards form four desktop rows and one mobile column; original product images and full text are included.
- Sections: hero/statistics, moving product strip, past clients/logos, product montage, products/sectors, services, global exposure/map, custom packaging, reviews, and footer.
- Original testimonial settings specify two desktop cards, a single mobile card, 5000ms autoplay, looping, and pause on hover/interaction. Local version follows those settings and respects reduced motion.
- Services expose two items on desktop and one on mobile, with previous/next buttons. All three original services remain reachable.

## Verification

- Local desktop/mobile hero comparisons completed in Chrome; fixed the SVG's case-sensitive pattern attributes, font override, title spacing, logo placement, and contact layout.
- Mobile menu opened successfully; Client Reviews navigated to the local review section and closed the menu. Review navigation changed the displayed testimonial.
- Lint, strict TypeScript checks, and optimized production compilation run through `npm run check`.
- Homepage and all local visual assets checked through HTTP. See `verification.json` for results from the final check.

## Known differences and scope

- Shop/product-detail, contact, and blog pages were not included in the saved source. Their links retain original live destinations. Maps, telephone, email, and developer-credit destinations also remain intact.
- The original Get Started action opens an Elementor popup whose form content was not captured. The local dialog provides actual email/telephone actions instead of an unconnected submission form; closing and Escape restore focus to the opener.
- Lower sections are recreated from saved HTML/CSS and original media; a full-page rendered comparison at every breakpoint remains outstanding. Minor spacing, carousel transition, icon, and timing differences may remain. Native browser inspection was intermittently interrupted by detected user input, so no screenshot comparison files were saved.
- No inquiry has been sent. The clone uses no form backend or WordPress plugin integration.

## Run

From the project folder, run `npm run dev`, then open http://localhost:3000. Run `npm run check` to validate changes. Content, components, and CSS can all be edited locally.

To regenerate extracted assets/content from the user's saved HTML in the parent directory, run `python scripts/extract-dkw.py`. The saved HTML and source stylesheet evidence are references only.
