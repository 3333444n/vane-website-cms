# API Reference

> REST API endpoints, query patterns, and populate syntax for the Strapi CMS.

---

## Base URL

- **Strapi Cloud:** `https://meaningful-fitness-6cded77ff5.strapiapp.com/api`
- **Local dev:** `http://localhost:1337/api`

## Authentication

All API requests require a Bearer token in the Authorization header:

```
Authorization: Bearer <STRAPI_API_TOKEN>
```

The token is a read-only API token generated in Strapi Admin > Settings > API Tokens.

---

## API Defaults

Configured in `config/api.ts`:
- **Default limit:** 25 entries per request
- **Max limit:** 100 entries per request
- **Includes count:** Yes (total count in meta)

---

## Endpoints

### Courses

```bash
# All courses with all relations (used by frontend build)
GET /api/cursos?populate=main_image,section1_image,section2_image,testimonials,faqs,course_features&populate[course_features][populate]=icon&sort=order_homepage:asc

# Single course by slug
GET /api/cursos?filters[slug][$eq]=lectura-de-oraculo-angelical&populate=main_image,section1_image,section2_image,testimonials,faqs,course_features&populate[course_features][populate]=icon

# Available courses only
GET /api/cursos?filters[estado][$eq]=disponible&populate=main_image&sort=order_homepage:asc

# Courses by category
GET /api/cursos?filters[category][$eq]=certificacion&populate=main_image
GET /api/cursos?filters[category][$eq]=taller&populate=main_image
GET /api/cursos?filters[category][$eq]=gratuito&populate=main_image
```

### Testimonials

```bash
# Homepage testimonials
GET /api/testimonials?filters[show_on_homepage][$eq]=true&sort=order:asc

# About page testimonials
GET /api/testimonials?filters[show_on_about_page][$eq]=true&sort=order:asc

# Testimonials for a specific course (by course documentId)
GET /api/testimonials?filters[cursos][documentId][$eq]=<documentId>&sort=order:asc
```

### FAQs

```bash
# FAQs for a specific course
GET /api/faqs?filters[cursos][documentId][$eq]=<documentId>
```

### Homepage Data

```bash
# Service cards
GET /api/service-cards?populate=image&sort=order:asc

# Homepage about section
GET /api/homepage-about?populate=image

# Homepage quote
GET /api/homepage-quote
```

### About Page Data

```bash
# Text sections
GET /api/about-text-sections?populate=image&sort=order:asc

# Scroll items ("8 things about me")
GET /api/about-scroll-items?populate=image&sort=order:asc

# Certifications (icon cards)
GET /api/certifications?populate=icon&sort=order:asc

# About page quote
GET /api/about-quote
```

### Course Features

```bash
# Features for a specific course
GET /api/course-features?filters[courses][documentId][$eq]=<documentId>&populate=icon&sort=order:asc
```

### Certificaciones Page

```bash
# Certificaciones page content
GET /api/certificaciones-page?populate=image
```

---

## Strapi v5 Query Syntax

### Populate (loading relations/media)

```bash
# Single field
?populate=image

# Multiple fields
?populate=main_image,section1_image,section2_image

# Nested populate (populate a relation's relation)
?populate[course_features][populate]=icon

# DO NOT use populate=* in production — it loads everything and is slow
```

### Filters

```bash
# Exact match
?filters[slug][$eq]=my-course

# Boolean
?filters[show_on_homepage][$eq]=true

# Enum
?filters[estado][$eq]=disponible
?filters[category][$eq]=certificacion

# Relation filter (by documentId)
?filters[cursos][documentId][$eq]=abc123
```

### Sorting

```bash
# Ascending
?sort=order:asc

# Descending
?sort=order:desc

# Multiple sort fields
?sort=order:asc,createdAt:desc
```

### Pagination

```bash
# Page-based
?pagination[page]=1&pagination[pageSize]=25

# Offset-based
?pagination[start]=0&pagination[limit]=25
```

---

## Response Format

Strapi v5 uses a flat response format (no `attributes` wrapper for the main data level):

### Collection Type Response

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "title": "Lectura de Oraculo Angelical",
      "slug": "lectura-de-oraculo-angelical",
      "category": "certificacion",
      "estado": "disponible",
      "main_image": {
        "id": 5,
        "name": "image.jpg",
        "url": "https://meaningful-fitness-6cded77ff5.media.strapiapp.com/image.jpg",
        "width": 1200,
        "height": 800,
        "formats": {
          "thumbnail": { "url": "..." },
          "small": { "url": "..." },
          "medium": { "url": "..." },
          "large": { "url": "..." }
        }
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-15T00:00:00.000Z",
      "publishedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 3
    }
  }
}
```

### Single Type Response

```json
{
  "data": {
    "id": 1,
    "documentId": "xyz789",
    "title": "Section Title",
    "content": "Markdown content here...",
    "image": { ... },
    "createdAt": "...",
    "updatedAt": "...",
    "publishedAt": "..."
  },
  "meta": {}
}
```

### Image/Media Object Structure

```json
{
  "id": 5,
  "documentId": "img123",
  "name": "my-image.jpg",
  "alternativeText": null,
  "caption": null,
  "width": 1200,
  "height": 800,
  "url": "https://meaningful-fitness-6cded77ff5.media.strapiapp.com/my_image_hash.jpg",
  "formats": {
    "thumbnail": {
      "url": "https://meaningful-fitness-6cded77ff5.media.strapiapp.com/thumbnail_my_image_hash.jpg",
      "width": 245,
      "height": 163
    },
    "small": {
      "url": "...",
      "width": 500,
      "height": 333
    },
    "medium": {
      "url": "...",
      "width": 750,
      "height": 500
    },
    "large": {
      "url": "...",
      "width": 1000,
      "height": 667
    }
  }
}
```

---

## Testing API Endpoints

### With curl

```bash
# Set your token
export TOKEN="your-api-token-here"

# Test courses endpoint
curl -H "Authorization: Bearer $TOKEN" \
  "https://meaningful-fitness-6cded77ff5.strapiapp.com/api/cursos?populate=main_image"

# Pretty print with jq
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://meaningful-fitness-6cded77ff5.strapiapp.com/api/cursos?populate=main_image" | jq '.data[] | {title, slug, estado}'
```

### Quick Check: Is a Course Published?

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://meaningful-fitness-6cded77ff5.strapiapp.com/api/cursos?filters[slug][$eq]=conexion-angelical" | jq '.data | length'
# Returns 0 if not published, 1 if published
```

---

## Important Notes

1. **Draft content is NOT returned by the API.** Only published content appears in responses. This is Strapi v5's default behavior.
2. **Media URLs are absolute** when using Strapi Cloud (hosted on `media.strapiapp.com`). When self-hosting, they may be relative (`/uploads/...`) and need the Strapi base URL prepended.
3. **The `documentId` field** is Strapi v5's stable identifier (different from `id`). Use it for relation filters.
4. **Pagination defaults** to 25 items. If you have more than 25 entries of a type, you must paginate or increase the limit.
