import deleteTestObjectMutation from "@tests/gql/mutations/delete.gql";
import deleteTestObjectAltMutation from "@tests/gql/mutations/delete-alt.gql";
import { mutate, startServer } from "@tests/integration/setup";

let server;

describe("Integration | mutations | delete", function () {
  afterEach(function() {
    server.shutdown();
  });

  it("can delete a test object", async function () {
    server = startServer();

    server.create("test-object", { size: "M" });

    const { deleteTestObject } = await mutate(deleteTestObjectMutation, {
      variables: { id: "1" },
    });
    const record = server.schema.testObjects.first();

    expect(deleteTestObject).toEqual({ id: "1", size: "M" });
    expect(record).toBeNull();
  });

  it("can delete a test object and return a boolean value", async function () {
    server = startServer({
      resolvers: {
        Mutation: {
          deleteTestObjectAlt(_obj, args, context) {
            context.mirageSchema.db.testObjects.remove(args.id)

            return true
          }
        }
      }
    });

    server.create("test-object", { size: "M" });

    const { deleteTestObjectAlt } = await mutate(deleteTestObjectAltMutation, {
      variables: { id: "1" },
    });
    const record = server.schema.testObjects.first();

    expect(deleteTestObjectAlt).toEqual(true);
    expect(record).toBeNull();
  });
});
