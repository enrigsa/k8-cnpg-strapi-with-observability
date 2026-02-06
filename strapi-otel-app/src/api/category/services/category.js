'use strict';

/**
 * category service
 */

const { createCoreService } = require('@strapi/strapi').factories;
const { trace } = require('@opentelemetry/api');

const tracer = trace.getTracer('strapi-otel-tracer');

module.exports = createCoreService('api::category.category', () => ({
  async find(...args) {
    let response;
    await tracer.startActiveSpan('find categories', async (span) => {
      // Calling the default core controller
      response = await super.find(...args);
      // some custom logic

      span.end();
    });
    const { results, pagination } = response;

    return { results, pagination };
  },
}));
