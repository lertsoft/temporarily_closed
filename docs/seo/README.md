# SEO improvements within the original design

The original 3D book remains the homepage at `/` and starts automatically. Navigation labels, controls, loading screens, colors, typography, and layout are preserved. The AR page retains its automatic startup. The thank-you page retains its original appearance and content. The separate preview route, photo-gallery homepage, AR introduction, and theme overrides have been removed.

## Retained technical improvements

- Per-page descriptions, absolute HTTPS canonicals, social metadata, and Book structured data.
- Exactly one H1 per page. The AR loading heading is H2 with its original styling. The thank-you navigation label is a span with the original heading appearance.
- Breadcrumb structured data describes the existing home/AR navigation and confirmation-page hierarchy without inserting a new visual component.
- Generated sitemap for `/` and `/ar.html`. The post-checkout confirmation and error page are utility pages, excluded from the sitemap. No noindex directives were present or added.
- Permissive robots.txt with the sitemap URL. The original repository had no Googlebot block.
- WebP textures for the 20 existing displayed source images. Full-size derivatives total 2.95 MB compared with 12.66 MB for the source JPEGs. Original JPEG URLs and MindAR tracking bundles are retained.
- Concurrent book texture loading and a module preload for the existing Three.js dependency.
- Accessible canvas description, descriptive AR gallery alt text, and reserved image dimensions.
- Removed the nonexistent optional `ar-assets/target.mind` fallback. Internal links use the direct home URL.
- Custom 404 page using the site's existing confirmation-page styling and navigation.

`npm run check` regenerates the sitemap and validates JavaScript syntax, project smoke checks, metadata, one H1, structured data, local references, crawl rules, sitemap coverage, and WebP files.

The earlier 100-point Lighthouse result and 1.7-second LCP measured the rejected redesign. They do not apply to the restored original experience; that evidence has been removed. Loading the full 3D/AR experience within two seconds has not been verified.

The site serves static HTML through GitHub Pages; the 3D book and camera rendering still require JavaScript. Fully server-rendering that interactive content is not accomplished by these metadata changes. FAQ markup was removed together with the new FAQ section rather than describing content absent from the original page.

## Publication remains pending

These changes have not been published. GitHub Pages publishes main at the repository root. HTTPS enforcement and Search Console submission have not been changed. After publication, verify the live sitemap, robots rules, canonical URLs, HTTP-to-HTTPS behavior, and real 404 responses before submitting `https://temporarilyclosed.nyc/sitemap.xml` to the existing Search Console domain property.
