# 🚀 Frontend Integration Guide - Strapi CMS

## Migración completa de Notion a Strapi

Este documento detalla toda la estructura de datos y APIs disponibles para la integración del frontend.

---

## 📋 **Base URLs**

- **Development:** `http://localhost:1337/api`
- **Production:** `TBD`

---

## 🎓 **COLLECTION TYPES**

### 1. **🎓 Cursos** (`/api/cursos`)

**Descripción:** Content type principal para cursos, talleres y certificaciones

#### Campos:

```typescript
interface Curso {
  id: number;
  documentId: string;
  title: string; // required
  slug: string; // UID from title, required
  category: "certificacion" | "taller" | "gratuito"; // required
  event_date?: string; // YYYY-MM-DD format
  type_label?: string;
  slogan?: string; // text
  short_description?: string; // richText
  main_image: MediaObject; // required, images only
  order_homepage?: number;
  order_upcoming?: number;
  estado: "disponible" | "no-disponible"; // required

  // Secciones de contenido
  section1_text: string; // richText, required
  section1_image?: MediaObject; // images only
  section2_text: string; // richText, required
  section2_image?: MediaObject; // images only
  section2_quote?: string; // text

  // FAQ Intro
  faq_intro_title?: string;
  faq_intro_text?: string; // richText

  // CTA
  cta_text?: string;
  cta_button_text?: string;
  cta_button_link?: string;
  cta_date?: string; // YYYY-MM-DD format

  // Relaciones
  testimonials?: Testimonial[]; // oneToMany
  faqs?: FAQ[]; // oneToMany

  // Metadata
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

#### API Endpoints:

```bash
GET /api/cursos                    # Lista todos los cursos
GET /api/cursos?populate=*         # Con relaciones incluidas
GET /api/cursos/:documentId        # Curso específico
GET /api/cursos?filters[category][$eq]=certificacion
GET /api/cursos?sort=order_homepage:asc
```

---

### 2. **🎓 FAQs** (`/api/faqs`)

**Descripción:** Preguntas frecuentes asociadas a cursos específicos

#### Campos:

```typescript
interface FAQ {
  id: number;
  documentId: string;
  question: string; // required
  answer: string; // richText, required
  curso?: Curso; // manyToOne relation
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

#### API Endpoints:

```bash
GET /api/faqs                      # Todas las FAQs
GET /api/faqs?populate=curso       # Con información del curso
GET /api/faqs?filters[curso][documentId][$eq]=CURSO_ID
```

---

### 3. **💬 Testimonial** (`/api/testimonials`)

**Descripción:** Testimonios de clientes con targeting mejorado

#### Campos:

```typescript
interface Testimonial {
  id: number;
  documentId: string;
  quote: string; // richText, required
  authorName: string; // required
  authorTitle: string; // required
  order: number; // required
  page: "homepage" | "about" | "both"; // required (campo legacy)
  target_page?: "inicio" | "sobre-mi" | "curso"; // nuevo campo
  curso?: Curso; // manyToOne relation, opcional
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

#### API Endpoints:

```bash
GET /api/testimonials              # Todos los testimonios
GET /api/testimonials?populate=curso
GET /api/testimonials?filters[target_page][$eq]=inicio
GET /api/testimonials?filters[curso][documentId][$eq]=CURSO_ID
```

---

### 4. **🏠 Carta de Categoría** (`/api/service-cards`)

**Descripción:** Tarjetas de servicios/categorías para la homepage

#### Campos:

```typescript
interface CartaCategoria {
  id: number;
  documentId: string;
  title: string; // required
  link: string; // required
  image: MediaObject; // required
  order: number; // required
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

### 5. **💡 Sobre Mí Info** (`/api/about-text-sections`)

**Descripción:** Secciones de texto e imágenes para la página About

#### Campos:

```typescript
interface SobreMiInfo {
  id: number;
  documentId: string;
  title: string; // required
  content: string; // richText, required
  image: MediaObject; // required
  order: number; // required
  section: "journey" | "approach"; // required
  reverseOrder: boolean; // default: false
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

### 6. **🔄 Sobre Mí Cosas** (`/api/about-scroll-items`)

**Descripción:** Items para scroll horizontal en página About

#### Campos:

```typescript
interface SobreMiCosas {
  id: number;
  documentId: string;
  title: string; // required
  content: string; // richText, required
  image: MediaObject; // required
  order: number; // required
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

### 7. **🏆 Certificaciones** (`/api/certifications`)

**Descripción:** Certificaciones y credenciales

#### Campos:

```typescript
interface Certificacion {
  id: number;
  documentId: string;
  title: string; // required
  icon: MediaObject; // required
  order: number; // required
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

## 📄 **SINGLE TYPES**

### 1. **🏠 Inicio Info** (`/api/homepage-about`)

**Descripción:** Información principal de la homepage

#### Campos:

```typescript
interface InicioInfo {
  id: number;
  documentId: string;
  title: string; // required
  content: string; // richText, required
  image: MediaObject; // required
  buttonText?: string;
  buttonLink?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

#### API Endpoint:

```bash
GET /api/homepage-about            # Single object (no array)
```

---

### 2. **💭 Inicio Frase** (`/api/homepage-quote`)

**Descripción:** Frase destacada para la homepage

#### Campos:

```typescript
interface InicioFrase {
  id: number;
  documentId: string;
  quote: string; // richText, required
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

### 3. **💭 Sobre Mí Frase** (`/api/about-quote`)

**Descripción:** Frase destacada para la página About

#### Campos:

```typescript
interface SobreMiFrase {
  id: number;
  documentId: string;
  quote: string; // richText, required
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

---

## 🖼️ **MEDIA OBJECT STRUCTURE**

```typescript
interface MediaObject {
  id: number;
  documentId: string;
  name: string;
  alternativeText?: string;
  caption?: string;
  width: number;
  height: number;
  formats: {
    thumbnail: MediaFormat;
    small: MediaFormat;
    medium: MediaFormat;
    large: MediaFormat;
  };
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  sizeInBytes: number;
  url: string;
}
```

---

## 🔗 **RELACIONES Y QUERIES AVANZADAS**

### Obtener un curso con todas sus relaciones:

```bash
GET /api/cursos/DOCUMENT_ID?populate[testimonials][populate]=*&populate[faqs][populate]=*&populate[main_image][populate]=*&populate[section1_image][populate]=*&populate[section2_image][populate]=*
```

### Filtrar cursos por categoría y estado:

```bash
GET /api/cursos?filters[category][$eq]=certificacion&filters[estado][$eq]=disponible&sort=order_homepage:asc
```

### Obtener FAQs de un curso específico:

```bash
GET /api/faqs?filters[curso][documentId][$eq]=CURSO_DOCUMENT_ID&populate=curso
```

### Obtener testimonios para página específica:

```bash
GET /api/testimonials?filters[target_page][$eq]=inicio&sort=order:asc
```

---

## 📱 **EXAMPLE RESPONSES**

### Curso completo:

```json
{
  "data": {
    "id": 1,
    "documentId": "dhcfisio5ujt6qxqx7eoqnib",
    "title": "Curso de Prueba",
    "slug": "curso-de-prueba",
    "category": "certificacion",
    "event_date": "2025-06-28",
    "estado": "disponible",
    "main_image": {
      "url": "/uploads/image.jpg",
      "formats": {
        "thumbnail": { "url": "/uploads/thumbnail_image.jpg" }
      }
    },
    "section1_text": "Rich text content...",
    "testimonials": [],
    "faqs": []
  }
}
```

### Single Type response:

```json
{
  "data": {
    "id": 1,
    "title": "Homepage About Title",
    "content": "Rich text content...",
    "image": { "url": "/uploads/about.jpg" }
  }
}
```

---

## ⚙️ **CONFIGURACIÓN Y PERMISOS**

Todos los endpoints tienen permisos públicos configurados para:

- ✅ `find` (GET collection)
- ✅ `findOne` (GET specific item)

No se requiere autenticación para consumir las APIs desde el frontend.

---

## 🎯 **CASOS DE USO PRINCIPALES**

### Homepage:

- **Carta de Categoría:** Servicios destacados
- **Inicio Info:** Sección About principal
- **Inicio Frase:** Quote destacada
- **Testimonios:** Filtrar por `target_page: "inicio"`
- **Cursos:** Ordenar por `order_homepage`

### Página About:

- **Sobre Mí Info:** Secciones journey/approach
- **Sobre Mí Cosas:** Items de scroll
- **Sobre Mí Frase:** Quote de la página
- **Certificaciones:** Lista ordenada
- **Testimonios:** Filtrar por `target_page: "sobre-mi"`

### Página de Curso:

- **Curso:** Contenido completo con populate=\*
- **FAQs:** Filtradas por curso específico
- **Testimonios:** Filtrados por curso específico

---

## 🔄 **MIGRATION NOTES**

- ✅ Reemplaza completamente las APIs de Notion
- ✅ Mantiene compatibilidad con estructura existente donde es posible
- ✅ Nuevos campos opcionales no rompen integraciones existentes
- ✅ URLs de imágenes son relativas al dominio de Strapi
- ✅ RichText usa formato Markdown/HTML

---

**¿Preguntas o necesitas más detalles sobre algún content type específico?**
