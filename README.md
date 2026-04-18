# Prometheus metrics

## Configuration

Exposing Prometheus metrics often requires adding instrumentation to apps or using exporters. The [Strapi Prometheus plugin](https://market.strapi.io/plugins/strapi-prometheus) provides a simple way to configure a very decent range of metrics.

`strapi-otel-app` has an example of specific configuration in [`strapi-otel-app/config/plugins.js`](strapi-otel-app/config/plugins.js).

When launching strapi locally, metrics are visible in `http://localhost:9000/metrics`:

![Strapi metrics](media/strapi_metrics_localhost_I.png 'Strapi metrics')

## Queries

    up{service="strapi-app-service"}
    histogram_quantile(0.90, sum by(le) (rate(http_request_duration_seconds_bucket{app="strapi-app"}[5m])))

# Opentelemetry

## API

To extract context and correlate spans in the receiving service, use `propagation.extract` and `context.with`:

```js
const { trace, context, propagation } = require('@opentelemetry/api');
const tracer = trace.getTracer('strapi-otel-tracer');

// Inside controller

const headers = ctx.request.headers;
const parentContext = propagation.extract(context.active(), headers);

await context.with(parentContext, async () => {
  await tracer.startActiveSpan(
    '< span_name >',
    async (span) => {
      // execute instrumented code
      span.end();
    };
  );
});
```

# Testing locally

Launch Jaeger:

    docker run --rm --name jaeger \
    -p 16686:16686 \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 5778:5778 \
    -p 9411:9411 \
    cr.jaegertracing.io/jaegertracing/jaeger:2.15.0

Open Jaeger in browser in `http://localhost:16686`. Select `service` and click on `Find traces`:

![Jaeger Dashboard](media/jaeger_dashboard.png 'Jaeger Dashboard')

Inspecting a trace:

![Displaying Trace with Jaeger](media/jaeger_trace_timeline_1.png 'Traces with Jaeger')

Resources:

- [OpenTelemetry JS Propagation](https://uptrace.dev/get/opentelemetry-js/propagation)
- [Node.js Distributed Tracing for Microservices](https://oneuptime.com/blog/post/2026-01-06-nodejs-distributed-tracing-microservices/view)
