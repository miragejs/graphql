import { Model, belongsTo, hasMany } from "miragejs";
import { camelize } from "miragejs/lib/utils/inflector.js";
import { isRelayType } from "../relay-pagination.js";
import { unwrapType } from "../utils.js";

import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLType,
  isInterfaceType,
  isObjectType,
  isUnionType,
} from "graphql";

import type { BelongsTo, HasMany } from "miragejs/-types";
import type MirageSchema from "miragejs/lib/orm/schema.js";

function createAssociations<Name extends string>(
  modelType: GraphQLObjectType
): { [name: string]: BelongsTo<Name> | HasMany<Name> } {
  const fieldMap = modelType.getFields();

  return Object.keys(fieldMap).reduce(function (options, field) {
    const { isList, type } = unwrapType(fieldMap[field].type, {
      considerRelay: true,
      isList: false,
    });

    if (isObjectType(type) || isInterfaceType(type) || isUnionType(type)) {
      const associationName = camelize(type.name);
      const polymorphic = isInterfaceType(type) || isUnionType(type);

      options[field] = isList
        ? hasMany(associationName, { polymorphic })
        : belongsTo(associationName, { polymorphic });
    }

    return options;
  }, {});
}

function queryTypesFromSchema(graphQLSchema: GraphQLSchema) {
  return [
    graphQLSchema.getMutationType(),
    graphQLSchema.getQueryType(),
    graphQLSchema.getSubscriptionType(),
  ];
}

function canCreateModel(
  type: GraphQLType,
  mirageSchema: MirageSchema,
  queryTypes: GraphQLObjectType<any, any>[]
) {
  return (
    isObjectType(type) &&
    !queryTypes.includes(type) &&
    !mirageSchema.hasModelForModelName(type.name) &&
    !isRelayType(type) &&
    !type.name.startsWith("__")
  );
}

/**
 * Create models in Mirage’s schema for each appropriate type in the GraphQL
 * schema*. We do this for 2 main reasons:
 *
 * 1. It saves us from having to specify models in the Mirage server setup that
 *    essentially duplicate information we already have in the GraphQL schema.
 * 2. It ensures relationships are properly established in the Mirage schema.
 *
 * *You can still define models in your Mirage server setup. In those cases, this
 * function will not attempt to create them automatically.
 */
export function createModels(
  graphQLSchema: GraphQLSchema,
  mirageSchema: MirageSchema
) {
  const queryTypes = queryTypesFromSchema(graphQLSchema);
  const typeMap = graphQLSchema.getTypeMap();

  for (const typeName in typeMap) {
    const { type } = unwrapType(typeMap[typeName]);

    if (!canCreateModel(type, mirageSchema, queryTypes)) {
      continue;
    }

    const { name: modelName } = type as GraphQLObjectType;
    const associations = createAssociations(type as GraphQLObjectType);

    mirageSchema.registerModel(modelName, Model.extend({ ...associations }));
  }
}
