import { afterEach, beforeEach, describe, expect, test } from "vitest";
import objectQuery from "../../gql/queries/object.gql";
import objectNonNullQuery from "../../gql/queries/object-non-null.gql";
import { query, startServer } from "../setup.js";

import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";

let server: Server;

describe("Integration | queries | object", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for test object", async function () {
    server.create("test-object");

    const { testObject } = (await query(objectQuery, {
      variables: { id: "1" },
    })) as { testObject: TestObject };

    expect(testObject).toEqual({ id: "1" });
  });

  test("query for non-null test object", async function () {
    server.create("test-object");

    const { testObjectNonNull } = (await query(objectNonNullQuery, {
      variables: { id: "1" },
    })) as { testObjectNonNull: TestObject };

    expect(testObjectNonNull).toEqual({ id: "1" });
  });
});
