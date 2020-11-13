import { adaptRecord, filterRecords, getRecords } from "../orm/records";

function getRecordsForTypes(types, args, mirageSchema) {
  return types.reduce(function (records, type) {
    return [...records, ...getRecords(type, args, mirageSchema)];
  }, []);
}

/**
 * Resolves a field that returns a union type. For each type in the union, it
 * fetches and filters records from Mirage's database.
 *
 * @function resolveUnion
 * @param {Object} obj
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @param {Boolean} isList
 * @param {Object} type
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {Object[]} A list of records of many types from Mirage's database.
 */
export default function resolveUnion(obj, args, context, info, isList, type) {
  return !obj
    ? getRecordsForTypes(type.getTypes(), args, context.mirageSchema)
    : isList
    ? filterRecords(obj[info.fieldName].models, args)
    : adaptRecord(obj[info.fieldName]);
}
