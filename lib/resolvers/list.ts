import { filterRecords, getRecords } from "../orm/records.js";
import { RelayConnection, isRelayEdgeType } from "../relay-pagination.js";
import { GraphQLResolveInfo, GraphQLObjectType } from "graphql";

import type { Model } from "miragejs/lib/orm/model.js";
import type { QueryArgs, ResolverContext } from "../@types/index.js";

/**
 * For a given record, this function gets related records by association name.
 * The type of association, has many or belongs to, is determined by the
 * presence of the `models` property of the value assigned to the record’s
 * property that matches the association name.
 */
function getRelatedRecords(
  record: any,
  associationName: string
): Model[] | Model {
  return record[associationName].models || record[associationName];
}

/**
 * Resolves fields that return a list type. Note: If there's no parent object,
 * this only works for lists that return a list of records from Mirage's
 * database. If a query should return a list of scalar values, for example, an
 * optional resolver should be passed into the GraphQL handler.
 *
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export default function resolveList(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  type: GraphQLObjectType
) {
  if (!source) {
    return getRecords(type, args, context.mirageSchema);
  }

  if (isRelayEdgeType(type)) {
    const { edges } = source as RelayConnection;
    return edges;
  }

  // TODO: Filtering records should be opt-in
  return filterRecords(getRelatedRecords(source, info.fieldName), args);
}
