import { describe, expect, test } from "vitest";
import { mutate, startServer } from "../setup.js";
import unimplementedMutation from "../../gql/mutations/unimplemented.gql";

describe("Integration | mutations | unimplemented", function () {
  test("throws an error if no default mutation is found", async function () {
    startServer();

    await expect(() => mutate(unimplementedMutation)).rejects.toThrow(
      "Could not find a default resolver for unimplemented. Please supply a resolver for this mutation."
    );
  });
});
