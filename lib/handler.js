import { Response } from "miragejs";
import createFieldResolver from "./resolvers/field";
import { ensureExecutableGraphQLSchema } from "./utils";
import { ensureModels } from "./orm/models";
import { graphql } from "graphql";

/**
 * Handles GraphQL requests. It returns either a successful GraphQL response or
 * a response with a 500 status code and messages from any caught exceptions.
 *
 * @callback graphQLHandler
 * @param {Object} _mirageSchema Mirage passes this in; though, it goes unused.
 * @param {Object} request The request object passed in by Mirage.
 * @returns {Object} A response object.
 */

/**
 * A higher-order function that returns a request handler for GraphQL queries.
 * It accepts both a GraphQL and Mirage schema along with a hash of options.
 * Options include:
 *
 * 1. `resolvers` - A resolver map for cases where the default Mirage resolvers
 *    aren't sufficient. Such cases include: resolving root-level scalar values,
 *    sorting records and complex mutations.
 * 2. `context` - A context object that GraphQL will pass into each resolver. A
 *     common use case for this is to supply current user information to
 *     resolvers.
 * 3. `root` - A root level value that GraphQL will use as the parent object for
 *    fields at the highest level.
 *
 * The GraphQL schema param may be a string, an AST or an executable
 * GraphQL schema. This library ensures the schema is executable in any case.
 *
 * This also ensures models are added to the Mirage schema for each appropriate
 * type from the GraphQL schema. Since the GraphQL schema already defines types
 * and relationships, it may be redundant to define Mirage models when using
 * GraphQL. You may still define Mirage models, though, if you'd like.
 *
 * Lastly, it creates a field resolver that GraphQL will use to resolve every
 * field from a query. If an optional resolver isn't supplied for a given field,
 * this field resolver will be used. It does its best to resolve queries and
 * mutations automatically based on the information from the GraphQL schema and
 * the records in Mirage's database.
 *
 * @function createGraphQLHandler
 * @param {Object|string} graphQLSchema
 * @param {Object} mirageSchema
 * @param {{context: Object, resolvers: Object, root: Object}}
 * @returns {graphQLHandler}
 */
export function createGraphQLHandler(
  graphQLSchema,
  mirageSchema,
  { context = {}, resolvers, root }
) {
  const contextValue = { ...context, mirageSchema };
  const fieldResolver = createFieldResolver(resolvers);
  const schema = ensureExecutableGraphQLSchema(graphQLSchema);

  ensureModels({ graphQLSchema: schema, mirageSchema });

  return function graphQLHandler(_mirageSchema, request) {
    try {
      const { query, variables } = JSON.parse(request.requestBody);

      return graphql({
        contextValue,
        fieldResolver,
        rootValue: root,
        schema,
        source: query,
        variableValues: variables,
      });
    } catch (ex) {
      return new Response(500, {}, { errors: [ex] });
    }
  };
}
