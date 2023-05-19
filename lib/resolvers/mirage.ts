import {
  GraphQLObjectType,
  GraphQLResolveInfo,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from "graphql";

import resolveDefault from "./default.js";
import resolveList from "./list.js";
import resolveObject from "./object.js";
import resolveInterface from "./interface.js";
import resolveUnion from "./union.js";
import { unwrapType } from "../utils.js";

import type { QueryArgs, ResolverContext } from "../@types/index.js";

/**
 * Resolves all fields from queries handled by the GraphQL handler. It unwraps
 * the return type, if need be, and delegates resolution to different resolvers,
 * depending on the type. If no suitable resolver exists in this library, it
 * delegates to GraphQL's default field resolver (in cases like fields that
 * return scalar values, for example).
 *
 * This resolver is useful when composing optional resolvers to pass into the
 * GraphQL handler as it does a lot of the heavy lifting. For example,
 * implementing a resolver that sorts a list of filtered records becomes trivial
 * if the records are fetched using this resolver before sorting them.
 *
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export default function mirageGraphQLFieldResolver(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo
) {
  const { isList, type } = unwrapType(info.returnType);

  if (isInterfaceType(type)) {
    return resolveInterface(source, args, context, info, type);
  }

  if (isUnionType(type)) {
    return resolveUnion(source, args, context, info, isList, type);
  }

  if (!isObjectType(type)) {
    return resolveDefault(source, args, context, info);
  }

  if (isList) {
    return resolveList(source, args, context, info, type as GraphQLObjectType);
  }

  return resolveObject(source, args, context, info, type as GraphQLObjectType);
}
