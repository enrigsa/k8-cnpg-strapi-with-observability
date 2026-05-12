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
      const userAgent = request.header['user-agent'] || '';
      const body = ctx.request.body;

      await withSpan(spanName, async (span) => {
        // Check semantic conventions for HTTP attributes: https://opentelemetry.io/docs/specs/semconv/http/http-spans/
        span.setAttributes({
          'http.request.method': method,
          'strapi.component': 'Global Middleware',
          'url.path': url,
          'user_agent.original': userAgent,
        });

        if (body) {
          const stringifiedBody = JSON.stringify(body);
          span.setAttributes({
            'http.request.body': stringifiedBody,
          });
        }

        await next();

        span.setAttributes({
          'http.response.status_code': ctx.response.status,
          'http.response.message': ctx.response.message,
        });
      });
    });
  };
};
