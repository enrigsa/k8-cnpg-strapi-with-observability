'use strict';
const { context, propagation } = require('@opentelemetry/api');
const { withTraceContext, withSpan } = require('../_lib/tracing.js');

/**
 * `observability` middleware
 */

module.exports = () => {
  return async (ctx, next) => {
    // Extract trace context from message headers
    const headers = ctx.request.headers;
    const parentContext = propagation.extract(context.active(), headers);

    if (ctx.query) {
      ctx.query.otelContext = parentContext;
    }

    await withTraceContext(parentContext, async () => {
      const request = ctx.request;
      const { method = '', url = '' } = request;
      const spanName = `HTTP ${method} ${url}`;

      await withSpan(spanName, async (span) => {
        span.setAttribute('http.method', method);
        span.setAttribute('http.url', url);
        span.setAttribute('db.table', 'post');

        await next();
      });
    });
  };
};
