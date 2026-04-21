require('./instrumentation.js');

const express = require('express');
const path = require('path');
const {
  trace,
  context,
  propagation,
  SpanStatusCode,
} = require('@opentelemetry/api');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const tracer = trace.getTracer(process.env.OTEL_SERVICE_NAME);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/grouped-posts-by-category', (req, res) => {
  tracer.startActiveSpan(
    'handling grouped-posts-by-category request',
    (span) => {
      let headers = {};
      // Inject current trace context into headers
      propagation.inject(context.active(), headers);

      fetch(`http://localhost:1337/api/grouped-posts-by-category`, {
        headers,
      })
        .then((resp) => resp.json())
        .then((resp) => {
          const groupedPostsByCategory =
            resp?.data?.groupedPostsByCategory ?? [];

          res.render('grouped-posts-by-category', {
            categories: groupedPostsByCategory,
          });
        })
        .catch((error) => {
          res.render('error', { message: error.message });

          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR });
        })
        .finally(() => {
          span.end();
        });
    },
  );
});

app.listen(3000, () => {
  console.log('node-otel-app listening on port 3000...');
});
