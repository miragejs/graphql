import unionNonNullQuery from "@tests/gql/queries/union-non-null.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | union (non-null)", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-union-one", { oneName: "foo" });
    server.create("test-union-two", { twoName: "bar" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for non-null union type", async function () {
    const { testUnionNonNull } = await query(unionNonNullQuery);

    expect(testUnionNonNull).toEqual([{ oneName: "foo" }, { twoName: "bar" }]);
  });

  describe("filtering non-null", function () {
    test("by oneName arg", async function () {
      const { testUnionNonNull } = await query(unionNonNullQuery, {
        variables: { oneName: "foo" },
      });

      expect(testUnionNonNull).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnionNonNull } = await query(unionNonNullQuery, {
        variables: { twoName: "bar" },
      });

      expect(testUnionNonNull).toEqual([{ twoName: "bar" }]);
    });
  });
});
