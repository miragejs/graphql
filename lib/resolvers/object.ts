import { adaptRecord } from "../orm/records.js";
import { resolveMutation } from "./mutation.js";
import { resolveRelayConnection } from "./relay.js";
import { unwrapType } from "../utils.js";

import {
  RelayEdge,
  RelayPageInfo,
  isRelayConnectionType,
  isRelayEdgeType,
  isRelayPageInfoType,
} from "../relay-pagination.js";

import type { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import type { QueryArgs, ResolverContext } from "../@types/index.js";

function findRecord(
  args: QueryArgs,
  context: ResolverContext,
  typeName: string
) {
  const collectionName = context.mirageSchema.toCollectionName(typeName);
  const record = context.mirageSchema[collectionName].findBy(args);

  return adaptRecord(record);
}

function isMutation(info: GraphQLResolveInfo) {
  return info.parentType === info.schema.getMutationType();
}

/**
 * Resolves a field that returns an object type. Since there are many different
 * object types, this function handles the different cases:
 *
 * * Objects
 * * Mutations
 * * Relay connections
 * * Relay edges
 * * Relay page info
 *
 *  @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export default function resolveObject(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  type: GraphQLObjectType
) {
  if (isMutation(info)) {
    return resolveMutation(args, context, info, type.name);
  }

  if (isRelayConnectionType(type)) {
    return resolveRelayConnection(source, args, context, info, type);
  }

  if (!source) {
    return findRecord(args, context, type.name);
  }

  const { type: parentType } = unwrapType(info.parentType);

  if (isRelayEdgeType(parentType as GraphQLObjectType)) {
    const { node } = source as RelayEdge;
    return node;
  }

  if (isRelayPageInfoType(type)) {
    const { pageInfo } = source as { pageInfo: RelayPageInfo };
    return pageInfo;
  }

  return adaptRecord(source[info.fieldName]);
}
