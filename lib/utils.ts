import {
  GraphQLSchema,
  GraphQLType,
  buildASTSchema,
  isListType,
  isNonNullType,
  parse,
} from "graphql";

import { isRelayType } from "./relay-pagination.js";

import type { GraphQLObjectLike, SourceGraphQLSchema } from "./@types/index.js";

function unwrapRelayType(
  type: GraphQLObjectLike,
  options: { considerRelay: boolean; isList: boolean }
) {
  const fields = type.getFields();

  return fields.edges
    ? unwrapType(fields.edges.type, options)
    : unwrapType(fields.node.type, options);
}

/**
 * Capitalize the first character of a string. If the first character of the
 * given string is not a letter, there is no effect.
 */
export function capitalize(str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1)}`;
}

/**
 * Given a GraphQL schema which may be a string or an AST, it returns an
 * executable version of that schema. If the schema passed in is already
 * executable, it returns the schema as-is.
 */
export function ensureExecutableGraphQLSchema(
  graphQLSchema: SourceGraphQLSchema
) {
  if (graphQLSchema instanceof GraphQLSchema) {
    return graphQLSchema;
  }

  if (typeof graphQLSchema === "string") {
    graphQLSchema = parse(graphQLSchema);
  }

  return buildASTSchema(graphQLSchema);
}

/**
 * Unwraps GraphQL types, e.g., a non-null list of objects, to determine the
 * underlying type. It also considers types like Relay connections and edges.
 * This is useful when querying for list or non-null types and needing to know
 * which underlying type of record(s) to fetch from Mirage's database.
 */
export function unwrapType(
  type: GraphQLType,
  options = { considerRelay: false, isList: false }
): { isList: boolean; type: GraphQLType } {
  if (options.considerRelay && isRelayType(type)) {
    return unwrapRelayType(type as GraphQLObjectLike, options);
  }

  const isList = isListType(type);

  if (isList || isNonNullType(type)) {
    if (!options.isList) {
      options.isList = isList;
    }

    return unwrapType(type.ofType, options);
  }

  return { isList: options.isList, type };
}
