import { describe, expect, test } from "vitest";
import mirageGraphQLFieldResolver from "../../../lib/resolvers/mirage.js";
import { query, startServer } from "../setup.js";
import sortedObjectsQuery from "../../gql/queries/sorted-objects.gql";

import type { GraphQLResolveInfo } from "graphql";
import type { QueryArgs, ResolverContext } from "../../../lib/@types/index.js";
import type { TestObject } from "../../@types/graphql.js";
import type { TestObjectAttrs } from "../../@types/mirage.js";

const SORT_VALUES = { S: 0, M: 1, L: 2 };

describe("Integration | queries | sorted objects", function () {
  test("resolvers can be composed from the Mirage resolver", async function () {
    const server = startServer({
      resolvers: {
        Query: {
          testSortedObjects(
            source: any,
            args: QueryArgs,
            context: ResolverContext,
            info: GraphQLResolveInfo
          ) {
            const records = mirageGraphQLFieldResolver(
              source,
              args,
              context,
              info
            ) as TestObject[];

            return records.sort(function (a, b) {
              return SORT_VALUES[a.size] - SORT_VALUES[b.size];
            });
          },
        },
      },
    });

    server.create("test-object", { size: "L" } as TestObjectAttrs);
    server.create("test-object", { size: "M" } as TestObjectAttrs);
    server.create("test-object", { size: "S" } as TestObjectAttrs);

    const { testSortedObjects } = (await query(sortedObjectsQuery)) as {
      testSortedObjects: TestObject[];
    };

    expect(testSortedObjects).toEqual([
      { size: "S" },
      { size: "M" },
      { size: "L" },
    ]);
  });
});
