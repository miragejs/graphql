import { adaptRecord } from "../orm/records";
import { resolveMutation } from "./mutation";
import { resolveRelayConnection } from "./relay";
import { unwrapType } from "../utils";
import {
  isRelayConnectionType,
  isRelayEdgeType,
  isRelayPageInfoType,
} from "../relay-pagination";

function findRecord(args, context, typeName) {
  const collectionName = context.mirageSchema.toCollectionName(typeName);
  const record = context.mirageSchema[collectionName].findBy(args);

  return adaptRecord(record, typeName);
}

function isMutation(info) {
  return info.parentType === info.schema.getMutationType();
}

/**
 * Resolves a field that returns an object type.
 *
 * @function resolveObject
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {Object} A record from Mirage's database.
 */
export default function resolveObject(obj, args, context, info, type) {
  const { type: parentType } = unwrapType(info.parentType);

  return isMutation(info)
    ? resolveMutation(args, context, info, type.name)
    : isRelayConnectionType(type)
    ? resolveRelayConnection(obj, args, context, info, type)
    : !obj
    ? findRecord(args, context, type.name)
    : isRelayEdgeType(parentType)
    ? obj.node
    : isRelayPageInfoType(type)
    ? obj.pageInfo
    : adaptRecord(obj[info.fieldName], type.name);
}
