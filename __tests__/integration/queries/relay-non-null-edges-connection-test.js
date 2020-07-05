import relayNonNullEdgesConnectionQuery from "@tests/gql/queries/relay-non-null-edges-connection.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | Relay connection (non-null edges)", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-relay-node", { color: "blue" });
    server.createList("test-relay-node", 2);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for Relay connection with non-null edges", async function () {
    const { testNonNullEdgesRelayConnection } = await query(
      relayNonNullEdgesConnectionQuery
    );

    expect(testNonNullEdgesRelayConnection).toEqual({
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
      pageInfo: {
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: "VGVzdFJlbGF5Tm9kZTox",
        endCursor: "VGVzdFJlbGF5Tm9kZToz",
      },
    });
  });

  describe("filtering non-null edges", function () {
    test("query for Relay connection by color", async function () {
      const { testNonNullEdgesRelayConnection } = await query(
        relayNonNullEdgesConnectionQuery,
        {
          variables: { color: "blue" },
        }
      );

      expect(testNonNullEdgesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZTox",
            node: { id: "1" },
          },
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "VGVzdFJlbGF5Tm9kZTox",
          endCursor: "VGVzdFJlbGF5Tm9kZTox",
        },
      });
    });

    test("query for Relay connection by first/after", async function () {
      const { testNonNullEdgesRelayConnection } = await query(
        relayNonNullEdgesConnectionQuery,
        {
          variables: { first: 1, after: "VGVzdFJlbGF5Tm9kZTox" },
        }
      );

      expect(testNonNullEdgesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZToy",
            node: { id: "2" },
          },
        ],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: "VGVzdFJlbGF5Tm9kZToy",
          endCursor: "VGVzdFJlbGF5Tm9kZToy",
        },
      });
    });

    test("query for Relay connection by last/before", async function () {
      const { testNonNullEdgesRelayConnection } = await query(
        relayNonNullEdgesConnectionQuery,
        {
          variables: { last: 1, before: "VGVzdFJlbGF5Tm9kZToz" },
        }
      );

      expect(testNonNullEdgesRelayConnection).toEqual({
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZToy",
            node: { id: "2" },
          },
        ],
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
