require('./instrumentation.js');

const express = require('express');
const {
  trace,
  context,
  propagation,
  SpanStatusCode,
} = require('@opentelemetry/api');

const app = express();
const tracer = trace.getTracer('api-gateway');

app.get('/grouped-posts-by-category', async (req, res) => {
  await tracer.startActiveSpan('node-otel-app', async (span) => {
    let headers = {};
    // Inject current trace context into headers
    propagation.inject(context.active(), headers);

    try {
      const groupedPosts = await fetch(
        `http://localhost:1337/api/grouped-posts-by-category`,
        { headers },
      ).then((res) => res.json());

      res.json(groupedPosts);
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });

      res.status(500).json({ error: error.message });
    }

    span.end();
  });
});

app.listen(3000, () => {
  console.log('node-otel-app listening on http://localhost:3000...');
});
