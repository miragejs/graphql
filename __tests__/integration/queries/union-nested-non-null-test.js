import unionNestedNonNullQuery from "@tests/gql/queries/union-nested-non-null.gql";
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

  test("query for nested non-null union type", async function () {
    const { testUnionNestedNonNull } = await query(unionNestedNonNullQuery);

    expect(testUnionNestedNonNull).toEqual([
      { oneName: "foo" },
      { twoName: "bar" },
    ]);
  });

  describe("filtering nested non-null", function () {
    test("by oneName arg", async function () {
      const { testUnionNestedNonNull } = await query(unionNestedNonNullQuery, {
        variables: { oneName: "foo" },
      });

      expect(testUnionNestedNonNull).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnionNestedNonNull } = await query(unionNestedNonNullQuery, {
        variables: { twoName: "bar" },
      });

      expect(testUnionNestedNonNull).toEqual([{ twoName: "bar" }]);
    });
  });
});
