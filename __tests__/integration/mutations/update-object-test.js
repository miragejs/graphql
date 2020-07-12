import updateTestObjectMutation from "@tests/gql/mutations/update.gql";
import { mutate, startServer } from "@tests/integration/setup";

describe("Integration | mutations | create", function () {
  it("can create a test object", async function () {
    const server = startServer();

    server.create("test-object", { size: "M" });

    const { updateTestObject } = await mutate(updateTestObjectMutation, {
      variables: { id: "1", input: { size: "L" } },
    });
    const record = server.schema.testObjects.first();

    expect(updateTestObject).toEqual({ id: "1", size: "L" });
    expect(record.size).toBe("L");
  });
});
