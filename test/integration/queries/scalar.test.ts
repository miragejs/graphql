import { afterEach, beforeEach, describe, expect, test } from "vitest";
import contextQuery from "../../gql/queries/context.gql";
import { HOST, query, startServer } from "../setup.js";
import scalarQuery from "../../gql/queries/scalar.gql";
import scalarNonNullQuery from "../../gql/queries/scalar-non-null.gql";
import scalarOptionalResolveQuery from "../../gql/queries/scalar-optional-resolve.gql";

import type { Server } from "miragejs";

let server: Server;

describe("Integration | queries | scalars", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for scalar from context", async function () {
    const { testContext } = (await query(contextQuery, {
      url: `${HOST}/graphql-scalars`,
    })) as { testContext: string };

    expect(testContext).toBe("foo");
  });

  test("query for scalar on root object", async function () {
    const { testScalar } = (await query(scalarQuery, {
      url: `${HOST}/graphql-scalars`,
    })) as { testScalar: string };

    expect(testScalar).toBe("foo");
  });

  test("query for non-null scalar on root object", async function () {
    const { testScalarNonNull } = (await query(scalarNonNullQuery, {
      url: `${HOST}/graphql-scalars`,
    })) as { testScalarNonNull: string };

    expect(testScalarNonNull).toBe("foo");
  });

  test("query for optional resolver scalar on root object", async function () {
    const { testScalarOptionalResolve } = (await query(
      scalarOptionalResolveQuery,
      { url: `${HOST}/graphql-scalars` }
    )) as { testScalarOptionalResolve: string };

    expect(testScalarOptionalResolve).toBe("foo");
  });
});
