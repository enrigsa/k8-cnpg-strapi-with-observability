'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { trace, context, propagation } = require('@opentelemetry/api');

const tracer = trace.getTracer('strapi-otel-tracer');

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async listGroupedPostsByCategory(ctx) {
    let sanitizedPosts;
    const headers = ctx.request.headers;

    // Extract trace context from message headers
    const parentContext = propagation.extract(context.active(), headers);

    await context.with(parentContext, async () => {
      await tracer.startActiveSpan(
        'list-grouped-posts-by-category',
        async (span) => {
          const posts = await strapi
            .service('api::post.post')
            .find({ populate: ['categories'] });
          const categories = await strapi
            .service('api::category.category')
            .find();

          ctx.body = { posts, categories };
          span.end();
        }
      );
    });

    return sanitizedPosts;
  },
}));
