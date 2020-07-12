import { getRecords } from "../orm/records";

/**
 * Resolves a field that returns a union type. For each type in the union, it
 * fetches and filters records from Mirage's database.
 *
 * @function resolveUnion
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {Object[]} A list of records of many types from Mirage's database.
 */
export default function resolveUnion(_obj, args, context, _info, type) {
  const types = type.getTypes();
  const recordsForTypes = types.reduce(function (records, type) {
    return [...records, ...getRecords(type, args, context.mirageSchema)];
  }, []);

  return recordsForTypes;
}
