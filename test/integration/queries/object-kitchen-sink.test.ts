import { describe, expect, test } from "vitest";
import objectKitchenSinkQuery from "../../gql/queries/object-kitchen-sink.gql";
import { query, startServer } from "../setup.js";

import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";

import type {
  TestCategoryAttrs,
  TestImplOneAttrs,
  TestObjectAttrs,
  TestOptionAttrs,
  TestRelayNodeAttrs,
  TestUnionOneAttrs,
  TestUnionTwoAttrs,
} from "../../@types/mirage.js";

function seedUnassociatedRecords(server: Server) {
  server.createList("test-option", 2);
  server.create("test-union-one");
  server.create("test-union-two");
}

describe("Integration | queries | object", function () {
  test("query for test object", async function () {
    const server = startServer();
    const testCategory = server.create("test-category", {
      name: "cat",
    } as TestCategoryAttrs);

    const testImpl = server.create("test-impl-one", {
      label: "impl",
    } as TestImplOneAttrs);

    const testOptions = server.createList("test-option", 1, {
      name: "opt",
    } as TestOptionAttrs);

    const filterableTestOptions = [
      ...testOptions,
      server.create("test-option", { name: "Foo" } as TestOptionAttrs),
    ];

    const blueTestRelayNode = server.create("test-relay-node", {
      color: "blue",
    } as TestRelayNodeAttrs);

    const testRelayNodes = [
      blueTestRelayNode,
      ...server.createList("test-relay-node", 2),
    ];
    const testUnions = [
      server.create("test-union-one", { oneName: "foo" } as TestUnionOneAttrs),
      server.create("test-union-two", { twoName: "bar" } as TestUnionTwoAttrs),
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
      relayConnectionFilteredField: testRelayNodes,
      relayConnectionNonNullField: testRelayNodes,
      unionField: testUnions,
      unionNonNullField: testUnions,
      unionNestedNonNullField: testUnions,
      unionSingularField: testUnions[0],
    } as TestObjectAttrs);

    const { testObject } = (await query(objectKitchenSinkQuery, {
      variables: { id: "1" },
    })) as { testObject: TestObject };

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
      relayConnectionFilteredField: {
        edges: [
          {
            cursor: "VGVzdFJlbGF5Tm9kZTox",
            node: { id: "1", color: "blue" },
          },
        ],
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false,
          startCursor: "VGVzdFJlbGF5Tm9kZTox",
          endCursor: "VGVzdFJlbGF5Tm9kZTox",
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
