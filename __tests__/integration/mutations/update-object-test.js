import updateTestObjectMutation from "@tests/gql/mutations/update.gql";
import updateTestObjectNonNullMutation from "@tests/gql/mutations/update-non-null.gql";
import { mutate, startServer } from "@tests/integration/setup";

let server;

describe("Integration | mutations | update", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  it("can update a test object", async function () {
    server.create("test-object", { size: "M" });

    const { updateTestObject } = await mutate(updateTestObjectMutation, {
      variables: { id: "1", input: { size: "L" } },
    });
    const record = server.schema.testObjects.first();

    expect(updateTestObject).toEqual({ id: "1", size: "L" });
    expect(record.size).toBe("L");
  });

  it("can update a test object (non-null input)", async function () {
    server.create("test-object", { size: "M" });

    const { updateTestObjectNonNull } = await mutate(
      updateTestObjectNonNullMutation,
      {
        variables: { id: "1", input: { size: "L" } },
      }
    );
    const record = server.schema.testObjects.first();

    expect(updateTestObjectNonNull).toEqual({ id: "1", size: "L" });
    expect(record.size).toBe("L");
  });
});
