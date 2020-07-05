import { adaptRecords, getRecords } from "../orm/records";
import { isRelayEdgeType } from "../relay-pagination";

/**
 * Resolves fields that return a list type. Note: If there's no parent object,
 * this only works for lists that return a list of records from Mirage's
 * database. If a query should return a list of scalar values, for example, an
 * optional resolver should be passed into the GraphQL handler.
 *
 * @function resolveList
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @param {Object} type An unwrapped type.
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {Object[]} A list of records from Mirage's database.
 */
export default function resolveList(obj, args, context, info, type) {
  return !obj
    ? getRecords(type, args, context.mirageSchema)
    : isRelayEdgeType(type)
    ? obj.edges
    : adaptRecords(obj[info.fieldName].models, type.name);
}
