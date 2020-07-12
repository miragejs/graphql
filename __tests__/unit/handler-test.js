jest.mock("@lib/orm/models");
jest.mock("@lib/resolvers/field");
jest.mock("@lib/utils");
jest.mock("graphql", () => ({
  __esModule: true,
  graphql: jest.fn(function () {
    throw new Error("foo");
  }),
}));

import { Response } from "miragejs";
import createFieldResolver from "@lib/resolvers/field";
import { createGraphQLHandler } from "@lib/handler";
import { ensureExecutableGraphQLSchema } from "@lib/utils";
import { ensureModels } from "@lib/orm/models";
import { graphql } from "graphql"; // eslint-disable-line no-unused-vars
import { graphQLSchema } from "@tests/unit/setup";

describe("Unit | handler", function () {
  const mirageSchema = {};
  const resolvers = {};
  const graphQLHandler = createGraphQLHandler(graphQLSchema, mirageSchema, {
    resolvers,
  });

  it("creates a GraphQL field resolver", function () {
    expect(createFieldResolver).toHaveBeenCalledWith(resolvers);
  });

  it("ensures the GraphQL schema is executable", function () {
    expect(ensureExecutableGraphQLSchema).toHaveBeenCalledWith(graphQLSchema);
  });

  it("ensures models are created in the Mirage schema", function () {
    expect(ensureModels).toHaveBeenCalledWith({ graphQLSchema, mirageSchema });
  });

  it("responds with 500 if GraphQL throws an exception", function () {
    const response = graphQLHandler(null, { requestBody: "{}" });

    expect(response).toBeInstanceOf(Response);
    expect(response.code).toBe(500);
    expect(response.data.errors[0].message).toBe("foo");
  });
});
