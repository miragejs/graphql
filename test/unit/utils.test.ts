import {
  capitalize,
  ensureExecutableGraphQLSchema,
  unwrapType,
} from "../../lib/utils.js";

import { DocumentNode, GraphQLObjectType, GraphQLScalarType } from "graphql";
import { describe, expect, test } from "vitest";
import graphQLSchema from "../gql/schema.gql";

describe("Unit | utils", function () {
  describe("ensure executable GraphQL schema", function () {
    function testSchema(schemaToTest: string | DocumentNode) {
      const schema = ensureExecutableGraphQLSchema(schemaToTest);
      const typeMap = schema.getTypeMap();
      const Query = typeMap.Query as GraphQLObjectType;
      const TestObject = typeMap.TestObject as GraphQLObjectType;
      const { size } = TestObject.getFields();
      const { testObject } = Query.getFields();

      expect(size.name).toBe("size");
      expect(size.type).toBeInstanceOf(GraphQLScalarType);
      expect(testObject.name).toBe("testObject");
      expect(testObject.type).toBeInstanceOf(GraphQLObjectType);
    }

    test("if the schema is an AST", function () {
      testSchema(graphQLSchema);
    });

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
  });

  describe("unwrap type", function () {
    const executableSchema = ensureExecutableGraphQLSchema(graphQLSchema);
    const typeMap = executableSchema.getTypeMap();
    const Query = typeMap.Query as GraphQLObjectType;
    const queryFields = Query.getFields();

    test("can unwrap non-null types", function () {
      const { type: nonNullType } = queryFields.testObjectNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullType)).toEqual({ isList: false, type });
    });

    test("can unwrap list types", function () {
      const { type: listType } = queryFields.testObjects;
      const type = typeMap.TestObject;

      expect(unwrapType(listType)).toEqual({ isList: true, type });
    });

    test("can unwrap a non-null list", function () {
      const { type: nonNullListType } = queryFields.testObjectsNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullListType)).toEqual({ isList: true, type });
    });

    test("can unwrap a non-null list of non-null types", function () {
      const { type: nonNullListOfNonNullType } =
        queryFields.testObjectsNestedNonNull;
      const type = typeMap.TestObject;

      expect(unwrapType(nonNullListOfNonNullType)).toEqual({
        isList: true,
        type,
      });
    });

    test("can unwrap Relay node types", function () {
      const { type: connectionType } = queryFields.testRelayConnection;
      const nodeType = typeMap.TestRelayNode;

      expect(
        unwrapType(connectionType, { considerRelay: true, isList: false })
      ).toEqual({
        isList: true,
        type: nodeType,
      });
    });

    test("can unwrap non-null Relay edges", function () {
      const nonNullNodeType = typeMap.TestRelayNode;
      const { type: connectionType } =
        queryFields.testNonNullEdgesRelayConnection;

      expect(
        unwrapType(connectionType, { considerRelay: true, isList: false })
      ).toEqual({
        isList: true,
        type: nonNullNodeType,
      });
    });

    test("can unwrap non-null Relay nodes", function () {
      const nonNullNodeType = typeMap.TestRelayNode;
      const { type: connectionType } =
        queryFields.testNonNullNodesRelayConnection;

      expect(
        unwrapType(connectionType, { considerRelay: true, isList: false })
      ).toEqual({
        isList: true,
        type: nonNullNodeType,
      });
    });
  });

  describe("capitalize string", function () {
    test("capitalizes the first letter of a string", function () {
      expect(capitalize("foo bar")).toBe("Foo bar");
    });
  });
});
