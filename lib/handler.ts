import { GraphQLFieldResolver, GraphQLSchema, graphql } from "graphql";
import { Response } from "miragejs";
import createFieldResolver from "./resolvers/field.js";
import { createModels } from "./orm/models.js";
import { ensureExecutableGraphQLSchema } from "./utils.js";

import type { AnyRegistry } from "miragejs/-types";
import type { MirageSchema, ResolverMap, SourceGraphQLSchema } from "./@types/index.js";
import type { RouteHandler } from "miragejs/server";

/**
 * Options for creating a GraphQL request handler for Mirage.
 *
 * 1. `context` - A context object that GraphQL will pass into each resolver. A
 *     common use case for this is to supply current user information to
 *     resolvers. By default, whatever context you pass in will be appended with
 *     a reference to the Mirage schema and the request being handled.
 * 2. `resolvers` - A resolver map for cases where the default Mirage resolvers
 *    aren't sufficient. Such cases include: resolving root-level scalar values,
 *    sorting records and complex mutations.
 * 3. `root` - A root level value that GraphQL will use as the parent object for
 *    fields at the highest level.
 */
type CreateHandlerOptions = {
  context?: { [key: string]: any };
  resolvers?: ResolverMap;
  root?: any;
};

/**
 * A higher-order function that returns a request handler for GraphQL queries.
 * It accepts both a GraphQL and Mirage schema along with a hash of options.
 *
 * The GraphQL schema param may be a string, an AST or an executable
 * GraphQL schema. This library ensures the schema is executable in any case.
 *
 * This also ensures models are added to the Mirage schema for each appropriate
 * type from the GraphQL schema. Since the GraphQL schema already defines types
 * and relationships, it may be redundant to define Mirage models when using
 * GraphQL. You may still define Mirage models, though, if you’d like.
 *
 * Lastly, it creates a field resolver that GraphQL will use to resolve every
 * field from a query. If an optional resolver isn't supplied for a given field,
 * this field resolver will be used. It does its best to resolve queries and
 * mutations automatically based on the information from the GraphQL schema and
 * the records in Mirage’s database.
 */
export function createGraphQLHandler(
  graphQLSchema: SourceGraphQLSchema,
  mirageSchema: MirageSchema,
  options: CreateHandlerOptions = {}
): RouteHandler<AnyRegistry> {
  const { context = {}, resolvers, root } = options;
  const fieldResolver = createFieldResolver(resolvers);

  graphQLSchema = ensureExecutableGraphQLSchema(graphQLSchema);

  createModels(graphQLSchema, mirageSchema);

  return function graphQLHandler(_, request) {
    try {
      const { query, variables } = JSON.parse(request.requestBody);

      return graphql({
        contextValue: { ...context, mirageSchema, request },
        fieldResolver: fieldResolver as GraphQLFieldResolver<any, any>,
        rootValue: root,
        schema: graphQLSchema as GraphQLSchema,
        source: query,
        variableValues: variables,
      });
    } catch (ex) {
      return new Response(500, {}, { errors: [ex] });
    }
  };
}
