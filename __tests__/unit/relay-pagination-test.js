import {
  getEdges,
  getPageInfo,
  getRelayArgs,
  isRelayConnectionType,
  isRelayEdgeType,
  isRelayType,
} from "@lib/relay-pagination";

describe("Unit | Relay pagination", function () {
  const connectionType = {
    name: "RelayConnection",
    getFields: () => ({ edges: [] }),
  };
  const edgeType = {
    name: "RelayEdge",
    getFields: () => ({ node: {} }),
  };

  describe("is Relay type", function () {
    test("if Relay connection", function () {
      expect(isRelayType(connectionType)).toBe(true);
    });

    test("if Relay edge type", function () {
      expect(isRelayType(edgeType)).toBe(true);
    });

    test("if Relay page info type", function () {
      const pageInfoType = {
        name: "PageInfo",
        getFields: () => ({ startCursor: "" }),
      };

      expect(isRelayType(pageInfoType)).toBe(true);
    });

    test("if non Relay type", function () {
      const nonRelayType = { name: "Foo" };
      const otherNonRelayType = { name: "Connection", getFields: () => ({}) };

      expect(isRelayType(nonRelayType)).toBe(false);
      expect(isRelayType(otherNonRelayType)).toBe(false);
    });
  });

  it("can determine if a type is a Relay connection", function () {
    expect(isRelayConnectionType(connectionType)).toBe(true);
    expect(isRelayConnectionType(edgeType)).toBe(false);
  });

  it("can determine if a type is a Relay edge", function () {
    expect(isRelayEdgeType(edgeType)).toBe(true);
    expect(isRelayConnectionType(edgeType)).toBe(false);
  });

  it("can separate Relay pagination arguments", function () {
    const args = {
      first: 10,
      last: 10,
      after: "12345",
      before: "54321",
      foo: "bar",
    };
    const { relayArgs, nonRelayArgs } = getRelayArgs(args);

    expect(nonRelayArgs).toEqual({ foo: "bar" });
    expect(relayArgs).toEqual({
      first: 10,
      last: 10,
      after: "12345",
      before: "54321",
    });
  });

  describe("page info", function () {
    test("when previous page", function () {
      const records = [{ id: 1 }, { id: 12 }];
      const edges = [
        { cursor: 11, node: { id: 11 } },
        { cursor: 12, node: { id: 12 } },
      ];

      expect(getPageInfo(records, edges)).toEqual({
        hasPreviousPage: true,
        hasNextPage: false,
        startCursor: 11,
        endCursor: 12,
      });
    });

    test("when next page", function () {
      const records = [{ id: 1 }, { id: 3 }];
      const edges = [
        { cursor: 1, node: { id: 1 } },
        { cursor: 2, node: { id: 2 } },
      ];

      expect(getPageInfo(records, edges)).toEqual({
        hasPreviousPage: false,
        hasNextPage: true,
        startCursor: 1,
        endCursor: 2,
      });
    });

    test("when both previous and next page", function () {
      const records = [{ id: 1 }, { id: 4 }];
      const edges = [
        { cursor: 2, node: { id: 2 } },
        { cursor: 3, node: { id: 3 } },
      ];

      expect(getPageInfo(records, edges)).toEqual({
        hasPreviousPage: true,
        hasNextPage: true,
        startCursor: 2,
        endCursor: 3,
      });
    });

    test("when neither previous or next page", function () {
      const records = [{ id: 1 }, { id: 2 }];
      const edges = [
        { cursor: 1, node: { id: 1 } },
        { cursor: 2, node: { id: 2 } },
      ];

      expect(getPageInfo(records, edges)).toEqual({
        hasPreviousPage: false,
        hasNextPage: false,
        startCursor: 1,
        endCursor: 2,
      });
    });
  });

  describe("set edges of a connection", function () {
    const encode = (id) => id;

    function createRecords(n) {
      let i = 1;
      const records = [];

      while (i <= n) {
        records.push({ id: `${i}`, foo: `bar${i}` });
        i++;
      }

      return records;
    }

    test("with no args", function () {
      const args = {};
      const records = createRecords(1);

      expect(getEdges(records, args, "Foo", encode)).toEqual([
        {
          cursor: "Foo:1",
          node: { id: "1", foo: "bar1" },
        },
      ]);
    });

    test("with first/after args", function () {
      const args = { first: 2, after: "Foo:2" };
      const records = createRecords(5);

      expect(getEdges(records, args, "Foo", encode)).toEqual([
        {
          cursor: "Foo:3",
          node: { id: "3", foo: "bar3" },
        },
        {
          cursor: "Foo:4",
          node: { id: "4", foo: "bar4" },
        },
      ]);
    });

    test("with last/before args", function () {
      const args = { last: 2, before: "Foo:4" };
      const records = createRecords(5);

      expect(getEdges(records, args, "Foo", encode)).toEqual([
        {
          cursor: "Foo:2",
          node: { id: "2", foo: "bar2" },
        },
        {
          cursor: "Foo:3",
          node: { id: "3", foo: "bar3" },
        },
      ]);
    });

    test("with first/before args", function () {
      const args = { first: 3, before: "Foo:3" };
      const records = createRecords(5);

      expect(getEdges(records, args, "Foo", encode)).toEqual([
        {
          cursor: "Foo:1",
          node: { id: "1", foo: "bar1" },
        },
        {
          cursor: "Foo:2",
          node: { id: "2", foo: "bar2" },
        },
      ]);
    });

    test("with last/after args", function () {
      const args = { last: 3, after: "Foo:3" };
      const records = createRecords(5);

      expect(getEdges(records, args, "Foo", encode)).toEqual([
        {
          cursor: "Foo:4",
          node: { id: "4", foo: "bar4" },
        },
        {
          cursor: "Foo:5",
          node: { id: "5", foo: "bar5" },
        },
      ]);
    });
  });
});
