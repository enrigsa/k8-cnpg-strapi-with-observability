'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { withSpan, withTraceContext } = require('../../../_lib/tracing');
const { context, propagation } = require('@opentelemetry/api');

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async listGroupedPostsByCategory(ctx) {
    const headers = ctx.request.headers;

    // Extract trace context from message headers
    const parentContext = propagation.extract(context.active(), headers);

    const sanitizedResponse = await withTraceContext(
      parentContext,
      async () =>
        await withSpan('list-grouped-posts-by-category', async () => {
          const posts = await withSpan('fetch-posts', async (span) => {
            span.setAttribute('db.table', 'posts');
            const result = await strapi
              .service('api::post.post')
              .find({ populate: ['categories'] });

            return result;
          });

          const categories = await withSpan(
            'fetch-categories',
            async (span) => {
              span.setAttribute('db.table', 'categories');
              const result = await strapi
                .service('api::category.category')
                .find();

              return result;
            }
          );

          const santitizedPosts = posts;
          const sanitizedCategories = categories;

          ctx.body = {
            posts: santitizedPosts,
            categories: sanitizedCategories,
          };

          return ctx.body;
        })
    );

    return sanitizedResponse;
  },
}));
