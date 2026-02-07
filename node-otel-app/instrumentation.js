const {
  OTLPTraceExporter,
} = require('@opentelemetry/exporter-trace-otlp-http');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-node');
const { W3CTraceContextPropagator } = require('@opentelemetry/core');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { resourceFromAttributes } = require('@opentelemetry/resources');

const OTLP_TRACES_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: OTLP_TRACES_ENDPOINT,
  }),
);

const consoleSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
  }),
  instrumentations: [],
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessors: [consoleSpanProcessor, spanProcessor],
});

sdk.start();

module.exports = { sdk };
