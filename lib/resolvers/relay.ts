import {
  RelayConnection,
  getEdges,
  getPageInfo,
  getRelayArgs,
} from "../relay-pagination.js";

import { filterRecords, getRecords } from "../orm/records.js";
import { unwrapType } from "../utils.js";

import type { QueryArgs, ResolverContext } from "../@types/index.js";
import type { GraphQLObjectType, GraphQLResolveInfo } from "graphql";

function getNodeType(connectionType: GraphQLObjectType): GraphQLObjectType {
  const { edges: edgesField } = connectionType.getFields();
  const edgeTypeInfo = unwrapType(edgesField.type);
  const edgeType = edgeTypeInfo.type as GraphQLObjectType;
  const nodeTypeInfo = unwrapType(edgeType.getFields().node.type);

  return nodeTypeInfo.type as GraphQLObjectType;
}

/**
 * Resolves a field that returns a Relay connection type. It determines the type
 * of records to fetch and filter from Mirage's database and builds a list of
 * edges and page info for the connection.
 *
 * @see {@link https://relay.dev/graphql/connections.htm#sec-Connection-Types}
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export function resolveRelayConnection(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  connectionType: GraphQLObjectType
): RelayConnection {
  const { relayArgs, nonRelayArgs } = getRelayArgs(args);
  const nodeType = getNodeType(connectionType);
  const records =
    source && source[info.fieldName] && source[info.fieldName].models
      ? filterRecords(source[info.fieldName].models, nonRelayArgs)
      : getRecords(nodeType, nonRelayArgs, context.mirageSchema);
  const edges = getEdges(records, relayArgs, nodeType.name);

  return {
    edges,
    pageInfo: getPageInfo(records, edges),
    totalCount: records.length,
  };
}
