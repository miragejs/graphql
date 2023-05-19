import { camelize } from "miragejs/lib/utils/inflector.js";
import { capitalize } from "../utils.js";

import type { GraphQLObjectType } from "graphql";
import type MirageSchema from "miragejs/lib/orm/schema.js";
import type Model from "miragejs/lib/orm/model.js";
import type { QueryArgs } from "../@types/index.js";

export type TypedRecord = { [key: string]: any } & { __typename: string };

/**
 * Adapts a record from Mirage's database to return in the GraphQL response. It
 * flattens the attributes and relationships in a copy of the record. It also
 * ensures the `__typename` attribute is added to the copy so GraphQL can
 * resolve records of a polymorphic type.
 */
export function adaptRecord(record: Model): TypedRecord {
  if (record == null) {
    return;
  }

  const { attrs, associations } = record;
  const __typename = capitalize(camelize(record.modelName));
  const clone = { ...attrs, __typename };

  for (const field in associations) {
    clone[field] = record[field];
  }

  return clone;
}

/**
 * Adapts a list of records from Mirage's database to return in the GraphQL
 * response.
 */
export function adaptRecords(records: Model[]): TypedRecord[] {
  return records.map(adaptRecord);
}

/**
 * Gets records from Mirage's database for the given GraphQL type. It can filter
 * the records by the given GraphQL arguments, if supplied. Filtering assumes
 * each key in `args` corresponds to an attribute of the record.
 *
 * For more advanced filtering needs, or sorting, for example, you will need to
 * implement your own resolver.
 */
export function getRecords(
  type: GraphQLObjectType,
  args: QueryArgs,
  mirageSchema: MirageSchema
) {
  const collectionName = mirageSchema.toCollectionName(type.name);
  // TODO: Make the `where` bit opt-in
  const records = mirageSchema[collectionName].where(args).models;

  return adaptRecords(records);
}

/**
 * Filters records by a hash of arguments. This is useful in cases where you
 * have a list of records and don't need to fetch them from Mirage's database.
 * Filtering assumes each key in `args` corresponds to an attribute of the
 * record.
 *
 * For more advanced filtering needs, or sorting, for example, you will need to
 * implement your own resolver.
 */
export function filterRecords(records: Model[], args: QueryArgs) {
  if (args) {
    records = records.filter(function (record) {
      return Object.keys(args).reduce(function (isMatch, arg) {
        return !isMatch ? isMatch : record[arg] === args[arg];
      }, true);
    });
  }

  return adaptRecords(records);
}
