import { adaptRecord, filterRecords, getRecords } from "../orm/records.js";

import type {
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLUnionType,
} from "graphql";

import type MirageSchema from "miragejs/lib/orm/schema.js";
import type { QueryArgs, ResolverContext } from "../@types/index.js";
import type { TypedRecord } from "../orm/records.js";

function getRecordsForTypes(
  types: readonly GraphQLObjectType[],
  args: QueryArgs,
  mirageSchema: MirageSchema
): TypedRecord[] {
  return types.reduce(function (records: TypedRecord[], type) {
    return [...records, ...getRecords(type, args, mirageSchema)];
  }, []);
}

/**
 * Resolves a field that returns a union type. For each type in the union, it
 * fetches records from Mirage's database.
 *
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export default function resolveUnion(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  isList: boolean,
  type: GraphQLUnionType
): TypedRecord | TypedRecord[] {
  if (!source) {
    return getRecordsForTypes(type.getTypes(), args, context.mirageSchema);
  }

  if (isList) {
    return filterRecords(source[info.fieldName].models, args);
  }

  return adaptRecord(source[info.fieldName]);
}
