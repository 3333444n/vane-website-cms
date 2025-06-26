'use strict';

/**
 * homepage-quote router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/homepage-quote',
      handler: 'homepage-quote.find',
      config: {
        auth: false,
      },
    },
  ],
}; 