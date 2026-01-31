module.exports = () => ({
  prometheus: {
    enabled: true,
    config: {
      // Optional: Collect Node.js default metrics
      // See collectDefaultMetricsOption of prom-client for all options
      collectDefaultMetrics: { prefix: 'strapi_app_' }, // or { prefix: 'my_app_' }

      // Optional: Add custom labels to all metrics
      labels: {
        app: 'my-strapi-app',
        environment: 'production',
      },

      // Server configuration
      // Set to false to expose metrics on your main Strapi server (not recommended)
      server: {
        port: 9000, // Metrics server port
        host: '0.0.0.0', // Metrics server host
        path: '/metrics', // Metrics endpoint path
      },
      // OR disable separate server (use with caution):
      // server: false

      // 🎯 Path Normalization Rules
      normalize: [
        [/\/(?:[a-z0-9]{24,25}|\d+)(?=\/|$)/, '/:id'], // Document IDs or numeric IDs
        // eslint-disable-next-line no-useless-escape
        [/\/uploads\/[^\/]+\.[a-zA-Z0-9]+/, '/uploads/:file'], // Uploaded files with extensions
      ],
    },
  },
});
