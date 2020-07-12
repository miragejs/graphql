import relayConnectionQuery from "@tests/gql/queries/relay-connection.gql";
import { query, startServer } from "@tests/integration/setup";

let server;

describe("Integration | queries | Relay connection", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-relay-node", { color: "blue" });
    server.createList("test-relay-node", 2);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for Relay connection", async function () {
    const { testRelayConnection } = await query(relayConnectionQuery);

    expect(testRelayConnection).toEqual({
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

  describe("filtering", function () {
    test("query for Relay connection by color", async function () {
      const { testRelayConnection } = await query(relayConnectionQuery, {
        variables: { color: "blue" },
      });

      expect(testRelayConnection).toEqual({
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
      const { testRelayConnection } = await query(relayConnectionQuery, {
        variables: { first: 1, after: "VGVzdFJlbGF5Tm9kZTox" },
      });

      expect(testRelayConnection).toEqual({
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
      const { testRelayConnection } = await query(relayConnectionQuery, {
        variables: { last: 1, before: "VGVzdFJlbGF5Tm9kZToz" },
      });

      expect(testRelayConnection).toEqual({
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
