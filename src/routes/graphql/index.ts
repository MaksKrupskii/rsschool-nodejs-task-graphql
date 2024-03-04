import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, schema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { dataLoaders } from './dataLoader.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      const queryDoc = parse(query);

      const validationErrors = validate(schema, queryDoc, [depthLimit(5)]);

      if (validationErrors?.length > 0) {
        return { data: '', errors: validationErrors };
      }

      const { data, errors } = await graphql({
        schema,
        source: query,
        variableValues: variables,
        contextValue: {
          db: prisma,
          loaders: dataLoaders(prisma),
        }
      })
      return { data, errors };
    },
  });
};

export default plugin;
