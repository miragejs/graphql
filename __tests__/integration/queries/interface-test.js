import interfaceQuery from "@tests/gql/queries/interface.gql";
import interfaceNonNullQuery from "@tests/gql/queries/interface-non-null.gql";
import interfaceInlineFragmentQuery from "@tests/gql/queries/interface-inline-fragment.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | interface", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-impl-one", { description: "foo", label: "bar" });
    server.create("test-impl-two", { label: "baz" });
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for interface (inline fragment)", async function () {
    const { testInterface } = await query(interfaceInlineFragmentQuery, {
      variables: { id: "1" },
    });

    expect(testInterface).toEqual({
      id: "1",
      description: "foo",
      label: "bar",
    });
  });

  test("query for filtered interface", async function () {
    const { testInterface } = await query(interfaceQuery, {
      variables: { label: "bar" },
    });

    expect(testInterface).toEqual({
      id: "1",
      label: "bar",
    });
  });

  test("query for filtered, non-null interface", async function () {
    const { testInterfaceNonNull } = await query(interfaceNonNullQuery, {
      variables: { label: "baz" },
    });

    expect(testInterfaceNonNull).toEqual({
      id: "1",
      label: "baz",
    });
  });
});
