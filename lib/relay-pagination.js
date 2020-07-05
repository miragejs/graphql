/**
 * Encodes a string.
 *
 * @callback encode
 * @param {string} str
 * @returns {string}
 */
import { btoa } from "b2a";

const RELAY_ARGS = ["after", "before", "first", "last"];

function getIndexOfRecord(records, cursor, typeName, encode) {
  let index = null;

  if (cursor == null) return index;

  for (let i = 0; i < records.length; i++) {
    if (encode(`${typeName}:${records[i].id}`) === cursor) {
      index = i;
      break;
    }
  }

  return index;
}

function hasField(type, fieldName) {
  return fieldName in type.getFields();
}

/**
 * Given a list of records and a hash of Relay pagination arguments, it creates
 * a list of filtered Relay connection edges. It also accepts an encoding
 * function to create cursors. If no encoding function is passed in, a default
 * is used.
 *
 * @function getEdges
 * @param {Object[]} records
 * @param {{first: integer, last: integer, after: string, before: string}} args
 * @param {string} typeName
 * @param {encode} [encode]
 * @see {@link https://relay.dev/graphql/connections.htm#sec-Edge-Types}
 * @returns {Object[]} A list of Relay connection edges mapped from the records.
 */
export function getEdges(records, args, typeName, encode = btoa) {
  const { after, before, first, last } = args;
  const afterIndex = getIndexOfRecord(records, after, typeName, encode);
  const beforeIndex = getIndexOfRecord(records, before, typeName, encode);

  if (afterIndex != null) records = records.slice(afterIndex + 1);
  if (beforeIndex != null) records = records.slice(0, beforeIndex);
  if (first != null) records = records.slice(0, first);
  if (last != null) records = records.slice(-last);

  return records.map((record) => ({
    cursor: encode(`${typeName}:${record.id}`),
    node: record,
  }));
}

/**
 * Given a list of records and a list of edges, this function compares the two
 * lists and builds page info for a Relay connection.
 *
 * @function getPageInfo
 * @param {Object[]} records
 * @param {Object[]} edges
 * @see {@link https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo}
 * @returns {{hasPreviousPage: boolean, hasNextPage: boolean, startCursor: string, endCursor: string}}
 */
export function getPageInfo(records, edges) {
  const pageInfo = {
    hasPreviousPage: false,
    hasNextPage: false,
    startCursor: null,
    endCursor: null,
  };

  if (edges && edges.length) {
    const [firstEdge] = edges;
    const lastEdge = edges[edges.length - 1];

    pageInfo.startCursor = firstEdge.cursor;
    pageInfo.endCursor = lastEdge.cursor;
    pageInfo.hasPreviousPage = firstEdge.node.id !== records[0].id;
    pageInfo.hasNextPage = lastEdge.node.id !== records[records.length - 1].id;
  }

  return pageInfo;
}

/**
 * Given a list of arguments, it separates Relay pagination args (first, last,
 * after, before) from any other arguments.
 *
 * @function getRelayArgs
 * @param {Object} args
 * @returns {{relayArgs: Object, nonRelayArgs: Object}}
 */
export function getRelayArgs(args) {
  return Object.keys(args).reduce(
    function (separatedArgs, arg) {
      const argsSet = RELAY_ARGS.includes(arg) ? "relayArgs" : "nonRelayArgs";

      separatedArgs[argsSet][arg] = args[arg];

      return separatedArgs;
    },
    { relayArgs: {}, nonRelayArgs: {} }
  );
}

/**
 * Utility function to determine if a given type is a Relay connection.
 *
 * @function isRelayEdgeType
 * @param {Object} type
 * @returns {boolean}
 */
export function isRelayConnectionType(type) {
  return type.name.endsWith("Connection") && hasField(type, "edges");
}

/**
 * Utility function to determine if a given type is a Relay connection edge.
 *
 * @function isRelayEdgeType
 * @param {Object} type
 * @returns {boolean}
 */
export function isRelayEdgeType(type) {
  return type.name.endsWith("Edge") && hasField(type, "node");
}

/**
 * Utility function to determine if a given type is Relay connection page info.
 *
 * @function isRelayPageInfoType
 * @param {Object} type
 * @returns {boolean}
 */
export function isRelayPageInfoType(type) {
  return type.name === "PageInfo" && hasField(type, "startCursor");
}

/**
 * Utility function to determine if a given type is a Relay connection, a Relay
 * connection edge or Relay connection page info.
 *
 * @function isRelayType
 * @param {Object} type
 * @return {boolean}
 */
export function isRelayType(type) {
  return (
    type.name &&
    (isRelayConnectionType(type) ||
      isRelayEdgeType(type) ||
      isRelayPageInfoType(type))
  );
}
