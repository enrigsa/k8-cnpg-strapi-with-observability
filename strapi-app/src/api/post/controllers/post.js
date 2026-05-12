'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async listGroupedPostsByCategory(ctx) {
    await this.validateQuery(ctx);

    const posts = await strapi
      .service('api::post.post')
      .find({ populate: ['categories'] });
    // Sanitizing output will hide data if the user doesn't have permissions
    const { results: sanitizedPosts } = await this.sanitizeOutput(posts, ctx);

    const { results: categories } = await strapi
      .service('api::category.category')
      .find();
    // Sanitizing output will hide data if the user doesn't have permissions
    const sanitizedCategories = await this.sanitizeOutput(categories, ctx);

    const groupedPostsByCategory = sanitizedCategories.map((category) => {
      const postsInCategory = sanitizedPosts
        .filter((post) =>
          post?.categories?.some((cat) => cat.id === category.id)
        )
        .map((post) => ({
          content: post.content,
          id: post.id,
          title: post.title,
        }));

      return {
        description: category.description,
        name: category.name,
        posts: postsInCategory,
      };
    });

    return this.transformResponse({ groupedPostsByCategory });
  },
}));
