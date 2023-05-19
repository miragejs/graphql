import { describe, expect, test } from "vitest";
import { mutate, startServer } from "../setup.js";
import optionalTestObjectMutation from "../../gql/mutations/optional.gql";

import type { ResolverContext } from "../../../lib/@types/index.js";
import type { TestObject } from "../../@types/graphql.js";
import type { TestObjectAttrs } from "../../@types/mirage.js";

describe("Integration | mutations | optional", function () {
  test("can run optional mutations", async function () {
    const server = startServer({
      resolvers: {
        Mutation: {
          optionallyMutateTestObject(
            _source: any,
            { id, input },
            context: ResolverContext
          ) {
            return context.mirageSchema.db.testObjects.update(id, input);
          },
        },
      },
    });

    server.create("test-object", { size: "S" } as TestObjectAttrs);

    const { optionallyMutateTestObject } = (await mutate(
      optionalTestObjectMutation,
      {
        variables: {
          id: "1",
          input: {
            size: "M",
          },
        },
      }
    )) as { optionallyMutateTestObject: TestObject };

    expect(optionallyMutateTestObject).toEqual({ id: "1", size: "M" });
  });
});
