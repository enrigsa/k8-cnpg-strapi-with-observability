'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { withSpan, withTraceContext } = require('../../../_lib/tracing');
const { context, propagation } = require('@opentelemetry/api');

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async listGroupedPostsByCategory(ctx) {
    await this.validateQuery(ctx);

    // Extract trace context from message headers
    const headers = ctx.request.headers;
    const parentContext = propagation.extract(context.active(), headers);

    // Use the extracted context to create spans for the operations
    const groupedPostsByCategory = await withTraceContext(
      parentContext,
      async () =>
        await withSpan('list-grouped-posts-by-category', async () => {
          const posts = await withSpan('fetch-posts', async (span) => {
            span.setAttribute('db.table', 'posts');
            const { results } = await strapi
              .service('api::post.post')
              .find({ populate: ['categories'] });
            const sanitizedResults = await this.sanitizeOutput(results, ctx);

            return sanitizedResults;
          });

          const categories = await withSpan(
            'fetch-categories',
            async (span) => {
              span.setAttribute('db.table', 'categories');
              const { results } = await strapi
                .service('api::category.category')
                .find();
              const sanitizedResults = await this.sanitizeOutput(results, ctx);

              return sanitizedResults;
            }
          );

          const groupedPostsByCategory = categories.map((category) => {
            const postsInCategory = posts
              .filter((post) =>
                post?.categories?.some((cat) => cat.id === category.id)
              )
              .map((post) => ({
                id: post.id,
                title: post.title,
                content: post.content,
              }));

            return {
              name: category.name,
              description: category.description,
              posts: postsInCategory,
            };
          });

          return this.transformResponse({ groupedPostsByCategory });
        })
    );

    return groupedPostsByCategory;
  },
}));
