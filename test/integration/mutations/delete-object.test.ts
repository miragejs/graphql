import { afterEach, describe, expect, test } from "vitest";
import deleteTestObjectMutation from "../../gql/mutations/delete.gql";
import deleteTestObjectAltMutation from "../../gql/mutations/delete-alt.gql";
import { mutate, startServer } from "../setup.js";

import type { QueryArgs, ResolverContext } from "../../../lib/@types/index.js";
import type { Server } from "miragejs";
import type { TestObject } from "../../@types/graphql.js";
import type { TestObjectAttrs } from "../../@types/mirage.js";

let server: Server;

describe("Integration | mutations | delete", function () {
  afterEach(function () {
    server.shutdown();
  });

  test("can delete a test object", async function () {
    server = startServer();

    server.create("test-object", { size: "M" } as TestObjectAttrs);

    const { deleteTestObject } = (await mutate(deleteTestObjectMutation, {
      variables: { id: "1" },
    })) as { deleteTestObject: TestObject };

    const record = server.schema.first("testObject");

    expect(deleteTestObject).toEqual({ id: "1", size: "M" });
    expect(record).toBeNull();
  });

  test("can delete a test object and return a boolean value", async function () {
    server = startServer({
      resolvers: {
        Mutation: {
          deleteTestObjectAlt(
            _source: any,
            args: QueryArgs,
            context: ResolverContext
          ) {
            context.mirageSchema.db.testObjects.remove(args.id);

            return true;
          },
        },
      },
    });

    server.create("test-object", { size: "M" } as TestObjectAttrs);

    const { deleteTestObjectAlt } = (await mutate(deleteTestObjectAltMutation, {
      variables: { id: "1" },
    })) as { deleteTestObjectAlt: TestObject };

    const record = server.schema.first("testObject");

    expect(deleteTestObjectAlt).toEqual(true);
    expect(record).toBeNull();
  });
});
