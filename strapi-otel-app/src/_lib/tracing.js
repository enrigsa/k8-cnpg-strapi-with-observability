const { trace, context, SpanStatusCode } = require('@opentelemetry/api');

const tracer = trace.getTracer('strapi-otel-tracer');

/**
 * Utility function to create a span around an asynchronous operation, ensuring that the span is properly ended and any exceptions are recorded.
 * @param {string} name - The name of the span.
 * @param {function} fn - The asynchronous function to execute within the span. It receives the span as an argument.
 * @returns {Promise<any>} - The result of the asynchronous function.
 */
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

/**
 * Utility function to execute an asynchronous function within a given trace context, allowing for proper trace correlation
 * @param {context} parentContext - The parent context to use for the trace.
 * @param {function} fn - The asynchronous function to execute within the trace.
 * @returns {Promise<any>} - The result of the asynchronous function.
 */
async function withTraceContext(parentContext, fn) {
  return await context.with(parentContext, fn);
}

module.exports = {
  withSpan,
  withTraceContext,
};
