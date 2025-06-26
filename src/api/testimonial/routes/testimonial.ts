'use strict';

/**
 * testimonial router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/testimonials',
      handler: 'testimonial.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/testimonials/:id',
      handler: 'testimonial.findOne',
      config: {
        auth: false,
      },
    },
  ],
}; 