import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { query, startServer } from "../setup.js";
import unionNonNullQuery from "../../gql/queries/union-non-null.gql";

import type { Server } from "miragejs";
import type { TestUnion } from "../../@types/graphql.js";

import type {
  TestUnionOneAttrs,
  TestUnionTwoAttrs,
} from "../../@types/mirage.js";

let server: Server;

describe("Integration | queries | union (non-null)", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-union-one", { oneName: "foo" } as TestUnionOneAttrs);
    server.create("test-union-two", { twoName: "bar" } as TestUnionTwoAttrs);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for non-null union type", async function () {
    const { testUnionNonNull } = (await query(unionNonNullQuery)) as {
      testUnionNonNull: TestUnion;
    };

    expect(testUnionNonNull).toEqual([{ oneName: "foo" }, { twoName: "bar" }]);
  });

  describe("filtering non-null", function () {
    test("by oneName arg", async function () {
      const { testUnionNonNull } = (await query(unionNonNullQuery, {
        variables: { oneName: "foo" },
      })) as { testUnionNonNull: TestUnion };

      expect(testUnionNonNull).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnionNonNull } = (await query(unionNonNullQuery, {
        variables: { twoName: "bar" },
      })) as { testUnionNonNull: TestUnion };

      expect(testUnionNonNull).toEqual([{ twoName: "bar" }]);
    });
  });
});
