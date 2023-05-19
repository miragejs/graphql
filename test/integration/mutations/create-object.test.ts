import { afterEach, beforeEach, describe, expect, test } from "vitest";
import createTestObjectMutation from "../../gql/mutations/create.gql";
import createTestObjectNonNullMutation from "../../gql/mutations/create-non-null.gql";
import { mutate, startServer } from "../setup.js";

import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";

let server: Server;

describe("Integration | mutations | create", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("can create a test object", async function () {
    const { createTestObject } = (await mutate(createTestObjectMutation, {
      variables: {
        input: { size: "M" },
      },
    })) as { createTestObject: TestObject };

    const record = server.schema.first("testObject") as unknown as TestObject;

    expect(createTestObject).toEqual({ id: "1", size: "M" });
    expect(record.id).toBe("1");
    expect(record.size).toBe("M");
  });

  test("can create a test object (non-null input type)", async function () {
    const { createTestObjectNonNull } = (await mutate(
      createTestObjectNonNullMutation,
      {
        variables: {
          input: { size: "M" },
        },
      }
    )) as { createTestObjectNonNull: TestObject };

    const record = server.schema.first("testObject") as unknown as TestObject;

    expect(createTestObjectNonNull).toEqual({ id: "1", size: "M" });
    expect(record.id).toBe("1");
    expect(record.size).toBe("M");
  });
});
