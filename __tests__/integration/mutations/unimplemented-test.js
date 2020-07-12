import unimplementedMutation from "@tests/gql/mutations/unimplemented.gql";
import { mutate, startServer } from "@tests/integration/setup";

describe("Integration | mutations | unimplemented", function () {
  it("throws an error if no default mutation is found", async function () {
    startServer();

    await expect(() => mutate(unimplementedMutation)).rejects.toThrow(
      "Could not find a default resolver for unimplemented. Please supply a resolver for this mutation."
    );
  });
});
