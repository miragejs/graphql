import { afterEach, beforeEach, describe, expect, test } from "vitest";
import interfaceQuery from "../../gql/queries/interface.gql";
import interfaceNonNullQuery from "../../gql/queries/interface-non-null.gql";
import interfaceInlineFragmentQuery from "../../gql/queries/interface-inline-fragment.gql";
import { query, startServer } from "../setup.js";

import type { Server } from "miragejs";
import type { TestInterface } from "../../@types/graphql.js";

import type {
  TestImplOneAttrs,
  TestImplTwoAttrs,
} from "../../@types/mirage.js";

let server: Server;

describe("Integration | queries | interface", function () {
  beforeEach(function () {
    server = startServer();

    server.create("test-impl-one", {
      description: "foo",
      label: "bar",
    } as TestImplOneAttrs);
    server.create("test-impl-two", { label: "baz" } as TestImplTwoAttrs);
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for interface (inline fragment)", async function () {
    const { testInterface } = (await query(interfaceInlineFragmentQuery, {
      variables: { id: "1" },
    })) as { testInterface: TestInterface };

    expect(testInterface).toEqual({
      id: "1",
      description: "foo",
      label: "bar",
    });
  });

  test("query for filtered interface", async function () {
    const { testInterface } = (await query(interfaceQuery, {
      variables: { label: "bar" },
    })) as { testInterface: TestInterface };

    expect(testInterface).toEqual({
      id: "1",
      label: "bar",
    });
  });

  test("query for filtered, non-null interface", async function () {
    const { testInterfaceNonNull } = (await query(interfaceNonNullQuery, {
      variables: { label: "baz" },
    })) as { testInterfaceNonNull: TestInterface };

    expect(testInterfaceNonNull).toEqual({
      id: "1",
      label: "baz",
    });
  });
});
