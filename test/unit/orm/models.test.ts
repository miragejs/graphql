import Model from "miragejs/lib/orm/model.js";
import { createModels } from "../../../lib/orm/models.js";
import { describe, expect, test } from "vitest";
import { ensureExecutableGraphQLSchema } from "../../../lib/utils.js";
import graphQLSchema from "../../gql/schema.gql";

type ModelsFromSchema = {
  Mutation?: Model;
  Query?: Model;
  Subscription?: Model;
  TestCategory?: Model;
  TestImplOne?: Model;
  TestImplTwo?: Model;
  TestInterface?: Model;
  TestObject?: Model;
  TestOption?: Model;
  TestUnion?: Model;
  TestUnionOne?: Model;
  TestUnionTwo?: Model;
};

function mockMirageSchema() {
  const registeredModels: ModelsFromSchema = {};

  return {
    mirageSchema: {
      hasModelForModelName: () => false,
      registerModel(typeName: string, model: Model) {
        registeredModels[typeName] = model;
      },
    },
    registeredModels,
  };
}

describe("Unit | ORM | models", function () {
  describe("createModels", function () {
    const gqlSchema = ensureExecutableGraphQLSchema(graphQLSchema);
    const { mirageSchema, registeredModels } = mockMirageSchema();

    createModels(gqlSchema, mirageSchema);

    test("does not register a model for the mutation type", function () {
      expect(registeredModels.Mutation).toBeUndefined();
    });

    test("does not register a model for the query type", function () {
      expect(registeredModels.Query).toBeUndefined();
    });

    test("does not register a model for the subscription type", function () {
      expect(registeredModels.Subscription).toBeUndefined();
    });

    test("does register the TestObject model", function () {
      expect(registeredModels.TestObject).toBeDefined();
    });

    test("does register the TestCategory model", function () {
      expect(registeredModels.TestCategory).toBeDefined();
    });

    test("does register the TestOption model", function () {
      expect(registeredModels.TestOption).toBeDefined();
    });

    test("does not register the TestInterface model", function () {
      expect(registeredModels.TestInterface).toBeUndefined();
    });

    test("does register the TestImplOne model", function () {
      expect(registeredModels.TestImplOne).toBeDefined();
    });

    test("does register the TestImplTwo model", function () {
      expect(registeredModels.TestImplTwo).toBeDefined();
    });

    test("does not register the TestUnion model", function () {
      expect(registeredModels.TestUnion).toBeUndefined();
    });

    test("does register the TestUnionOne model", function () {
      expect(registeredModels.TestUnionOne).toBeDefined();
    });

    test("does register the TestUnionTwo model", function () {
      expect(registeredModels.TestUnionTwo).toBeDefined();
    });

    describe("TestObject relationships", function () {
      const model = new registeredModels.TestObject(mirageSchema, "TestObject");

      function expectRelationship(
        name: string,
        type: string,
        modelName: string,
        { isPolymorphic = false } = {}
      ) {
        expect(model.__proto__[name].constructor.name).toBe(type);
        expect(model.__proto__[name].modelName).toBe(modelName);
        expect(model.__proto__[name].opts.polymorphic).toBe(isPolymorphic);
      }

      test("belongs to test category", function () {
        expectRelationship("belongsToField", "BelongsTo", "test-category");
      });

      test("has many test options", function () {
        expectRelationship("hasManyField", "HasMany", "test-option");
      });

      test("belongs to test interface", function () {
        expectRelationship("interfaceField", "BelongsTo", "test-interface", {
          isPolymorphic: true,
        });
      });

      test("has many test relay nodes", function () {
        expectRelationship(
          "relayConnectionField",
          "HasMany",
          "test-relay-node"
        );
      });

      test("has many test unions", function () {
        expectRelationship("unionField", "HasMany", "test-union", {
          isPolymorphic: true,
        });
      });
    });
  });
});
