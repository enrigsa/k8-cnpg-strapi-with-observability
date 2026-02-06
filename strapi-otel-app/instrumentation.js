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
require('dotenv').config();

const spanProcessor = new BatchSpanProcessor(
  new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
  })
);

const consoleSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

const sdk = new NodeSDK({
  instrumentations: [],
  textMapPropagator: new W3CTraceContextPropagator(),
  spanProcessors: [consoleSpanProcessor, spanProcessor],
});

sdk.start();

module.exports = { sdk };
