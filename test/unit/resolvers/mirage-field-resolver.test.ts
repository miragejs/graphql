vi.mock("../../../lib/resolvers/default.js");
vi.mock("../../../lib/resolvers/list.js");
vi.mock("../../../lib/resolvers/object.js");
vi.mock("../../../lib/resolvers/interface.js");
vi.mock("../../../lib/resolvers/union.js");

import { describe, expect, test, vi } from "vitest";
import defaultFieldResolver from "../../../lib/resolvers/default.js";
import { ensureExecutableGraphQLSchema } from "../../../lib/utils.js";
import graphQLSchema from "../../gql/schema.gql";
import mirageGraphQLFieldResolver from "../../../lib/resolvers/mirage.js";
import { mockRequest } from "../../mock.js";
import resolveList from "../../../lib/resolvers/list.js";
import resolveObject from "../../../lib/resolvers/object.js";
import resolveInterface from "../../../lib/resolvers/interface.js";
import resolveUnion from "../../../lib/resolvers/union.js";

import type {
  GraphQLList,
  GraphQLObjectType,
  GraphQLResolveInfo,
} from "graphql";

describe("Unit | resolvers | mirage field resolver", function () {
  const gqlSchema = ensureExecutableGraphQLSchema(graphQLSchema);
  const source = {};
  const args = {};
  const context = { mirageSchema: {}, request: mockRequest() };
  const typeMap = gqlSchema.getTypeMap();
  const { getFields } = typeMap.Query as GraphQLObjectType;
  const queryFields = getFields.call(typeMap.Query);

  describe("object types", function () {
    const { type } = queryFields.testObject;

    test("can resolve an object type", function () {
      const info = { returnType: type } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveObject).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        type
      );
    });

    test("can resolve a non-null object type", function () {
      const { type: nonNullType } = queryFields.testObjectNonNull;
      const info = { returnType: nonNullType } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveObject).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        type
      );
    });

    test("can resolve a list of objects", function () {
      const { type: listType } = queryFields.testObjects;
      const info = { returnType: listType } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveList).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        type
      );
    });
  });

  describe("polymorphic types", function () {
    test("can resolve union object types", function () {
      const info = {
        returnType: queryFields.testUnionSingular.type,
      } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveUnion).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        false,
        info.returnType
      );
    });

    test("can resolve union list types", function () {
      const { type } = queryFields.testUnion;
      const { ofType: unionType } = type as GraphQLList<GraphQLObjectType>;
      const info = {
        returnType: queryFields.testUnion.type,
      } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveUnion).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        true,
        unionType
      );
    });

    test("can resolve interface types", function () {
      const type = typeMap.TestInterface;
      const info = {
        returnType: queryFields.testInterface.type,
      } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(resolveInterface).toHaveBeenCalledWith(
        source,
        args,
        context,
        info,
        type
      );
    });
  });

  describe("scalar types", function () {
    test("can resolve scalar types", function () {
      const { type } = queryFields.testScalar;
      const info = { returnType: type } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(defaultFieldResolver).toHaveBeenCalledWith(
        source,
        args,
        context,
        info
      );
    });

    test("can resolve non-null scalar types", function () {
      const { type: nonNullType } = queryFields.testScalarNonNull;
      const info = { returnType: nonNullType } as GraphQLResolveInfo;

      mirageGraphQLFieldResolver(source, args, context, info);

      expect(defaultFieldResolver).toHaveBeenCalledWith(
        source,
        args,
        context,
        info
      );
    });
  });
});
