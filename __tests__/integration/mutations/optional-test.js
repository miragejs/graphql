import optionalTestObjectMutation from "@tests/gql/mutations/optional.gql";
import { mutate, startServer } from "@tests/integration/setup";

describe("Integration | mutations | optional", function () {
  it("can run optional mutations", async function () {
    const server = startServer({
      resolvers: {
        Mutation: {
          optionallyMutateTestObject(_obj, { id, input }, context) {
            return context.mirageSchema.db.testObjects.update(id, input);
          },
        },
      },
    });

    server.create("test-object", { size: "S" });

    const { optionallyMutateTestObject } = await mutate(
      optionalTestObjectMutation,
      {
        variables: {
          id: "1",
          input: {
            size: "M",
          },
        },
      }
    );

    expect(optionallyMutateTestObject).toEqual({ id: "1", size: "M" });
  });
});
