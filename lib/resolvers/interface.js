import resolveObject from "./object";

function getTypeFromInlineFragment(info) {
  const selection = info.fieldNodes[0].selectionSet.selections.find(
    ({ kind }) => kind === "InlineFragment"
  );

  if (selection) {
    const {
      typeCondition: {
        name: { value: typeName },
      },
    } = selection;

    return info.schema.getTypeMap()[typeName];
  }
}

function resolveFromImplementations(obj, args, context, info, type) {
  const { objects: implementations } = info.schema.getImplementations(type);

  return implementations
    .map((implType) => resolveObject(obj, args, context, info, implType))
    .find((record) => record != null);
}

/**
 * Resolves a field that returns an interface types. If the query includes an
 * inline fragment, it uses that to determine the implementation type by which
 * to resolve. If no inline fragment is specified, it gets all implementation
 * types and looks for a record matching any of those.
 *
 * The latter case could be unreliable and in such cases it is advised that an
 * optional resolver be passed into the handler for the particular field. In
 * either case, it delegates to `resolveObject`.
 *
 * @function resolveInterface
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @param {Object} type An unwrapped type.
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @see resolveObject
 * @returns {Object} A record from Mirage's database.
 */
export default function resolveInterface(obj, args, context, info, type) {
  const implType = getTypeFromInlineFragment(info);

  return implType
    ? resolveObject(obj, args, context, info, implType)
    : resolveFromImplementations(obj, args, context, info, type);
}
