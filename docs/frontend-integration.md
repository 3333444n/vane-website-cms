# Frontend Integration

> How the Astro frontend consumes data from this Strapi CMS.

---

## Architecture Overview

The frontend is a **statically generated Astro site**. It does NOT call Strapi at runtime. Instead:

```
1. Build starts on Vercel (triggered by git push or manual deploy)
2. `npm run fetch:strapi` runs first (scripts/fetch-strapi-data.mjs)
3. Script calls Strapi REST API with Bearer token
4. API responses saved as JSON to src/data/strapi/
5. Astro build reads JSON files, generates static HTML
6. Static HTML deployed to Vercel CDN
```

---

## Key Frontend Files

All paths relative to the `website/` project root:

| File                              | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `scripts/fetch-strapi-data.mjs`   | Build-time script that fetches all Strapi data   |
| `src/lib/strapi.ts`               | API client, TypeScript types, transform functions |
| `src/lib/strapi-data.ts`          | JSON file loaders, data transformations          |
| `src/data/strapi/homepage.json`   | Cached homepage data                             |
| `src/data/strapi/about.json`      | Cached about page data                           |
| `src/data/strapi/courses.json`    | Cached courses data (all courses + relations)    |
| `src/data/strapi/certificaciones.json` | Cached certifications page data             |
| `.env`                            | `STRAPI_URL` and `STRAPI_API_TOKEN`              |

---

## Data Flow Per Page

### Homepage (`/`)

```
homepage.json → loadHomepageData() → transform functions → components
```

Data consumed:
- `serviceCards` → ServiceCardGrid component
- `homepageAbout` → ImageTextSection component
- `homepageQuote` → Quote component
- `testimonials` → TestimonialSection component
- `courses.json` → getHomepageHeroCourses() → HeroSection (Swiper slider)

**Hero slider logic:** Courses with `estado: "disponible"` AND `order_homepage >= 1` appear in the homepage hero, sorted by `order_homepage`.

### About Page (`/acerca-de-mi`)

```
about.json → loadAboutPageData() → transform functions → components
```

Data consumed:
- `textSections` → ImageTextSection components
- `scrollItems` → ImageWithTextScroll component
- `certifications` → IconCardSection component
- `aboutQuote` → Quote component
- `testimonials` → TestimonialSection component

### Events Listing (`/eventos`)

```
courses.json → loadCoursesData() → filter/sort functions → EventCard components
```

Filter functions:
- `getProximosEventos()` — courses with `order_upcoming` set, `estado: "disponible"`
- `getCertificacionesEvents()` — `category: "certificacion"`, `estado: "disponible"`
- `getTalleresEvents()` — `category: "taller"`, `estado: "disponible"`
- `getGratuitosEvents()` — `category: "gratuito"`, `estado: "disponible"`

### Course Detail (`/eventos/[slug]`)

```
courses.json → getStaticPaths() generates one page per course
             → getCourseWithRelations(slug) loads course + FAQs + testimonials + features
             → transformCourseForLegacyPage() converts to page template format
```

This is the most complex page. It uses:
- Course fields → EventHero, ImageTextSection, Quote, LastCTA
- `course.testimonials` → TestimonialSection
- `course.faqs` → TextFAQSection
- `course.course_features` → IconCardSection
- `homepage.json`'s homepageAbout → reused ImageTextSection at bottom

### Certificaciones Page (`/certificaciones`)

```
certificaciones.json → content rendered as markdown → HTML
```

---

## Fallback System

The frontend has a 3-tier fallback system:

1. **Strapi API data** (fetched at build time, saved to JSON)
2. **Cached JSON files** (if API call fails, uses last-known-good JSON)
3. **Hardcoded fallback data** (if JSON files don't exist or are empty)

This means the site **never fails to build** due to Strapi being down. It just uses stale or default content.

The fetch script (`fetch-strapi-data.mjs`) catches errors per-endpoint:

```javascript
try {
  const data = await getCourses();
  await fs.writeFile(coursesFilePath, JSON.stringify(data, null, 2));
} catch (error) {
  // Write empty array — build continues, pages just have no courses
  await fs.writeFile(coursesFilePath, JSON.stringify([], null, 2));
}
```

---

## Image Handling

The frontend's `getImageUrl()` function handles multiple image object structures:

```typescript
// Structure 1: Direct (Strapi v5 flat format)
{ url: "https://cdn.example.com/image.jpg" }

// Structure 2: Nested attributes (Strapi v4 format)
{ attributes: { url: "/uploads/image.jpg" } }

// Structure 3: Data wrapper
{ data: { attributes: { url: "/uploads/image.jpg" } } }
```

Relative URLs (starting with `/`) are prefixed with `STRAPI_URL`. Absolute URLs (starting with `http`) are used as-is.

**When Strapi Cloud is used:** Images have absolute URLs on `media.strapiapp.com`.
**When self-hosted:** Images may have relative URLs — the frontend handles both cases.

---

## Adding a New Course (End-to-End)

1. **In Strapi Admin:**
   - Create new Curso entry
   - Fill all required fields (title, slug, category, main_image, estado)
   - Set `order_homepage` (number) if it should appear on the homepage hero
   - Set `order_upcoming` (number) if it should appear in upcoming events
   - Link related testimonials, FAQs, and course features
   - **PUBLISH the entry** (critical — drafts are invisible to the API!)

2. **Trigger frontend rebuild:**
   - Push any commit to the frontend repo, OR
   - Manually redeploy from Vercel dashboard

3. **Verify:**
   - Check the build logs on Vercel for "Fetching courses data..."
   - Visit `/eventos` to see the course in listings
   - Visit `/eventos/[slug]` for the detail page
   - Check homepage hero slider if `order_homepage` was set

---

## Adding a New Content Type (CMS + Frontend)

### CMS Side (this project)

1. Create content type in `src/api/[name]/content-types/[name]/schema.json`
2. Create controller, route, service using Strapi factories
3. Set permissions in Admin > Settings > Users & Permissions > Public

### Frontend Side (website project)

1. Add TypeScript interface in `src/lib/strapi.ts`
2. Add API fetch function in `src/lib/strapi.ts`
3. Add transformation function in `src/lib/strapi-data.ts`
4. Add fetch call to `scripts/fetch-strapi-data.mjs`
5. Add JSON loader function in `src/lib/strapi-data.ts`
6. Use in Astro page with fallback data

See `config/STRAPI-INTEGRATION-GUIDE.md` in this repo for detailed code examples.

---

## Environment Variables (Frontend)

The frontend needs two env vars (in `website/.env`):

```env
STRAPI_URL=https://meaningful-fitness-6cded77ff5.strapiapp.com
STRAPI_API_TOKEN=<read-only-api-token>
```

These must also be set in Vercel's environment variable settings for production builds.

---

## Debugging: Content Not Showing Up

Checklist when content added in Strapi doesn't appear on the site:

1. **Is the content Published?** (not Draft) — Check Strapi admin
2. **Was a rebuild triggered?** — Check Vercel deployment history
3. **Did the fetch script succeed?** — Check Vercel build logs for errors
4. **Is the API token valid?** — Token may have expired or been regenerated
5. **Is the content filtered out?** — Check `estado`, `order_homepage`, `order_upcoming` fields
6. **Is the JSON cache updated?** — Run `npm run fetch:strapi` locally and inspect the JSON files
7. **Is the slug correct?** — Course slugs must be URL-safe (auto-generated from title)
