# Strapi and Cloud Native PG on Kubernetes with Observability

This project demonstrates a full-stack application with Strapi CMS, PostgreSQL database managed by Cloud Native PG Operator, and comprehensive observability using OpenTelemetry and Prometheus.

## Applications

**node-app** — Frontend web server that serves views and initializes distributed traces for user requests. Routes requests to Strapi and propagates trace context through the system using OpenTelemetry.

**strapi-app** — Strapi CMS instance that handles API requests, database operations, and exposes Prometheus metrics. Instruments API calls with OpenTelemetry spans for distributed tracing.

**PostgreSQL (Cloud Native PG)** — Primary database. Locally, a standalone PostgreSQL server. In Kubernetes, deployed and managed by the Cloud Native PG Operator for high availability and automated backups.

## Prometheus metrics for Strapi

### Configuration

Exposing Prometheus metrics often requires adding instrumentation to apps or using exporters. The [Strapi Prometheus plugin](https://market.strapi.io/plugins/strapi-prometheus) provides a simple way to configure a very decent range of metrics.

`strapi-app` has an example of specific configuration in [`strapi-app/config/plugins.js`](strapi-app/config/plugins.js).

When launching strapi locally, metrics are visible in `http://localhost:9000/metrics`:

![Strapi metrics](media/strapi_metrics_localhost_I.png 'Strapi metrics')

### Queries

    up{service="strapi-app-service"}
    histogram_quantile(0.90, sum by(le) (rate(http_request_duration_seconds_bucket{app="strapi-app"}[5m])))

## Opentelemetry

### API

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

## Kubernetes deployment

`node-app` and `strapi-app` images are built with docker and are required to be stored in a container registry. Images and image credentials for `node-demo-app` and `strapi-demo-app` deployments must be based on your container registry visibility, access and repository name.

The directory `kubernetes-manifests/secret-samples` provide examples of how to configure secrets.

Object deployments should be in this order:

1. Deploy cnpg-cluster objects:

```bash
kubectl apply -f kubernetes-manifests/cloud-native-pg
```

2. Deploy strapi-app objects:

```bash
kubectl apply -f kubernetes-manifests/strapi-app/configmap.yaml
kubectl apply -f kubernetes-manifests/strapi-app/persistent-volume-claim.yaml
kubectl apply -f kubernetes-manifests/strapi-app/deployment.yaml
kubectl apply -f kubernetes-manifests/strapi-app/service.yaml
```

3. Deploy node-app objects:

```bash
kubectl apply -f kubernetes-manifests/node-app/configmap.yaml
kubectl apply -f kubernetes-manifests/node-app/deployment.yaml
kubectl apply -f kubernetes-manifests/node-app/service.yaml
```

4. Deploy Opentelemetry collector:

```bash
kubectl apply -f kubernetes-manifests/opentelemetry/custom-resource-definition.yaml
kubectl apply -f kubernetes-manifests/opentelemetry/opentelemetry-collector.yaml
```

5. Deploy kube-prometheus-stack helm chart:

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```bash
helm install prometheus-stack prometheus-community/kube-prometheus-stack \
  -n observability-demo \
  -f kubernetes-manifests/kube-prometheus-stack/values.yaml
```

## Local deployment

Before starting services, ensure:

- PostgreSQL is running locally on port 5432
- Jaeger and observability stack are up
- `.env` files are configured for each app

### Jaeger

Launching Jaeger to collect traces:

    docker run --rm --name jaeger \
    -p 16686:16686 \
    -p 4317:4317 \
    -p 4318:4318 \
    -p 5778:5778 \
    -p 9411:9411 \
    cr.jaegertracing.io/jaegertracing/jaeger:2.15.0

Open Jaeger UI at `http://localhost:16686`.

![Jaeger Dashboard](media/jaeger_dashboard.png 'Jaeger Dashboard')

Inspecting a trace:

![Displaying Trace with Jaeger](media/jaeger_trace_timeline_1.png 'Traces with Jaeger')

### Strapi

Launch Strapi to serve the PostgreSQL database through a CMS:

    cd strapi-app
    npm run build
    npm run start

Access Strapi at `http://localhost:1337`. On first access:

1. Create an admin user
2. Enable `public` role permissions for `categories` and `posts` entities
3. Use the Content Manager to create categories and posts, then link them via relations

### node app

Launch the Node.js frontend application:

    cd node-app
    node index.js --env-file=.env

Open the app at `http://localhost:3000`. Visit the homepage and navigate to `/grouped-posts-by-category` to see grouped posts rendered with tracing enabled.

## Resources:

- [OpenTelemetry JS Propagation](https://uptrace.dev/get/opentelemetry-js/propagation)
- [Node.js Distributed Tracing for Microservices](https://oneuptime.com/blog/post/2026-01-06-nodejs-distributed-tracing-microservices/view)
- [OpenTelemetry Spans Explained: Deconstructing Distributed Tracing](https://last9.io/blog/opentelemetry-spans-events/)

```

```
