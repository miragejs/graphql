import { GraphQLObjectType, GraphQLScalarType } from "graphql";
import { graphQLSchemaAST, graphQLSchema } from "@tests/gql/schema";
import { ensureExecutableGraphQLSchema, unwrapType } from "@lib/utils";

describe("Unit | utils", function () {
  describe("ensure exectuable GraphQL schema", function () {
    function testSchema(schemaToTest) {
      const schema = ensureExecutableGraphQLSchema(schemaToTest);
      const typeMap = schema.getTypeMap();
      const { size } = typeMap.TestObject.getFields();
      const { testObject } = typeMap.Query.getFields();

      expect(size.name).toBe("size");
      expect(size.type).toBeInstanceOf(GraphQLScalarType);
      expect(testObject.name).toBe("testObject");
      expect(testObject.type).toBeInstanceOf(GraphQLObjectType);
    }

    // eslint-disable-next-line jest/expect-expect
    test("if the schema is an AST", function () {
      testSchema(graphQLSchemaAST);
    });

    // eslint-disable-next-line jest/expect-expect
    test("if the schema is a string", function () {
      testSchema(`
      type Query {
        testObject: TestObject
      }
      
      type TestObject {
        size: String
      }
      `);
    });

    // eslint-disable-next-line jest/expect-expect
    test("if the schema is already executable", function () {
      testSchema(graphQLSchema);
    });
  });

  describe("unwrap type", function () {
    const typeMap = graphQLSchema.getTypeMap();
    const queryFields = typeMap.Query.getFields();

    it("can unwrap non-null types", function () {
      const { type: nonNullType } = queryFields.testObjectNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullType)).toEqual({ isList: false, type });
    });

    it("can unwrap list types", function () {
      const { type: listType } = queryFields.testObjects;
      const type = typeMap.TestObject;

      expect(unwrapType(listType)).toEqual({ isList: true, type });
    });

    it("can unwrap a non-null list", function () {
      const { type: nonNullListType } = queryFields.testObjectsNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullListType)).toEqual({ isList: true, type });
    });

    it("can unwrap a non-null list of non-null types", function () {
      const {
        type: nonNullListOfNonNullType,
      } = queryFields.testObjectsNestedNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullListOfNonNullType)).toEqual({
        isList: true,
        type,
      });
    });

    it("can unwrap Relay node types", function () {
      const { type: connectionType } = queryFields.testRelayConnection;
      const nodeType = typeMap.TestRelayNode;

      expect(unwrapType(connectionType, { considerRelay: true })).toEqual({
        isList: true,
        type: nodeType,
      });
    });

    it("can unwrap non-null Relay edges", function () {
      const {
        type: connectionType,
      } = queryFields.testNonNullEdgesRelayConnection;
      const nonNullNodeType = typeMap.TestRelayNode;

      expect(unwrapType(connectionType, { considerRelay: true })).toEqual({
        isList: true,
        type: nonNullNodeType,
      });
    });

    it("can unwrap non-null Relay nodes", function () {
      const {
        type: connectionType,
      } = queryFields.testNonNullNodesRelayConnection;
      const nonNullNodeType = typeMap.TestRelayNode;

      expect(unwrapType(connectionType, { considerRelay: true })).toEqual({
        isList: true,
        type: nonNullNodeType,
      });
    });
  });
});
