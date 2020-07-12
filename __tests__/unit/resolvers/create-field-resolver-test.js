jest.mock("@lib/resolvers/mirage");

import createFieldResolver from "@lib/resolvers/field";
import mirageGraphQLFieldResolver from "@lib/resolvers/mirage";

describe("Unit | resolvers | create field resolver", function () {
  test("field resolver can delegate to optional resolver", function () {
    const optionalResolvers = { Foo: { bar: jest.fn(() => {}) } };
    const fieldResolver = createFieldResolver(optionalResolvers);
    const obj = {};
    const args = {};
    const context = {};
    const info = { fieldName: "bar", parentType: { name: "Foo" } };

    fieldResolver(obj, args, context, info);

    expect(optionalResolvers.Foo.bar).toHaveBeenCalledWith(
      obj,
      args,
      context,
      info
    );
  });

  test("field resolver calls Mirage field resolver by default", function () {
    const fieldResolver = createFieldResolver();
    const obj = {};
    const args = {};
    const context = {};
    const info = { fieldName: "bar", parentType: { name: "Foo" } };

    fieldResolver(obj, args, context, info);

    expect(mirageGraphQLFieldResolver).toHaveBeenCalledWith(
      obj,
      args,
      context,
      info
    );
  });
});
