import deleteTestObjectMutation from "@tests/gql/mutations/delete.gql";
import { mutate, startServer } from "@tests/integration/setup";

describe("Integration | mutations | create", function () {
  it("can create a test object", async function () {
    const server = startServer();

    server.create("test-object", { size: "M" });

    const { deleteTestObject } = await mutate(deleteTestObjectMutation, {
      variables: { id: "1" },
    });
    const record = server.schema.testObjects.first();

    expect(deleteTestObject).toEqual({ id: "1", size: "M" });
    expect(record).toBeNull();
  });
});
