import { isRelayType } from "./relay-pagination";
import {
  GraphQLSchema,
  buildASTSchema,
  isListType,
  isNonNullType,
  parse,
} from "graphql";

/**
 * Given a GraphQL schema which may be a string or an AST, it returns an
 * executable version of that schema. If the schema passed in is already
 * executable, it returns the schema as-is.
 *
 * @function ensureExecutableGraphQLSchema
 * @param {Object} graphQLSchema
 * @returns {Object} The executable GraphQL schema.
 */
export function ensureExecutableGraphQLSchema(graphQLSchema) {
  if (!(graphQLSchema instanceof GraphQLSchema)) {
    if (typeof graphQLSchema === "string") {
      graphQLSchema = parse(graphQLSchema);
    }

    graphQLSchema = buildASTSchema(graphQLSchema, {
      commentDescriptions: true,
    });
  }

  return graphQLSchema;
}

/**
 * Unwraps GraphQL types, e.g., a non-null list of objects, to determine the
 * underlying type. It also considers types like Relay connections and edges.
 * This is useful when querying for list or non-null types and needing to know
 * which underlying type of record(s) to fetch from Mirage's database.
 *
 * It returns a hash containing a Boolean attribute, isList, which tells us the
 * underlying type was wrapped in a list type. It also contains a type attribute
 * that refers to the actual underlying type.
 *
 * @function unwrapType
 * @param {Object} type
 * @param {{considerRelay: boolean, isList: boolean}} options
 * @returns {{isList: boolean, type: Object}}
 */
export function unwrapType(
  type,
  options = { considerRelay: false, isList: false }
) {
  if (options.considerRelay && isRelayType(type)) {
    const fields = type.getFields();

    return fields.edges
      ? unwrapType(fields.edges.type, options)
      : unwrapType(fields.node.type, options);
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
