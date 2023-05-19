import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { query, startServer } from "../setup.js";
import unionNestedNonNullQuery from "../../gql/queries/union-nested-non-null.gql";

import type { Server } from "miragejs";
import type { TestUnion } from "../../@types/graphql.js";

import type {
  TestUnionOneAttrs,
  TestUnionTwoAttrs,
} from "../../@types/mirage.js";

let server: Server;

describe("Integration | queries | union", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-union-one", { oneName: "foo" } as TestUnionOneAttrs);
    server.create("test-union-two", { twoName: "bar" } as TestUnionTwoAttrs);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for nested non-null union type", async function () {
    const { testUnionNestedNonNull } = (await query(
      unionNestedNonNullQuery
    )) as { testUnionNestedNonNull: TestUnion };

    expect(testUnionNestedNonNull).toEqual([
      { oneName: "foo" },
      { twoName: "bar" },
    ]);
  });

  describe("filtering nested non-null", function () {
    test("by oneName arg", async function () {
      const { testUnionNestedNonNull } = (await query(unionNestedNonNullQuery, {
        variables: { oneName: "foo" },
      })) as { testUnionNestedNonNull: TestUnion };

      expect(testUnionNestedNonNull).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnionNestedNonNull } = (await query(unionNestedNonNullQuery, {
        variables: { twoName: "bar" },
      })) as { testUnionNestedNonNull: TestUnion };

      expect(testUnionNestedNonNull).toEqual([{ twoName: "bar" }]);
    });
  });
});
