import {
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLResolveInfo,
  InlineFragmentNode,
} from "graphql";

import resolveObject from "./object.js";

import type { ResolverContext, QueryArgs } from "../@types/index.js";

function getTypeFromInlineFragment(info: GraphQLResolveInfo) {
  const selection = info.fieldNodes[0].selectionSet.selections.find(
    ({ kind }) => kind === "InlineFragment"
  );

  if (selection) {
    const {
      typeCondition: {
        name: { value: typeName },
      },
    } = selection as InlineFragmentNode;

    return info.schema.getTypeMap()[typeName];
  }
}

function resolveFromImplementations(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  type: GraphQLInterfaceType
) {
  const { objects: implementations } = info.schema.getImplementations(type);

  return implementations
    .map((implType) => resolveObject(source, args, context, info, implType))
    .find((record) => record != null);
}

/**
 * Resolves a field that returns an interface type. If the query includes an
 * inline fragment, it uses that to determine the implementation type by which
 * to resolve. If no inline fragment is specified, it gets all implementation
 * types and looks for a record matching any of those.
 *
 * The latter case could be unreliable and in such cases it is advised that an
 * optional resolver be passed into the handler for the particular field. In
 * either case, it delegates to `resolveObject`.
 *
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 */
export default function resolveInterface(
  source: any,
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  type: GraphQLInterfaceType
) {
  const implType = getTypeFromInlineFragment(info) as GraphQLObjectType;

  return implType
    ? resolveObject(source, args, context, info, implType)
    : resolveFromImplementations(source, args, context, info, type);
}
