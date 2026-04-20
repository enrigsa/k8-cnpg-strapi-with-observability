const { trace, context, SpanStatusCode } = require('@opentelemetry/api');

const tracer = trace.getTracer('strapi-otel-tracer');

async function withSpan(name, fn) {
  const span = tracer.startSpan(name);
  span.setAttribute('component', 'strapi');

  return await context.with(trace.setSpan(context.active(), span), async () => {
    try {
      return await fn(span);
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });

      throw error;
    } finally {
      span.end();
    }
  });
}

async function withTraceContext(parentContext, fn) {
  return await context.with(parentContext, fn);
}

module.exports = {
  withSpan,
  withTraceContext,
};
