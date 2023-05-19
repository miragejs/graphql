vi.mock("../../../lib/resolvers/mirage.js");

import createFieldResolver from "../../../lib/resolvers/field.js";
import { describe, expect, test, vi } from "vitest";
import mirageGraphQLFieldResolver from "../../../lib/resolvers/mirage.js";
import { mockRequest } from "../../mock.js";

import type { GraphQLResolveInfo } from "graphql";

describe("Unit | resolvers | create field resolver", function () {
  test("field resolver can delegate to optional resolver", function () {
    const optionalResolvers = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      Foo: { bar: vi.fn(() => {}) },
    };
    const fieldResolver = createFieldResolver(optionalResolvers);
    const source = {};
    const args = {};
    const context = { mirageSchema: {}, request: mockRequest() };
    const info = {
      fieldName: "bar",
      parentType: { name: "Foo" },
    } as unknown as GraphQLResolveInfo;

    fieldResolver(source, args, context, info);

    expect(optionalResolvers.Foo.bar).toHaveBeenCalledWith(
      source,
      args,
      context,
      info
    );
  });

  test("field resolver calls Mirage field resolver by default", function () {
    const fieldResolver = createFieldResolver();
    const source = {};
    const args = {};
    const context = { mirageSchema: {}, request: mockRequest() };
    const info = {
      fieldName: "bar",
      parentType: { name: "Foo" },
    } as unknown as GraphQLResolveInfo;

    fieldResolver(source, args, context, info);

    expect(mirageGraphQLFieldResolver).toHaveBeenCalledWith(
      source,
      args,
      context,
      info
    );
  });
});
