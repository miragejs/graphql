import { isInterfaceType, isObjectType, isUnionType } from "graphql";
import resolveDefault from "./default";
import resolveList from "./list";
import resolveObject from "./object";
import resolveInterface from "./interface";
import resolveUnion from "./union";
import { unwrapType } from "../utils";

/**
 * Resolves all fields from queries handled by the GraphQL handler. It unwraps
 * the return type, if need be, and delegates resolution to different resolvers,
 * depending on the type. If no suitable resolver exists in this library, it
 * delegates to GraphQL's default field resolver (in cases like fields that
 * return scalar values, for example).
 *
 * This resolver is useful when composing optional resolvers to pass into the
 * GraphQL handler as it does a lot of the heavy lifting. For example,
 * implementing a resolver that sorts a list of filtered records becomes trivial
 * if the records are fetched using this resolver before sorting them.
 *
 * @function mirageGraphQLFieldResolver
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @returns {*}
 */
export default function mirageGraphQLFieldResolver(obj, args, context, info) {
  let { isList, type } = unwrapType(info.returnType);

  return isInterfaceType(type)
    ? resolveInterface(obj, args, context, info, type)
    : isUnionType(type)
    ? resolveUnion(obj, args, context, info, type)
    : !isObjectType(type)
    ? resolveDefault(...arguments)
    : isList
    ? resolveList(obj, args, context, info, type)
    : resolveObject(obj, args, context, info, type);
}
