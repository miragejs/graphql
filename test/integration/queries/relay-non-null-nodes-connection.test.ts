import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { query, startServer } from "../setup.js";
import relayNonNullNodesConnectionQuery from "../../gql/queries/relay-non-null-nodes-connection.gql";

import type { Server } from "miragejs";
import type { TestRelayConnection } from "../../@types/graphql.js";
import type { TestRelayNodeAttrs } from "../../@types/mirage.js";

let server: Server;

describe("Integration | queries | Relay connection (non-null edges and nodes)", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-relay-node", { color: "blue" } as TestRelayNodeAttrs);
    server.createList("test-relay-node", 2);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for Relay connection with non-null nodes", async function () {
    const { testNonNullNodesRelayConnection } = (await query(
      relayNonNullNodesConnectionQuery
    )) as { testNonNullNodesRelayConnection: TestRelayConnection };

    expect(testNonNullNodesRelayConnection).toEqual({
      edges: [
        {
          cursor: "VGVzdFJlbGF5Tm9kZTox",
          node: { id: "1" },
        },
        {
          cursor: "VGVzdFJlbGF5Tm9kZToy",
          node: { id: "2" },
        },
        {
          cursor: "VGVzdFJlbGF5Tm9kZToz",
          node: { id: "3" },
        },
      ],
      totalCount: 3,
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: "VGVzdFJlbGF5Tm9kZTox",
        endCursor: "VGVzdFJlbGF5Tm9kZToz",
      },
    });
  });

  describe("filtering non-null nodes", function () {
    test("query for Relay connection by color", async function () {
      const { testNonNullNodesRelayConnection } = (await query(
        relayNonNullNodesConnectionQuery,
        {
          variables: { color: "blue" },
        }
      )) as { testNonNullNodesRelayConnection: TestRelayConnection };

      expect(testNonNullNodesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZTox",
            node: { id: "1" },
          },
        ],
        totalCount: 1,
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "VGVzdFJlbGF5Tm9kZTox",
          endCursor: "VGVzdFJlbGF5Tm9kZTox",
        },
      });
    });

    test("query for Relay connection by first/after", async function () {
      const { testNonNullNodesRelayConnection } = (await query(
        relayNonNullNodesConnectionQuery,
        {
          variables: { first: 1, after: "VGVzdFJlbGF5Tm9kZTox" },
        }
      )) as { testNonNullNodesRelayConnection: TestRelayConnection };

      expect(testNonNullNodesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZToy",
            node: { id: "2" },
          },
        ],
        totalCount: 3,
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: "VGVzdFJlbGF5Tm9kZToy",
          endCursor: "VGVzdFJlbGF5Tm9kZToy",
        },
      });
    });

    test("query for Relay connection by last/before", async function () {
      const { testNonNullNodesRelayConnection } = (await query(
        relayNonNullNodesConnectionQuery,
        {
          variables: { last: 1, before: "VGVzdFJlbGF5Tm9kZToz" },
        }
      )) as { testNonNullNodesRelayConnection: TestRelayConnection };

      expect(testNonNullNodesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZToy",
            node: { id: "2" },
          },
        ],
        totalCount: 3,
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: "VGVzdFJlbGF5Tm9kZToy",
          endCursor: "VGVzdFJlbGF5Tm9kZToy",
        },
      });
    });
  });
});
