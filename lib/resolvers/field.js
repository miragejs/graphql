import mirageGraphQLFieldResolver from "./mirage";

function getOptionalResolver(info, optionalResolvers) {
  const { fieldName, parentType } = info;

  return (
    optionalResolvers &&
    optionalResolvers[parentType.name] &&
    optionalResolvers[parentType.name][fieldName]
  );
}

/**
 * The field resolver to be used for all GraphQL queries. It delegates to an
 * optional resolver passed into the GraphQL handler or the high-level Mirage
 * resolver.
 *
 * @callback fieldResolver
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @returns {*}
 */

/**
 * A higher order function that accepts a hash of optional resolvers passed into
 * the GraphQL handler and returns a field resolver function to be used for all
 * GraphQL queries.
 *
 * @function createFieldResolver
 * @param {Object} optionalResolvers
 * @return {fieldResolver}
 */
export default function createFieldResolver(optionalResolvers) {
  return function fieldResolver(_obj, _args, _context, info) {
    const optionalResolver = getOptionalResolver(info, optionalResolvers);

    if (optionalResolver) {
      return optionalResolver(...arguments);
    }

    return mirageGraphQLFieldResolver(...arguments);
  };
}
