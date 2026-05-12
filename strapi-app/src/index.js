'use strict';
const { context: otelContext } = require('@opentelemetry/api');
const { withTraceContext, withSpan } = require('./_lib/tracing.js');

const OBSERVABLE_API_ENTITIES = ['api::post.post', 'api::category.category'];
const OBSERVABLE_ACTIONS = [
  'findMany',
  'findOne',
  'create',
  'update',
  'delete',
  // Add more actions as needed. `Count` action is intentionally left out to avoid excessive spans for count queries.
];

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi.documents.use(async (context, next) => {
      const action = context.action;
      const uid = context.uid;

      const shouldApply =
        OBSERVABLE_API_ENTITIES.includes(uid) &&
        OBSERVABLE_ACTIONS.includes(action);

      // Only run for certain content types
      if (!shouldApply) {
        return next();
      }

      const apiName = context.contentType?.apiName ?? '';
      const collectionName = context.contentType?.collectionName ?? '';
      const limit = context.params?.limit ?? '';
      const parentContext = context.params?.otelContext || otelContext.active();
      const populate = context.params?.populate ?? [];
      const start = context.params?.start ?? '';
      const status = context.params?.status ?? '';

      return await withTraceContext(parentContext, async () => {
        const spanName = `${apiName}.${action}`;

        return await withSpan(spanName, async (span) => {
          span.setAttributes({
            'params.limit': limit,
            'params.populate': populate,
            'params.start': start,
            'params.status': status,
            'service.action': action,
            'strapi.apiName': apiName,
            'strapi.collectionName': collectionName,
            'strapi.component': 'Document Service Middleware',
            'strapi.uid': uid,
          });

          const result = await next();

          return result;
        });
      });
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {},
};
