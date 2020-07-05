import objectQuery from "@tests/gql/queries/object.gql";
import objectNonNullQuery from "@tests/gql/queries/object-non-null.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | object", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for test object", async function () {
    server.create("test-object");

    const { testObject } = await query(objectQuery, {
      variables: { id: "1" },
    });

    expect(testObject).toEqual({ id: "1" });
  });

  test("query for non-null test object", async function () {
    server.create("test-object");

    const { testObjectNonNull } = await query(objectNonNullQuery, {
      variables: { id: "1" },
    });

    expect(testObjectNonNull).toEqual({ id: "1" });
  });
});
