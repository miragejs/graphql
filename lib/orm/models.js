import {
  Model,
  belongsTo,
  hasMany,
  _utilsInflectorCamelize as camelize,
} from "miragejs";
import { isInterfaceType, isUnionType, isObjectType } from "graphql";
import { isRelayType } from "../relay-pagination";
import { unwrapType } from "../utils";

const ASSOCIATION_TYPE_CHECKS = [isInterfaceType, isObjectType, isUnionType];

function isAssociationType(type) {
  return ASSOCIATION_TYPE_CHECKS.find((checkType) => checkType(type));
}

function createAssociationForFields(fields) {
  return function (associations, fieldName) {
    const fieldType = fields[fieldName].type;
    const { isList, type: unwrappedType } = unwrapType(fieldType, {
      considerRelay: true,
    });

    if (isAssociationType(unwrappedType)) {
      const associationName = camelize(unwrappedType.name);
      const options = {
        polymorphic:
          isInterfaceType(unwrappedType) || isUnionType(unwrappedType),
      };

      associations.push({
        name: associationName,
        fieldName: fieldName,
        type: isList ? "hasMany" : "belongsTo",
        options,
      });
    }

    return associations;
  };
}

function createAssociations(type) {
  const fields = type.getFields();
  return Object.keys(fields).reduce(createAssociationForFields(fields), []);
}

function createModel(type) {
  return {
    name: type.name,
    camelizedName: camelize(type.name),
    associations: createAssociations(type),
  };
}

function shouldCreateModel(type) {
  return (
    isObjectType(type) && !isRelayType(type) && !type.name.startsWith("__")
  );
}

function shouldRegisterModel(mirageSchema, name) {
  return !mirageSchema.hasModelForModelName(name);
}

function createAssociationOptions(model) {
  return model.associations.reduce(function (options, association) {
    options[association.fieldName] =
      association.type === "hasMany"
        ? hasMany(association.name, association.options)
        : belongsTo(association.name, association.options);

    return options;
  }, {});
}

function registerModel(mirageSchema, model) {
  const options = createAssociationOptions(model);
  mirageSchema.registerModel(model.name, Model.extend(options));
}

/**
 * Create a POJO for all model definitions from the Graphql Schema. It figures
 * out all the models and their relationships that need to be established for
 * the Mirage Schema.
 *
 * Use this data to generate Mirage Models. This is the underlining
 * implementation of `ensureModels`.
 *
 * @function createModels
 * @param {{graphQLSchema: Object} options
 */
export function createModels({ graphQLSchema }) {
  const graphQLSchemaQueryTypes = [
    graphQLSchema.getMutationType(),
    graphQLSchema.getQueryType(),
    graphQLSchema.getSubscriptionType(),
  ];
  const typeMap = graphQLSchema.getTypeMap();

  return Object.keys(typeMap).reduce(function (models, typeName) {
    const { type } = unwrapType(typeMap[typeName]);
    const isQueryType = graphQLSchemaQueryTypes.includes(type);

    if (shouldCreateModel(type) && !isQueryType) {
      models.push(createModel(type));
    }
    return models;
  }, []);
}

/**
 * Ensures models exist in Mirage's schema for each appropriate type in the
 * GraphQL schema. We do this for 2 main reasons:
 *
 * 1. It saves us from having to specify models in the Mirage server setup that
 *    essentially duplicate information we already have in the GraphQL schema.
 * 2. It ensures relationships are properly established in the Mirage schema.
 *
 * You can still specify models in your Mirage server setup. Any existing models
 * in the Mirage schema are skipped here.
 *
 * @function ensureModels
 * @param {{graphQLSchema: Object, mirageSchema: Object}} options
 */
export function ensureModels({ graphQLSchema, mirageSchema }) {
  const models = createModels({ graphQLSchema });

  models.forEach(function (model) {
    if (shouldRegisterModel(mirageSchema, model.name)) {
      registerModel(mirageSchema, model);
    }
  });
}
