import {
  GraphQLResolveInfo,
  GraphQLNamedType,
  NamedTypeNode,
  NonNullTypeNode,
  VariableDefinitionNode,
  isInputObjectType,
  isSpecifiedScalarType,
} from "graphql";

import type DbCollection from "miragejs/lib/db-collection.js";
import type Model from "miragejs/lib/orm/model.js";
import type { ObjMap } from "graphql/jsutils/ObjMap.js";
import type { QueryArgs, ResolverContext } from "../@types/index.js";

function getMutationVarTypes(
  variableDefinitions: readonly VariableDefinitionNode[],
  typeMap: ObjMap<GraphQLNamedType>
): GraphQLNamedType[] {
  return variableDefinitions.reduce(function (vars, definition) {
    let typeInfo = definition.type;

    if (typeInfo.kind !== "NamedType") {
      ({ type: typeInfo } = typeInfo as NonNullTypeNode);
    }

    const { name } = typeInfo as NamedTypeNode;
    const type = typeMap[name.value];

    return [...vars, type];
  }, []);
}

function hasCreateVars(varTypes: GraphQLNamedType[]) {
  return varTypes.length === 1 && isInputObjectType(varTypes[0]);
}

function hasDeleteVars(varTypes: GraphQLNamedType[]) {
  return varTypes.length === 1 && isIdVar(varTypes[0]);
}

function hasUpdateVars(varTypes: GraphQLNamedType[]) {
  if (varTypes.length !== 2) {
    return false;
  }

  let hasIdVar = false;
  let hasInputVar = false;

  for (const type in varTypes) {
    if (isInputObjectType(varTypes[type])) {
      hasInputVar = true;
    } else if (isIdVar(varTypes[type])) {
      hasIdVar = true;
    }
  }

  return hasIdVar && hasInputVar;
}

function isIdVar(varType: GraphQLNamedType) {
  return isSpecifiedScalarType(varType) && varType.name === "ID";
}

type InsertAttrs = { id: string } & QueryArgs;

function resolveCreateMutation(
  args: QueryArgs,
  table: DbCollection
): InsertAttrs | InsertAttrs[] {
  const input = args[Object.keys(args)[0]];

  return table.insert(input);
}

function resolveDeleteMutation(args: QueryArgs, table: DbCollection): Model {
  const record = table.find(args.id);

  table.remove(args.id);

  return record;
}

function resolveUpdateMutation(args: QueryArgs, table: DbCollection): Model[] {
  const input = args[Object.keys(args).find((arg) => arg !== "id")];

  return table.update(args.id, input);
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
 * don’t apply, must be resolved by an optional resolver passed into the GraphQL
 * handler.
 *
 * @see {@link https://graphql.org/learn/execution/#root-fields-resolvers}
 * @throws {Error} If no default resolver can be found for the mutation.
 */
export function resolveMutation(
  args: QueryArgs,
  context: ResolverContext,
  info: GraphQLResolveInfo,
  typeName: string
): Model | Model[] | InsertAttrs | InsertAttrs[] {
  const collectionName = context.mirageSchema.toCollectionName(typeName);
  const table = context.mirageSchema.db[collectionName];
  const varTypes = getMutationVarTypes(
    info.operation.variableDefinitions,
    info.schema.getTypeMap()
  );

  if (hasCreateVars(varTypes)) {
    return resolveCreateMutation(args, table);
  }

  if (hasDeleteVars(varTypes)) {
    return resolveDeleteMutation(args, table);
  }

  if (hasUpdateVars(varTypes)) {
    return resolveUpdateMutation(args, table);
  }

  throw new Error(
    `Could not find a default resolver for ${info.fieldName}. Please supply a resolver for this mutation.`
  );
}
