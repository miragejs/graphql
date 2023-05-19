import type Model from "miragejs/lib/orm/model.ts";
import type { GraphQLObjectLike, QueryArgs } from "./@types/index.js";
import type { GraphQLType } from "graphql";

type CursorEncoder = (s: string) => string;

export type RelayConnection = {
  edges: RelayEdge[];
  pageInfo: RelayPageInfo;
  totalCount: number;
};

export type RelayEdge = {
  cursor: string | number;
  node: { [key: string]: any };
};

export type RelayPageInfo = {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
};

const ENCODE: CursorEncoder =
  typeof btoa !== "undefined"
    ? btoa
    : typeof Buffer !== "undefined"
    ? (s: string) => Buffer.from(s).toString("base64")
    : (s: string) => s;

const NON_RELAY_ARGS_KEY = "nonRelayArgs";
const RELAY_ARGS = ["after", "before", "first", "last"];
const RELAY_ARGS_KEY = "relayArgs";

function getIndexOfRecord(
  records: Model[],
  cursor: string,
  typeName: string,
  encode: CursorEncoder
): number | null {
  let index = null;

  if (cursor == null) {
    return index;
  }

  for (let i = 0; i < records.length; i++) {
    if (encode(`${typeName}:${records[i].id}`) === cursor) {
      index = i;
      break;
    }
  }

  return index;
}

function hasField(type: GraphQLObjectLike, fieldName: string) {
  return fieldName in type.getFields();
}

/**
 * Given a list of records and a hash of Relay pagination arguments, it creates
 * a list of filtered Relay connection edges. It also accepts an encoding
 * function to create cursors. If no encoding function is passed in, a default
 * is used.
 *
 * @see {@link https://relay.dev/graphql/connections.htm#sec-Edge-Types}
 */
export function getEdges(
  records: Model[],
  args: QueryArgs,
  typeName: string,
  encode = ENCODE
): RelayEdge[] {
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
 * @see {@link https://relay.dev/graphql/connections.htm#sec-undefined.PageInfo}
 */
export function getPageInfo(
  records: Model[],
  edges: RelayEdge[]
): RelayPageInfo {
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
 */
export function getRelayArgs(args: QueryArgs): {
  [NON_RELAY_ARGS_KEY]: QueryArgs;
  [RELAY_ARGS_KEY]: QueryArgs;
} {
  return Object.keys(args).reduce(
    function (separatedArgs, arg) {
      const argsKey = RELAY_ARGS.includes(arg)
        ? RELAY_ARGS_KEY
        : NON_RELAY_ARGS_KEY;

      separatedArgs[argsKey][arg] = args[arg];

      return separatedArgs;
    },
    { relayArgs: {}, nonRelayArgs: {} }
  );
}

/**
 * Utility function to determine if a given type is a Relay connection.
 */
export function isRelayConnectionType(type: GraphQLObjectLike) {
  return type.name.endsWith("Connection") && hasField(type, "edges");
}

/**
 * Utility function to determine if a given type is a Relay connection edge.
 */
export function isRelayEdgeType(type: GraphQLObjectLike) {
  return type.name.endsWith("Edge") && hasField(type, "node");
}

/**
 * Utility function to determine if a given type is Relay connection page info.
 */
export function isRelayPageInfoType(type: GraphQLObjectLike) {
  return type.name === "PageInfo" && hasField(type, "startCursor");
}

/**
 * Utility function to determine if a given type is a Relay connection, a Relay
 * connection edge or Relay connection page info.
 */
export function isRelayType(type: GraphQLType) {
  return (
    "name" in type &&
    "getFields" in type &&
    (isRelayConnectionType(type) ||
      isRelayEdgeType(type) ||
      isRelayPageInfoType(type))
  );
}
