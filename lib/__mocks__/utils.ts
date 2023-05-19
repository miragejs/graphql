import graphQLSchema from "../../test/gql/schema.gql";
import { vi } from "vitest";

export const ensureExecutableGraphQLSchema = vi.fn(() => graphQLSchema);
