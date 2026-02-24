# Content Types Reference

> Complete documentation of all 13 Strapi content types, their fields, relations, and usage.

---

## Collection Types

### 1. Curso (Courses/Events)

**API ID:** `api::curso.curso`
**Admin Label:** Cursos
**Plural API endpoint:** `/api/cursos`

The central content type. Each course generates a page at `/eventos/[slug]` on the frontend.

| Field              | Type       | Required | Notes                                            |
| ------------------ | ---------- | -------- | ------------------------------------------------ |
| `title`            | String     | Yes      | Course name displayed everywhere                 |
| `slug`             | UID        | Yes      | Auto-generated from title, used for URL routing  |
| `category`         | Enum       | Yes      | `certificacion`, `taller`, or `gratuito`         |
| `event_date`       | Date       | No       | Course date (formatted to Spanish on frontend)   |
| `type_label`       | String     | No       | Override for category label (e.g. "Certificacion") |
| `slogan`           | String     | No       | Tagline shown below hero                         |
| `short_description`| Text       | No       | Brief description for meta tags                  |
| `main_image`       | Media      | Yes      | Hero image (used in cards and hero sections)     |
| `order_homepage`   | Integer    | No       | Display order in homepage hero slider (1-based). Set to show on homepage. |
| `order_upcoming`   | Integer    | No       | Display order in "upcoming events" section. Set to show in upcoming. |
| `estado`           | Enum       | Yes      | `disponible` or `no-disponible`. Controls CTA visibility. |
| `section1_text`    | RichText   | No       | First content section (markdown)                 |
| `section1_image`   | Media      | No       | Image for first content section                  |
| `section2_text`    | RichText   | No       | Second content section (markdown)                |
| `section2_image`   | Media      | No       | Image for second content section                 |
| `section2_quote`   | String     | No       | Quote displayed after section 2                  |
| `faq_intro_text`   | RichText   | No       | Intro text next to FAQ accordion                 |
| `cta_text`         | String     | No       | Call-to-action text                              |
| `cta_button_text`  | String     | No       | CTA button label                                 |
| `cta_button_link`  | String     | No       | CTA button URL (e.g. payment link)               |

**Relations:**
- `testimonials` — Many-to-Many with Testimonial
- `faqs` — Many-to-Many with FAQ
- `course_features` — Many-to-Many with Course Feature

**How visibility works:**
- `estado: "disponible"` — Page shows all CTAs, buttons, and registration links
- `estado: "no-disponible"` — Page is accessible but all CTAs are hidden, uses alternate footer
- `order_homepage >= 1` — Course appears in homepage hero slider, sorted by this number
- `order_upcoming` set — Course appears in "Proximos Eventos" section on `/eventos`

**Draft/Publish:** Content must be Published to appear in API responses.

---

### 2. Testimonial

**API ID:** `api::testimonial.testimonial`
**Plural API endpoint:** `/api/testimonials`

| Field               | Type     | Required | Notes                                    |
| ------------------- | -------- | -------- | ---------------------------------------- |
| `quote`             | RichText | Yes      | Testimonial text                         |
| `authorName`        | String   | Yes      | Person's name                            |
| `authorTitle`       | String   | No       | Title/role description                   |
| `order`             | Integer  | No       | Display order (ascending)                |
| `show_on_homepage`  | Boolean  | No       | Show on homepage testimonials section    |
| `show_on_about_page`| Boolean  | No       | Show on about page testimonials section  |

**Relations:**
- `cursos` — Many-to-Many with Curso

**Design:** A single testimonial can appear on the homepage, about page, AND be linked to multiple courses simultaneously. This avoids duplicating testimonial entries.

---

### 3. FAQ

**API ID:** `api::faq.faq`
**Plural API endpoint:** `/api/faqs`

| Field      | Type     | Required | Notes                           |
| ---------- | -------- | -------- | ------------------------------- |
| `question` | String   | Yes      | The question text               |
| `answer`   | RichText | Yes      | The answer (markdown, converted to HTML on frontend) |

**Relations:**
- `cursos` — Many-to-Many with Curso

FAQs appear in the accordion section on course detail pages. Each FAQ can be shared across multiple courses.

---

### 4. Course Feature (Caracteristicas)

**API ID:** `api::course-feature.course-feature`
**Plural API endpoint:** `/api/course-features`

| Field         | Type     | Required | Notes                              |
| ------------- | -------- | -------- | ---------------------------------- |
| `icon`        | Media    | Yes      | Small icon image                   |
| `title`       | String   | Yes      | Feature title (e.g. "Manual Incluido") |
| `description` | RichText | No       | Feature description                |

**Relations:**
- `courses` — Many-to-Many with Curso (inverse side of Curso's `course_features`)

Displayed as icon cards in the "What does this course include?" section.

---

### 5. Certification

**API ID:** `api::certification.certification`
**Plural API endpoint:** `/api/certifications`

| Field   | Type    | Required | Notes                               |
| ------- | ------- | -------- | ----------------------------------- |
| `title` | String  | Yes      | Certification name                  |
| `icon`  | Media   | Yes      | Certification icon/badge image      |
| `order` | Integer | No       | Display order on about page         |

Displayed on the About page as icon cards showing Vanessa's credentials.

---

### 6. Service Card (Carta de Categoria)

**API ID:** `api::service-card.service-card`
**Plural API endpoint:** `/api/service-cards`

| Field   | Type    | Required | Notes                                 |
| ------- | ------- | -------- | ------------------------------------- |
| `title` | String  | Yes      | Card title (e.g. "Certificaciones")   |
| `link`  | String  | Yes      | URL the card links to                 |
| `image` | Media   | Yes      | Card background image                 |
| `order` | Integer | No       | Display order on homepage             |

These are the category navigation cards on the homepage (e.g. "Certificaciones", "Talleres", "Eventos Gratuitos").

---

### 7. About Scroll Item (Sobre Mi Cosas)

**API ID:** `api::about-scroll-item.about-scroll-item`
**Plural API endpoint:** `/api/about-scroll-items`

| Field     | Type     | Required | Notes                              |
| --------- | -------- | -------- | ---------------------------------- |
| `title`   | String   | Yes      | Item title                         |
| `content` | RichText | Yes      | Item description (markdown)        |
| `image`   | Media    | Yes      | Item image                         |
| `order`   | Integer  | Yes      | Display order in horizontal scroll |

These are the "8 things about me" horizontal scroll items on the About page.

---

### 8. About Text Section (Sobre Mi Info)

**API ID:** `api::about-text-section.about-text-section`
**Plural API endpoint:** `/api/about-text-sections`

| Field          | Type     | Required | Notes                              |
| -------------- | -------- | -------- | ---------------------------------- |
| `title`        | String   | No       | Section heading                    |
| `content`      | RichText | No       | Section body text (markdown)       |
| `image`        | Media    | Yes      | Side image                         |
| `order`        | Integer  | No       | Display order                      |
| `reverseOrder` | Boolean  | No       | Flip image/text layout (default: true) |

Side-by-side image + text sections on the About page.

---

## Single Types

### 9. Homepage About (Inicio Info)

**API ID:** `api::homepage-about.homepage-about`
**Endpoint:** `/api/homepage-about`

| Field        | Type     | Required | Notes                      |
| ------------ | -------- | -------- | -------------------------- |
| `title`      | String   | No       | Section heading            |
| `content`    | RichText | Yes      | About text (markdown)      |
| `image`      | Media    | Yes      | Side image                 |
| `buttonText` | String   | No       | CTA button label           |
| `buttonLink` | String   | No       | CTA button URL             |

The "Acerca de mi" section on the homepage. Also reused at the bottom of course detail pages.

---

### 10. Homepage Quote (Inicio Frase)

**API ID:** `api::homepage-quote.homepage-quote`
**Endpoint:** `/api/homepage-quote`

| Field   | Type     | Required | Notes             |
| ------- | -------- | -------- | ----------------- |
| `quote` | RichText | Yes      | Full-width quote  |

---

### 11. About Quote (Sobre Mi Frase)

**API ID:** `api::about-quote.about-quote`
**Endpoint:** `/api/about-quote`

| Field   | Type     | Required | Notes             |
| ------- | -------- | -------- | ----------------- |
| `quote` | RichText | Yes      | Full-width quote  |

---

### 12. Certificaciones Page (Pagina de Certificaciones)

**API ID:** `api::certificaciones-page.certificaciones-page`
**Endpoint:** `/api/certificaciones-page`

| Field     | Type     | Required | Notes                              |
| --------- | -------- | -------- | ---------------------------------- |
| `content` | RichText | No       | Page body (markdown list of certs) |
| `image`   | Media    | No       | Page header image                  |

Full list of all Vanessa's certifications and training. The markdown content contains a bulleted list of 25+ credentials.

---

## Relationships Map

```
Curso ──── manyToMany ──── Testimonial
  │                           │
  │                           ├── show_on_homepage (boolean filter)
  │                           └── show_on_about_page (boolean filter)
  │
  ├──── manyToMany ──── FAQ
  │
  └──── manyToMany ──── Course Feature
                              │
                              └── icon (media)
```

**Important:** Relations are bidirectional in Strapi. When you link a Testimonial to a Curso on either side of the admin, both sides update.

---

## Content Workflow

1. **Create** a new entry in Strapi admin (it starts as Draft)
2. **Fill in all required fields** (especially media fields)
3. **Set relations** (link testimonials, FAQs, features to courses)
4. **Publish** the entry (click "Publish" button — this is critical!)
5. **Trigger a Vercel redeploy** so the frontend picks up the new content
6. **Verify** the content appears correctly on the live site

### Common Mistake: Forgetting to Publish

Strapi v5 uses draft/publish by default. Content in Draft state is invisible to the REST API. Always check that content is Published, not just Saved.
