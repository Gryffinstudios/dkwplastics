# DKW Plastics

Next.js reconstruction of DKW Plastic Industries' public website, including the homepage, product catalog, contact form, blog, and eight complete articles.

## Local development

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run check` for ESLint, TypeScript, and a production build.

## Vercel deployment

Import https://github.com/Gryffinstudios/dkwplastics into Vercel. Use the Next.js preset, repository root (`./`), build command `npm run build`, and the automatically detected output directory. Node.js is pinned to 24.x. No environment variables are currently required.

The `public/` directory contains the site's local visual assets and must be committed. Dependencies, local environment files, and generated build files are excluded by `.gitignore`.

## Current scope

- Homepage, `/shop/`, `/contact-us/`, `/blog/`, and eight article paths.
- Eight catalog categories, 37 gallery images, 25 product variants, and 125 specification rows.
- Responsive galleries, product specifications, customer reviews, and article navigation.
- The quote form validates input and prepares an email draft. Automatic email delivery is not configured.
- Nine externally hosted article images could not be downloaded because their host returned HTTP 403. Their original image URLs remain in the article content.
- Final rendered comparison of the added routes remains pending; build and HTTP checks have passed.

Source provenance, capture reports, and verification results are in `docs/research/dkwplastics/`. The Python helpers in `scripts/` reproduce the source import; they are not required to run or deploy the website.

## Attribution

Scaffolded from [JCodesMore's AI Website Cloner Template](https://github.com/JCodesMore/ai-website-cloner-template), under the included MIT license. DKW website content and brand assets retain their original ownership.
