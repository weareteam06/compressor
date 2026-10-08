# Backend-managed website content

The public site loads `/api/site-config` once through `SiteConfigProvider`. Page copy uses that shared configuration; products, categories, industries, services, news, careers, distributors and media continue to use their existing APIs.

In **Admin → Settings → Public Website Content**, edit `publicContent` to manage:

- `heroSlides`: carousel text, backgrounds, optional image overrides and preferred product models.
- `faqs`, `technicalFaqs`, `warrantyFaqs`, `technicalChecklist`, `seriesGuide`: information pages and comparisons.
- `brochures`: document titles, descriptions and backend media URLs.
- `productSeries`, `productOrder`, `productGuidance`, `categoryDisplayNames`: product presentation and selection guidance.
- `footer`, `productLinks`, `companyLinks`: footer branding and links. Phone and email use the existing contact settings.
- `chatbot`, `quickActions`: assistant introduction, actions and status copy. Answers come from the backend chatbot API.
- `text`: page headings, paragraphs and control text grouped by component.
- `routeMeta`: default route metadata; existing SEO settings override it.

Keep field names and value types intact. Empty arrays hide list entries; empty strings clear text. The editor and API validate the structure before saving. Existing home, about, navigation, contact, page-content and SEO editors remain available. Interface behavior, technical units, enum values, validation messages and the offline/retry screen remain application code.

Backend startup seeds the new section and media assets, filling missing fields without replacing existing saved values. Restart the backend after updating Java sources. The backend serves the built frontend at its public and admin routes, including direct links. Run `npm --prefix frontend run build` before serving the production frontend.

For a separate API origin, set `VITE_API_BASE_URL` to its full API base (for example `https://api.example.com/api`) when building. Backend `/api/media/…` URLs are resolved against that base. The Vite development proxy uses `VITE_API_PROXY_TARGET` (default `http://localhost:8000`).

Site-config HTTP errors, invalid JSON, missing required content and requests taking over 15 seconds show a retry screen. Failed refreshes preserve the last successful page. There is no local business-content fallback for the migrated sections.

Validation:

```powershell
node scripts/generate-content-schema.cjs
cd frontend
node node_modules/typescript/bin/tsc --noEmit
node --test tests/*.test.mjs
npm run build
cd ../backend
mvn test
```

When changing the `publicContent` structure, update `PublicContent` and regenerate its structural schema. The optional `frontend/tests/browserContent.mjs` integration check expects a frontend on port 5176, backend on 8001, and an isolated Chrome debugging session on 9333. It simulates failed and malformed config responses without modifying saved content.
