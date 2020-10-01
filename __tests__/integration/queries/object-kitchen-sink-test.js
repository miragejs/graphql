import objectKitchenSinkQuery from "@tests/gql/queries/object-kitchen-sink.gql";
import { query, startServer } from "@tests/integration/setup";

function seedUnassociatedRecords(server) {
  server.createList("test-option", 2);
  server.create("test-union-one");
  server.create("test-union-two");
}

describe("Integration | queries | object", function () {
  test("query for test object", async function () {
    const server = startServer();
    const testCategory = server.create("test-category", { name: "cat" });
    const testImpl = server.create("test-impl-one", { label: "impl" });
    const testOptions = server.createList("test-option", 1, { name: "opt" });
    const filterableTestOptions = [
      ...testOptions,
      server.create("test-option", { name: "Foo" }),
    ];
    const testRelayNodes = server.createList("test-relay-node", 3);
    const testUnions = [
      server.create("test-union-one", { oneName: "foo" }),
      server.create("test-union-two", { twoName: "bar" }),
    ];

    seedUnassociatedRecords(server);

    server.create("test-object", {
      size: "XL",
      sizeNonNull: "XL",
      belongsToField: testCategory,
      belongsToNonNullField: testCategory,
      hasManyField: testOptions,
      hasManyFilteredField: filterableTestOptions,
      hasManyNonNullField: testOptions,
      hasManyNestedNonNullField: testOptions,
      interfaceField: testImpl,
      interfaceNonNullField: testImpl,
      relayConnectionField: testRelayNodes,
      relayConnectionNonNullField: testRelayNodes,
      unionField: testUnions,
      unionNonNullField: testUnions,
      unionNestedNonNullField: testUnions,
      unionSingularField: testUnions[0],
    });

    const { testObject } = await query(objectKitchenSinkQuery, {
      variables: { id: "1" },
    });

    expect(testObject).toEqual({
      id: "1",
      size: "XL",
      sizeNonNull: "XL",
      belongsToField: { id: "1", name: "cat" },
      belongsToNonNullField: { id: "1", name: "cat" },
      hasManyField: [{ id: "1", name: "opt" }],
      hasManyFilteredField: [{ id: "2", name: "Foo" }],
      hasManyNonNullField: [{ id: "1", name: "opt" }],
      hasManyNestedNonNullField: [{ id: "1", name: "opt" }],
      interfaceField: { id: "1", label: "impl" },
      interfaceNonNullField: { id: "1", label: "impl" },
      relayConnectionField: {
        edges: [{ cursor: "VGVzdFJlbGF5Tm9kZToy", node: { id: "2" } }],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: "VGVzdFJlbGF5Tm9kZToy",
          endCursor: "VGVzdFJlbGF5Tm9kZToy",
        },
      },
      relayConnectionNonNullField: {
        edges: [{ cursor: "VGVzdFJlbGF5Tm9kZToy", node: { id: "2" } }],
        pageInfo: {
          hasPreviousPage: true,
          hasNextPage: true,
          startCursor: "VGVzdFJlbGF5Tm9kZToy",
          endCursor: "VGVzdFJlbGF5Tm9kZToy",
        },
      },
      unionField: [
        { id: "1", oneName: "foo" },
        { id: "1", twoName: "bar" },
      ],
      unionNonNullField: [{ id: "1", oneName: "foo" }],
      unionNestedNonNullField: [{ id: "1", twoName: "bar" }],
      unionSingularField: { id: "1", oneName: "foo" },
    });
  });
});
