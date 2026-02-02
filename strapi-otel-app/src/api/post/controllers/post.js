'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async listGroupedPostsByCategory(ctx) {
    console.log('ctx', ctx);
    const posts = await strapi.service('api::post.post').find();

    return this.transformResponse(posts.results);
  },
}));
