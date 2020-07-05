import mirageGraphQLFieldResolver from "@lib/resolvers/mirage";
import sortedObjectsQuery from "@tests/gql/queries/sorted-objects.gql";
import { query, startServer } from "@tests/integration/setup";

const SORT_VALUES = { S: 0, M: 1, L: 2 };

describe("Integration | queries | sorted objects", function () {
  test("resolvers can be composed from the Mirage resolver", async function () {
    const server = startServer({
      resolvers: {
        Query: {
          testSortedObjects() {
            const records = mirageGraphQLFieldResolver(...arguments);

            return records.sort(function (a, b) {
              return SORT_VALUES[a.size] - SORT_VALUES[b.size];
            });
          },
        },
      },
    });

    server.create("test-object", { size: "L" });
    server.create("test-object", { size: "M" });
    server.create("test-object", { size: "S" });

    const { testSortedObjects } = await query(sortedObjectsQuery);

    expect(testSortedObjects).toEqual([
      { size: "S" },
      { size: "M" },
      { size: "L" },
    ]);
  });
});
