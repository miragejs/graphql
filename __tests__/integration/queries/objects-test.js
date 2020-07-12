import objectsQuery from "@tests/gql/queries/objects.gql";
import objectsQueryNonNull from "@tests/gql/queries/objects-non-null.gql";
import objectsQueryNestedNonNull from "@tests/gql/queries/objects-nested-non-null.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | objects", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for test objects", async function () {
    server.createList("test-object", 2);

    const { testObjects } = await query(objectsQuery);

    expect(testObjects).toEqual([{ id: "1" }, { id: "2" }]);
  });

  test("query for filtering test objects", async function () {
    server.create("test-object", { size: "M" });

    const smallObject = server.create("test-object", { size: "S" });
    const { testObjects } = await query(objectsQuery, {
      variables: { size: "S" },
    });

    expect(testObjects).toEqual([
      {
        id: smallObject.id,
      },
    ]);
  });

  describe("non-null", function () {
    test("query for test objects", async function () {
      server.createList("test-object", 2);

      const { testObjectsNonNull } = await query(objectsQueryNonNull);

      expect(testObjectsNonNull).toEqual([{ id: "1" }, { id: "2" }]);
    });

    test("query for filtering test objects", async function () {
      server.create("test-object", { size: "M" });

      const smallObject = server.create("test-object", { size: "S" });
      const { testObjectsNonNull } = await query(objectsQueryNonNull, {
        variables: { size: "S" },
      });

      expect(testObjectsNonNull).toEqual([
        {
          id: smallObject.id,
        },
      ]);
    });
  });

  describe("nested non-null", function () {
    test("query for test objects", async function () {
      server.createList("test-object", 2);

      const { testObjectsNestedNonNull } = await query(
        objectsQueryNestedNonNull
      );

      expect(testObjectsNestedNonNull).toEqual([{ id: "1" }, { id: "2" }]);
    });

    test("query for filtering test objects", async function () {
      server.create("test-object", { size: "M" });

      const smallObject = server.create("test-object", { size: "S" });
      const { testObjectsNestedNonNull } = await query(
        objectsQueryNestedNonNull,
        {
          variables: { size: "S" },
        }
      );

      expect(testObjectsNestedNonNull).toEqual([
        {
          id: smallObject.id,
        },
      ]);
    });
  });
});
