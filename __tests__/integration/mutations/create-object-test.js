import createTestObjectMutation from "@tests/gql/mutations/create.gql";
import { mutate, startServer } from "@tests/integration/setup";

describe("Integration | mutations | create", function () {
  it("can create a test object", async function () {
    const server = startServer();

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
});
