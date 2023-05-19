vi.mock("../../../lib/orm/records.js");

import { describe, expect, test, vi } from "vitest";
import { filterRecords, getRecords } from "../../../lib/orm/records.js";
import { mockRequest } from "../../mock.js";
import resolveList from "../../../lib/resolvers/list.js";

import type { GraphQLObjectType, GraphQLResolveInfo } from "graphql";

describe("Unit | resolvers | list", function () {
  describe("without a parent record", function () {
    const source = undefined;
    const args = {};
    const type = {} as GraphQLObjectType;
    const context = { mirageSchema: {}, request: mockRequest() };

    test("finds records for the given type and args", function () {
      resolveList(source, args, context, undefined, type);

      expect(getRecords).toHaveBeenCalledWith(type, args, context.mirageSchema);
    });
  });

  describe("parent records", function () {
    test("returns edges of parent, if type is a Relay edge", function () {
      const source = { edges: [] };

      const type = {
        name: "TestEdge",
        getFields: () => ({ node: undefined }),
      } as unknown as GraphQLObjectType;

      const edges = resolveList(source, undefined, undefined, undefined, type);

      expect(edges).toEqual(source.edges);
    });

    test("can filter records included with the parent record", function () {
      const source = { bars: [] };
      const args = {};
      const info = { fieldName: "bars" } as GraphQLResolveInfo;
      const type = { name: "Foo" } as GraphQLObjectType;

      resolveList(source, args, undefined, info, type);

      expect(filterRecords).toHaveBeenCalledWith(source.bars, args);
    });

    test("can filter records related to a Mirage record", function () {
      const source = { bars: { models: [] } };
      const args = {};
      const info = { fieldName: "bars" } as GraphQLResolveInfo;
      const type = { name: "Foo" } as GraphQLObjectType;

      resolveList(source, args, undefined, info, type);

      expect(filterRecords).toHaveBeenCalledWith(source.bars.models, args);
    });
  });
});
