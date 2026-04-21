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

app.get('/grouped-posts-by-category', async (req, res) => {
  await tracer.startActiveSpan(
    'handling grouped-posts-by-category request',
    async (span) => {
      let headers = {};
      // Inject current trace context into headers
      propagation.inject(context.active(), headers);

      const groupedCategories = await fetch(
        `http://localhost:1337/api/grouped-posts-by-category`,
        { headers },
      )
        .then((res) => res.json())
        .then((resp) => resp.data.groupedPostsByCategory)
        .catch((error) => {
          span.recordException(error);
          span.setStatus({ code: SpanStatusCode.ERROR });

          res.status(500).json({ error: error.message });
        });

      span.end();

      console.log('groupedPosts:', groupedCategories);

      res.render('grouped-posts-by-category', {
        categories: groupedCategories,
      });
    },
  );
});

app.listen(3000, () => {
  console.log('node-otel-app listening on http://localhost:3000...');
});
