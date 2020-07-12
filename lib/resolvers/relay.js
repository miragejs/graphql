import { getEdges, getPageInfo, getRelayArgs } from "../relay-pagination";
import { getRecords, adaptRecords } from "../orm/records";
import { unwrapType } from "../utils";

/**
 * Resolves a field that returns a Relay connection type. It determines the type
 * of records to fetch and filter from Mirage's database and builds a list of
 * edges and page info for the connection.
 *
 * @function resolveRelayConnection
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @see {@link https://relay.dev/graphql/connections.htm#sec-Connection-Types}
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {{edges: Object[], pageInfo: Object}}
 */
export function resolveRelayConnection(obj, args, context, info, type) {
  const { edges: edgesField } = type.getFields();
  const { type: edgeType } = unwrapType(edgesField.type);
  const { relayArgs, nonRelayArgs } = getRelayArgs(args);
  const { type: nodeType } = unwrapType(edgeType.getFields().node.type);
  const records =
    obj && obj[info.fieldName] && obj[info.fieldName].models
      ? adaptRecords(obj[info.fieldName].models, nodeType.name)
      : getRecords(nodeType, nonRelayArgs, context.mirageSchema);
  const edges = getEdges(records, relayArgs, nodeType.name);

  return {
    edges,
    pageInfo: getPageInfo(records, edges),
  };
}
