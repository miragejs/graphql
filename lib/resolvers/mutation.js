import { unwrapType } from "../utils";
import { isInputObjectType, isSpecifiedScalarType } from "graphql";

function getMutationVarTypes(variableDefinitions, typeMap) {
  return variableDefinitions.reduce(function (vars, definition) {
    const { type: typeInfo } = unwrapType(definition.type.type);
    const type = typeMap[typeInfo.name.value];

    return [...vars, type];
  }, []);
}

function hasCreateVars(varTypes) {
  return varTypes.length === 1 && isInputObjectType(varTypes[0]);
}

function hasDeleteVars(varTypes) {
  return varTypes.length === 1 && isIdVar(varTypes[0]);
}

function hasUpdateVars(varTypes) {
  return (
    varTypes.length === 2 &&
    varTypes.reduce(function (hasUpdateVars, varType) {
      if (hasUpdateVars === false) return hasUpdateVars;

      return isInputObjectType(varType) || isIdVar(varType);
    }, null)
  );
}

function isIdVar(varType) {
  return isSpecifiedScalarType(varType) && varType.name === "ID";
}

function resolveCreateMutation(args, table) {
  const input = args[Object.keys(args)[0]];

  return table.insert(input);
}

function resolveDeleteMutation(args, table) {
  const record = table.find(args.id);

  table.remove(args.id);

  return record;
}

function resolveUpdateMutation(args, table) {
  const input = args[Object.keys(args).find((arg) => arg !== "id")];

  return table.update(args.id, input);
}

function throwUnimplemented(info) {
  throw new Error(
    `Could not find a default resolver for ${info.fieldName}. Please supply a resolver for this mutation.`
  );
}

/**
 * Resolves mutations in a default way. There are three types of mutations this
 * library will try to resolve automatically:
 *
 * 1. Create. A mutation with one input type argument.
 * 2. Update. A mutation with two arguments: ID type and input type.
 * 3. Delete. A mutation with one ID type argument.
 *
 * Each of these default mutations will return the affected record. Any
 * mutations with different arguments, or mutations where the above assumptions
 * don't apply, must be resolved by an optional resolver passed into the GraphQL
 * handler.
 *
 * @function resolveMutation
 * @param {Object} [obj]
 * @param {Object} args
 * @param {Object} context
 * @param {Object} info
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @throws It will throw an error if the mutation cannot be handled by default.
 * @returns {Object} The affected record from Mirage's database.
 */
export function resolveMutation(args, context, info, typeName) {
  const collectionName = context.mirageSchema.toCollectionName(typeName);
  const table = context.mirageSchema.db[collectionName];
  const varTypes = getMutationVarTypes(
    info.operation.variableDefinitions,
    info.schema.getTypeMap()
  );

  return hasCreateVars(varTypes)
    ? resolveCreateMutation(args, table)
    : hasDeleteVars(varTypes)
    ? resolveDeleteMutation(args, table)
    : hasUpdateVars(varTypes)
    ? resolveUpdateMutation(args, table)
    : throwUnimplemented(info);
}
