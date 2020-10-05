import createTestObjectMutation from "@tests/gql/mutations/create.gql";
import createTestObjectNonNullMutation from "@tests/gql/mutations/create-non-null.gql";
import { mutate, startServer } from "@tests/integration/setup";

let server;

describe("Integration | mutations | create", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  it("can create a test object", async function () {
    const { createTestObject } = await mutate(createTestObjectMutation, {
      variables: {
        input: { size: "M" },
      },
    });
    const record = server.schema.testObjects.first();

    expect(createTestObject).toEqual({ id: "1", size: "M" });
    expect(record.id).toBe("1");
    expect(record.size).toBe("M");
  });

  it("can create a test object (non-null input type)", async function () {
    const { createTestObjectNonNull } = await mutate(
      createTestObjectNonNullMutation,
      {
        variables: {
          input: { size: "M" },
        },
      }
    );
    const record = server.schema.testObjects.first();

    expect(createTestObjectNonNull).toEqual({ id: "1", size: "M" });
    expect(record.id).toBe("1");
    expect(record.size).toBe("M");
  });
});
