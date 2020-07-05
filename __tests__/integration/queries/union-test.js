import unionQuery from "@tests/gql/queries/union.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | union", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-union-one", { oneName: "foo" });
    server.create("test-union-two", { twoName: "bar" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for union type", async function () {
    const { testUnion } = await query(unionQuery);

    expect(testUnion).toEqual([{ oneName: "foo" }, { twoName: "bar" }]);
  });

  describe("filtering", function () {
    test("by oneName arg", async function () {
      const { testUnion } = await query(unionQuery, {
        variables: { oneName: "foo" },
      });

      expect(testUnion).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnion } = await query(unionQuery, {
        variables: { twoName: "bar" },
      });

      expect(testUnion).toEqual([{ twoName: "bar" }]);
    });
  });
});
