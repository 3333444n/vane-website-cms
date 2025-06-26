// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('✅ Strapi CMS started successfully');
    console.log('📋 Content types available:');
    console.log('   - Service Cards, Homepage About, Homepage Quote');
    console.log('   - Testimonials, About Text Sections, About Scroll Items');
    console.log('   - Certifications, About Quote');
    console.log('⚠️  Remember to set public permissions in Settings → Users & Permissions → Public');
  },
};
