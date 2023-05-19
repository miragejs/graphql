import type { DocumentNode, GraphQLResolveInfo, GraphQLSchema } from "graphql";
import type MirageSchema from "miragejs/lib/orm/schema.js";
import type { Request } from "miragejs";

/**
 * Useful for simplified type discrimination. Mimics `GraphQLObjectType`,
 * `GraphQLInterfaceType` and `GraphQLInputObjectType`.
 */
export type GraphQLObjectLike = {
  name: string;
  getFields: () => { [key: string]: any };
};

/**
 * A map of GraphQL query arguments.
 */
export type QueryArgs = { [argName: string]: any };

/**
 * A function that resolves GraphQL queries.
 */
export type Resolver = (
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo
) => any;

/**
 * A context object that GraphQL will pass into each resolver. A common use case
 * for this is to supply current user information to resolvers. By default,
 * whatever context you pass in will be appended with a reference to the Mirage
 * schema and the request being handled.
 */
export type ResolverContext = { [key: string]: any } & {
  mirageSchema: MirageSchema;
  request: Request;
};

/**
 * A map of resolvers. For each field name in the map, the value can be a
 * `Resolver` or an additional `ResolverMap`.
 */
export type ResolverMap = {
  [fieldName: string]: Resolver | ResolverMap;
};

/**
 * Source of a GraphQL schema. It can be a string, an existing GraphQL schema or
 * an AST.
 */
type SourceGraphQLSchema = DocumentNode | GraphQLSchema | string;
