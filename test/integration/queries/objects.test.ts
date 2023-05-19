import { afterEach, beforeEach, describe, expect, test } from "vitest";
import objectsQuery from "../../gql/queries/objects.gql";
import objectsQueryNonNull from "../../gql/queries/objects-non-null.gql";
import objectsQueryNestedNonNull from "../../gql/queries/objects-nested-non-null.gql";
import { query, startServer } from "../setup.js";

import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";
import type { TestObjectAttrs } from "../../@types/mirage.js";

let server: Server;

describe("Integration | queries | objects", function () {
  beforeEach(function () {
    server = startServer();
  });

  afterEach(function () {
    server.shutdown();
  });

  test("query for test objects", async function () {
    server.createList("test-object", 2);

    const { testObjects } = (await query(objectsQuery)) as {
      testObjects: TestObject[];
    };

    expect(testObjects).toEqual([{ id: "1" }, { id: "2" }]);
  });

  test("query for filtering test objects", async function () {
    server.create("test-object", { size: "M" } as TestObjectAttrs);

    const smallObject = server.create("test-object", {
      size: "S",
    } as TestObjectAttrs);

    const { testObjects } = (await query(objectsQuery, {
      variables: { size: "S" },
    })) as { testObjects: TestObject[] };

    expect(testObjects).toEqual([
      {
        id: smallObject.id,
      },
    ]);
  });

  describe("non-null", function () {
    test("query for test objects", async function () {
      server.createList("test-object", 2);

      const { testObjectsNonNull } = (await query(objectsQueryNonNull)) as {
        testObjectsNonNull: TestObject[];
      };

      expect(testObjectsNonNull).toEqual([{ id: "1" }, { id: "2" }]);
    });

    test("query for filtering test objects", async function () {
      server.create("test-object", { size: "M" } as TestObjectAttrs);

      const smallObject = server.create("test-object", {
        size: "S",
      } as TestObjectAttrs);

      const { testObjectsNonNull } = (await query(objectsQueryNonNull, {
        variables: { size: "S" },
      })) as { testObjectsNonNull: TestObject[] };

      expect(testObjectsNonNull).toEqual([
        {
          id: smallObject.id,
        },
      ]);
    });
  });

  describe("nested non-null", function () {
    test("query for test objects", async function () {
      server.createList("test-object", 2);

      const { testObjectsNestedNonNull } = (await query(
        objectsQueryNestedNonNull
      )) as { testObjectsNestedNonNull: TestObject[] };

      expect(testObjectsNestedNonNull).toEqual([{ id: "1" }, { id: "2" }]);
    });

    test("query for filtering test objects", async function () {
      server.create("test-object", { size: "M" } as TestObjectAttrs);

      const smallObject = server.create("test-object", {
        size: "S",
      } as TestObjectAttrs);

      const { testObjectsNestedNonNull } = (await query(
        objectsQueryNestedNonNull,
        {
          variables: { size: "S" },
        }
      )) as { testObjectsNestedNonNull: TestObject[] };

      expect(testObjectsNestedNonNull).toEqual([
        {
          id: smallObject.id,
        },
      ]);
    });
  });
});
