# CLAUDE.md — Vanessa Ramirez CMS (Strapi)

> **Read this file first.** Then read every file inside `docs/` before making any changes.

---

## Project Summary

This is the **Strapi v5 headless CMS backend** for the Vanessa Ramirez coaching website. It manages all dynamic content (courses, testimonials, FAQs, page sections, etc.) and serves it via REST API to an Astro frontend that statically generates the website at build time.

- **CMS Admin:** <https://meaningful-fitness-6cded77ff5.strapiapp.com/admin>
- **CMS API:** <https://meaningful-fitness-6cded77ff5.strapiapp.com/api>
- **Frontend repo:** <https://github.com/3333444n/vane-website>
- **CMS repo:** <https://github.com/3333444n/vane-website-cms>
- **Live site (preview):** <https://vane-preview.vercel.app/>
- **Production URL:** <https://vanessaramirezcoach.com>

---

## Stack

| Layer       | Technology                                             |
| ----------- | ------------------------------------------------------ |
| CMS         | **Strapi 5.16.1** (headless CMS, REST API)             |
| Database    | **SQLite** (local dev) / **PostgreSQL** (production)    |
| Language    | **TypeScript**                                          |
| Auth Plugin | `@strapi/plugin-users-permissions` (roles, API tokens)  |
| Cloud       | `@strapi/plugin-cloud` (Strapi Cloud deployment)        |
| Node.js     | 18.x - 22.x                                            |
| Hosting     | **Strapi Cloud** (migrating to self-hosted VPS)         |

---

## How the System Works

```
Content Editor (Strapi Admin UI)
       |
       v
Strapi CMS (this project) — stores content in PostgreSQL
       |
       v  REST API (/api/*)
       |
Website Build (Astro) — runs `fetch:strapi` script at build time
       |
       v  Writes JSON to src/data/strapi/
       |
Astro SSG — reads JSON, generates static HTML
       |
       v
Vercel — serves static site
```

**Key concept:** The frontend does NOT call Strapi at runtime. All data is fetched at build time, cached as JSON, and baked into static HTML. Content changes in Strapi require a Vercel redeploy to appear on the live site.

---

## File Structure

```
vane-cms/
├── config/
│   ├── admin.ts              # Admin panel config (JWT, tokens, encryption)
│   ├── api.ts                # REST API limits (default: 25, max: 100)
│   ├── database.ts           # DB config (SQLite local, PostgreSQL prod)
│   ├── middlewares.ts         # CORS, CSP, security middleware
│   ├── plugins.ts             # Plugin config (currently empty)
│   └── server.ts             # Server host/port config
├── src/
│   ├── api/                  # Content type definitions (13 total)
│   │   ├── curso/            # Courses/events
│   │   ├── testimonial/      # Testimonials
│   │   ├── faq/              # FAQs
│   │   ├── course-feature/   # Course features/characteristics
│   │   ├── certification/    # Vanessa's certifications
│   │   ├── service-card/     # Homepage service category cards
│   │   ├── about-scroll-item/    # "8 things about me" items
│   │   ├── about-text-section/   # About page text sections
│   │   ├── homepage-about/       # Homepage about section (single type)
│   │   ├── homepage-quote/       # Homepage quote (single type)
│   │   ├── about-quote/          # About page quote (single type)
│   │   └── certificaciones-page/ # Certifications page (single type)
│   ├── admin/                # Admin panel customization
│   ├── extensions/           # Custom extensions (currently empty)
│   └── index.ts              # Bootstrap file with startup logging
├── public/uploads/           # Media file storage (local dev only)
├── types/generated/          # Auto-generated TypeScript types
├── database/                 # Migration files
├── docs/                     # Detailed documentation
│   ├── content-types.md      # All 13 content types documented
│   ├── api-reference.md      # API endpoints and query examples
│   ├── frontend-integration.md   # How the frontend consumes this CMS
│   └── self-hosting.md       # Guide for migrating off Strapi Cloud
├── CLAUDE.md                 # <- You are here
├── package.json
├── tsconfig.json
└── .env                      # Environment variables (gitignored)
```

---

## Content Types (13 Total)

See `docs/content-types.md` for full field-level documentation.

### Collection Types (multiple entries)

| Content Type     | API ID              | Admin Label             | Purpose                              |
| ---------------- | ------------------- | ----------------------- | ------------------------------------ |
| Curso            | `api::curso.curso`  | Cursos                  | Courses, workshops, events           |
| Testimonial      | `api::testimonial.testimonial` | Testimonial  | Client testimonials                  |
| FAQ              | `api::faq.faq`      | FAQs                    | Frequently asked questions           |
| Course Feature   | `api::course-feature.course-feature` | Caracteristicas | Course features (icon cards) |
| Certification    | `api::certification.certification` | Certificaciones | Vanessa's certs/credentials |
| Service Card     | `api::service-card.service-card` | Carta de Categoria | Homepage category cards    |
| About Scroll Item | `api::about-scroll-item.about-scroll-item` | Sobre Mi Cosas | "8 things" scroll items |
| About Text Section | `api::about-text-section.about-text-section` | Sobre Mi Info | About page sections     |

### Single Types (one entry each)

| Content Type       | API ID                           | Purpose                     |
| ------------------ | -------------------------------- | --------------------------- |
| Homepage About     | `api::homepage-about.homepage-about` | Homepage about section  |
| Homepage Quote     | `api::homepage-quote.homepage-quote` | Homepage quote banner   |
| About Quote        | `api::about-quote.about-quote`       | About page quote banner |
| Certificaciones Page | `api::certificaciones-page.certificaciones-page` | Certs page content |

---

## Commands

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Start Strapi with hot reload (local development) |
| `npm run develop`  | Alias for `dev`                                  |
| `npm run build`    | Build admin panel for production                 |
| `npm run start`    | Start production server (no hot reload)          |
| `npm run deploy`   | Deploy to Strapi Cloud                           |
| `npm run strapi`   | Run Strapi CLI directly                          |

---

## Environment Variables

| Variable               | Description                          | Required |
| ---------------------- | ------------------------------------ | -------- |
| `HOST`                 | Server bind address (default: 0.0.0.0) | Yes   |
| `PORT`                 | Server port (default: 1337)          | Yes      |
| `APP_KEYS`             | Comma-separated encryption keys      | Yes      |
| `API_TOKEN_SALT`       | Salt for API token generation        | Yes      |
| `ADMIN_JWT_SECRET`     | Admin authentication JWT secret      | Yes      |
| `TRANSFER_TOKEN_SALT`  | Salt for data transfer tokens        | Yes      |
| `JWT_SECRET`           | General JWT secret                   | Yes      |
| `ENCRYPTION_KEY`       | Master encryption key                | Yes      |
| `DATABASE_CLIENT`      | Database type: `sqlite` or `postgres` | No (defaults to sqlite) |
| `DATABASE_URL`         | PostgreSQL connection string (prod)  | Prod only |
| `DATABASE_FILENAME`    | SQLite file path (default: .tmp/data.db) | Dev only |

---

## Rules

1. **All content types use Draft/Publish.** Content must be explicitly **Published** in the admin UI to appear in API responses. Draft content is invisible to the frontend.
2. **Do NOT modify content type schemas casually.** Schema changes affect the frontend's data transformations. Coordinate with the frontend codebase.
3. **Media is stored differently per environment.** Local dev uses `/public/uploads/`, Strapi Cloud uses its own CDN, and self-hosted will use local storage or an S3 provider.
4. **The frontend fetches data at build time.** After making content changes in Strapi, the Vercel site must be redeployed for changes to appear on the live site.
5. **Protect API tokens.** Never commit `.env` files. The frontend uses a read-only API token to fetch data.
6. **All controllers/routes/services use Strapi factories.** There is no custom business logic - everything delegates to `factories.createCoreController()`, etc.

---

## CORS Configuration

Allowed origins (configured in `config/middlewares.ts`):
- `http://localhost:4321` — Local Astro dev server
- `http://localhost:3000` — Alternative local dev
- `https://vane-preview.vercel.app` — Vercel preview
- `https://*.vercel.app` — All Vercel deployment URLs

When self-hosting, update CORS origins to include your production domain.

---

## Docs Folder

| File                       | Purpose                                              |
| -------------------------- | ---------------------------------------------------- |
| `docs/content-types.md`    | All 13 content types with fields, relations, enums   |
| `docs/api-reference.md`    | REST API endpoints, query patterns, populate syntax   |
| `docs/frontend-integration.md` | How the Astro frontend consumes CMS data         |
| `docs/self-hosting.md`     | Migration guide for self-hosting on a VPS            |

---

## DO NOTs

1. **DO NOT delete or rename content type fields** without updating the frontend transformations in `website/src/lib/strapi.ts` and `website/src/lib/strapi-data.ts`.
2. **DO NOT change the `slug` field format** on Cursos. The frontend uses slugs for URL routing (`/eventos/[slug]`).
3. **DO NOT use `populate=*`** in production API queries. Always specify exact fields to populate.
4. **DO NOT commit `.env` files** or hardcode secrets in config files.
5. **DO NOT upgrade Strapi major versions** (e.g. v5 to v6) without thorough testing. Strapi major upgrades often break API response formats.
6. **DO NOT add custom controllers/routes** unless absolutely necessary. Use Strapi's built-in features (lifecycle hooks, custom fields) first.

---

## Known Issues & Gotchas

### Draft/Publish Confusion
Content added in Strapi is in **Draft** state by default. It must be explicitly **Published** to appear in API responses. This is the most common reason for "I added content but it doesn't show up."

### Build-Time Data
The frontend is a static site. Content changes in Strapi do NOT appear on the live website until Vercel rebuilds. Either push a commit to trigger CI/CD, or manually redeploy from the Vercel dashboard.

### Image URLs
- **Strapi Cloud:** Images use `https://meaningful-fitness-6cded77ff5.media.strapiapp.com/` URLs
- **Local dev:** Images use `http://localhost:1337/uploads/` URLs
- **Self-hosted:** Will use your server's domain

The frontend's `getImageUrl()` function handles both relative and absolute URLs, but always verify images load correctly after deployment changes.

---

*Designed and developed by [Arko](https://arko.dev)*
