export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://meaningful-fitness-6cded77ff5.strapiapp.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'https://meaningful-fitness-6cded77ff5.strapiapp.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:4321', 
        'http://localhost:3000', 
        'https://vane-preview.vercel.app',
        /https:\/\/.*\.vercel\.app$/,  // Allow all Vercel preview URLs
        /https:\/\/vane-.*\.vercel\.app$/,  // Allow all vane- prefixed Vercel URLs
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
