import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { query, startServer } from "../setup.js";
import unionQuery from "../../gql/queries/union.gql";

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

  test("query for union type", async function () {
    const { testUnion } = (await query(unionQuery)) as { testUnion: TestUnion };

    expect(testUnion).toEqual([{ oneName: "foo" }, { twoName: "bar" }]);
  });

  describe("filtering", function () {
    test("by oneName arg", async function () {
      const { testUnion } = (await query(unionQuery, {
        variables: { oneName: "foo" },
      })) as { testUnion: TestUnion };

      expect(testUnion).toEqual([{ oneName: "foo" }]);
    });

    test("by twoName arg", async function () {
      const { testUnion } = (await query(unionQuery, {
        variables: { twoName: "bar" },
      })) as { testUnion: TestUnion };

      expect(testUnion).toEqual([{ twoName: "bar" }]);
    });
  });
});
