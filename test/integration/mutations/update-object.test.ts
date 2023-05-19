import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { mutate, startServer } from "../setup.js";
import updateTestObjectMutation from "../../gql/mutations/update.gql";
import updateTestObjectNonNullMutation from "../../gql/mutations/update-non-null.gql";

import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";
import type { TestObjectAttrs } from "../../@types/mirage.js";

let server: Server;

describe("Integration | mutations | update", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("can update a test object", async function () {
    server.create("test-object", { size: "M" } as TestObjectAttrs);

    const { updateTestObject } = (await mutate(updateTestObjectMutation, {
      variables: { id: "1", input: { size: "L" } },
    })) as { updateTestObject: TestObject };

    const record = server.schema.first("testObject") as unknown as TestObject;

    expect(updateTestObject).toEqual({ id: "1", size: "L" });
    expect(record.size).toBe("L");
  });

  test("can update a test object (non-null input)", async function () {
    server.create("test-object", { size: "M" } as TestObjectAttrs);

    const { updateTestObjectNonNull } = (await mutate(
      updateTestObjectNonNullMutation,
      {
        variables: { id: "1", input: { size: "L" } },
      }
    )) as { updateTestObjectNonNull: TestObject };

    const record = server.schema.first("testObject") as unknown as TestObject;

    expect(updateTestObjectNonNull).toEqual({ id: "1", size: "L" });
    expect(record.size).toBe("L");
  });
});
