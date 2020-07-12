import { ensureModels } from "@lib/orm/models";
import { graphQLSchema } from "@tests/gql/schema";

describe("Unit | ORM | models", function () {
  const registeredModels = {};
  const mirageSchema = {
    hasModelForModelName: () => false,
    registerModel(typeName, model) {
      registeredModels[typeName] = model;
    },
  };

  ensureModels({ graphQLSchema, mirageSchema });

  it("does not register a model for the mutation type", function () {
    expect(registeredModels.Mutation).toBeUndefined();
  });

  it("does not register a model for the query type", function () {
    expect(registeredModels.Query).toBeUndefined();
  });

  it("does not register a model for the subscription type", function () {
    expect(registeredModels.Subscription).toBeUndefined();
  });

  describe("TestObject relationships", function () {
    const model = new registeredModels.TestObject({}, "TestObject");

    function testRelationship(
      name,
      type,
      modelName,
      { isPolymorphic = false } = {}
    ) {
      expect(model.__proto__[name].constructor.name).toBe(type);
      expect(model.__proto__[name].modelName).toBe(modelName);
      expect(model.__proto__[name].opts.polymorphic).toBe(isPolymorphic);
    }

    // eslint-disable-next-line jest/expect-expect
    it("belongs to test category", function () {
      testRelationship("belongsToField", "BelongsTo", "test-category");
    });

    // eslint-disable-next-line jest/expect-expect
    it("has many test options", function () {
      testRelationship("hasManyField", "HasMany", "test-option");
    });

    // eslint-disable-next-line jest/expect-expect
    it("belongs to test interface", function () {
      testRelationship("interfaceField", "BelongsTo", "test-interface", {
        isPolymorphic: true,
      });
    });

    // eslint-disable-next-line jest/expect-expect
    it("has many test relay nodes", function () {
      testRelationship("relayConnectionField", "HasMany", "test-relay-node");
    });

    // eslint-disable-next-line jest/expect-expect
    it("has many test unions", function () {
      testRelationship("unionField", "HasMany", "test-union", {
        isPolymorphic: true,
      });
    });
  });
});
