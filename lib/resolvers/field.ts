import mirageGraphQLFieldResolver from "./mirage.js";

import type { GraphQLResolveInfo } from "graphql";

import type {
  QueryArgs,
  Resolver,
  ResolverContext,
  ResolverMap,
} from "../@types/index.d.ts";

function getOptionalResolver(
  info: GraphQLResolveInfo,
  resolvers?: ResolverMap
): Resolver | undefined {
  if (!resolvers) {
    return;
  }

  const { fieldName, parentType } = info;

  return resolvers[parentType.name] && resolvers[parentType.name][fieldName];
}

/**
 * A higher order function that accepts a hash of optional resolvers passed into
 * the GraphQL handler and returns a field resolver function to be used for all
 * GraphQL queries.
 *
 * The field resolver delegates to an optional resolver passed in when creating
 * the GraphQL request handler or the default Mirage GraphQL resolver.
 */
export default function createFieldResolver(resolvers?: ResolverMap) {
  return function fieldResolver(
    source: any,
    args: QueryArgs,
    context: ResolverContext,
    info: GraphQLResolveInfo
  ) {
    const optionalResolver = getOptionalResolver(info, resolvers);

    return optionalResolver
      ? optionalResolver(source, args, context, info)
      : mirageGraphQLFieldResolver(source, args, context, info);
  };
}
