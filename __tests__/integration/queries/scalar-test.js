import contextQuery from "@tests/gql/queries/context.gql";
import scalarQuery from "@tests/gql/queries/scalar.gql";
import scalarNonNullQuery from "@tests/gql/queries/scalar-non-null.gql";
import scalarOptionalResolveQuery from "@tests/gql/queries/scalar-optional-resolve.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | scalars", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for scalar from context", async function () {
    const { testContext } = await query(contextQuery, {
      url: "/graphql-scalars",
    });

    expect(testContext).toBe("foo");
  });

  test("query for scalar on root object", async function () {
    const { testScalar } = await query(scalarQuery, {
      url: "/graphql-scalars",
    });

    expect(testScalar).toBe("foo");
  });

  test("query for non-null scalar on root object", async function () {
    const { testScalarNonNull } = await query(scalarNonNullQuery, {
      url: "/graphql-scalars",
    });

    expect(testScalarNonNull).toBe("foo");
  });

  test("query for optional resolver scalar on root object", async function () {
    const {
      testScalarOptionalResolve,
    } = await query(scalarOptionalResolveQuery, { url: "/graphql-scalars" });

    expect(testScalarOptionalResolve).toBe("foo");
  });
});
