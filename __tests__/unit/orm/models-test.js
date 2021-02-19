import { ensureModels, createModels } from "@lib/orm/models";
import { graphQLSchema } from "@tests/gql/schema";

describe("Unit | ORM | models", function () {
  describe("ensureModels", function () {
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

    it("does register the TestObject model", function () {
      expect(registeredModels.TestObject).toBeDefined();
    });

    it("does register the TestCategory model", function () {
      expect(registeredModels.TestCategory).toBeDefined();
    });

    it("does register the TestOption model", function () {
      expect(registeredModels.TestOption).toBeDefined();
    });

    it("does not register the TestInterface model", function () {
      expect(registeredModels.TestInterface).toBeUndefined();
    });

    it("does register the TestImplOne model", function () {
      expect(registeredModels.TestImplOne).toBeDefined();
    });

    it("does register the TestImplTwo model", function () {
      expect(registeredModels.TestImplTwo).toBeDefined();
    });

    it("does not register the TestUnion model", function () {
      expect(registeredModels.TestUnion).toBeUndefined();
    });

    it("does register the TestUnionOne model", function () {
      expect(registeredModels.TestUnionOne).toBeDefined();
    });

    it("does register the TestUnionTwo model", function () {
      expect(registeredModels.TestUnionTwo).toBeDefined();
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

  describe("createModels", function () {
    const models = createModels({ graphQLSchema });

    function findModel(name) {
      return models.find((model) => model.name == name);
    }

    it("does not create a model for the mutation type", function () {
      expect(findModel("Mutation")).toBeUndefined();
    });

    it("does not create a model for the query type", function () {
      expect(findModel("Query")).toBeUndefined();
    });

    it("does not create a model for the subscription type", function () {
      expect(findModel("Subscription")).toBeUndefined();
    });

    it("does create the TestObject model", function () {
      expect(findModel("TestObject")).toBeDefined();
    });

    it("does create the TestCategory model", function () {
      expect(findModel("TestCategory")).toBeDefined();
    });

    it("does create the TestOption model", function () {
      expect(findModel("TestOption")).toBeDefined();
    });

    it("does not create the TestInterface model", function () {
      expect(findModel("TestInterface")).toBeUndefined();
    });

    it("does create the TestImplOne model", function () {
      expect(findModel("TestImplOne")).toBeDefined();
    });

    it("does create the TestImplTwo model", function () {
      expect(findModel("TestImplTwo")).toBeDefined();
    });

    it("does not create the TestUnion model", function () {
      expect(findModel("TestUnion")).toBeUndefined();
    });

    it("does create the TestUnionOne model", function () {
      expect(findModel("TestUnionOne")).toBeDefined();
    });

    it("does create the TestUnionTwo model", function () {
      expect(findModel("TestUnionTwo")).toBeDefined();
    });

    describe("TestObject relationships", function () {
      const model = findModel("TestObject");

      function findRelationship(model, fieldName) {
        return model.associations.find((item) => item.fieldName == fieldName);
      }

      function testRelationship(
        fieldName,
        type,
        associationName,
        { isPolymorphic = false } = {}
      ) {
        const rel = findRelationship(model, fieldName);
        expect(rel).toBeDefined();
        expect(rel.name).toBe(associationName);
        expect(rel.type).toBe(type);
        expect(rel.options.polymorphic).toBe(isPolymorphic);
      }

      // eslint-disable-next-line jest/expect-expect
      it("belongs to test category", function () {
        testRelationship("belongsToField", "belongsTo", "testCategory");
      });

      // eslint-disable-next-line jest/expect-expect
      it("has many test options", function () {
        testRelationship("hasManyField", "hasMany", "testOption");
      });

      // eslint-disable-next-line jest/expect-expect
      it("belongs to test interface", function () {
        testRelationship("interfaceField", "belongsTo", "testInterface", {
          isPolymorphic: true,
        });
      });

      // eslint-disable-next-line jest/expect-expect
      it("has many test relay nodes", function () {
        testRelationship("relayConnectionField", "hasMany", "testRelayNode");
      });

      // eslint-disable-next-line jest/expect-expect
      it("has many test unions", function () {
        testRelationship("unionField", "hasMany", "testUnion", {
          isPolymorphic: true,
        });
      });
    });
  });
});
