'use strict';
const { context: otelContext } = require('@opentelemetry/api');
const { withTraceContext, withSpan } = require('./_lib/tracing.js');

const OBSERVABLE_API_ENTITIES = ['api::post.post', 'api::category.category'];
const OBSERVABLE_ACTIONS = ['findMany', 'create', 'update', 'delete'];

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

      const parentContext = context.params?.otelContext || otelContext.active();
      const collectionName = context.contentType?.collectionName ?? '';
      const apiName = context.contentType?.apiName ?? '';
      const status = context.params?.status ?? '';
      const populate = context.params?.populate ?? [];
      const start = context.params?.start ?? '';
      const limit = context.params?.limit ?? '';

      return await withTraceContext(parentContext, async () => {
        const spanName = `${apiName}.${action}`;

        return await withSpan(spanName, async (span) => {
          span.setAttributes({
            uid,
            'contentType.apiName': apiName,
            action,
            'contentType.collectionName': collectionName,
            'params.status': status,
            'params.populate': populate,
            'params.start': start,
            'params.limit': limit,
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
