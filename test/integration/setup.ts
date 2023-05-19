import { Server } from "miragejs";
import { createGraphQLHandler } from "../../lib/handler.js";
import graphQLSchema from "../gql/schema.gql";
import { request } from "graphql-request";

import type { DocumentNode } from "graphql";

type QueryOptions = {
  url?: string;
  variables?: { [varName: string]: any };
};

export const HOST = "http://localhost:12345";
export const DEFAULT_URL = `${HOST}/graphql`;

export async function query(
  queryDocument: DocumentNode,
  queryOptions: QueryOptions = {}
) {
  const { url = DEFAULT_URL, variables } = queryOptions;
  const {
    loc: {
      source: { body },
    },
  } = queryDocument;

  return request(url, body, variables);
}

export const mutate = query;

export function startServer({ resolvers = undefined } = {}) {
  const server = new Server({
    routes() {
      const testGraphQLHandler = createGraphQLHandler(
        graphQLSchema,
        this.schema,
        { resolvers }
      );

      const scalarTestGraphQLHandler = createGraphQLHandler(
        graphQLSchema,
        this.schema,
        {
          context: { foo: "foo" },
          resolvers: {
            Query: {
              testContext: (_source, _args, context) => context.foo,
              testScalarOptionalResolve: () => "foo",
            },
          },
          root: {
            testScalar: "foo",
            testScalarNonNull: "foo",
          },
        }
      );

      this.post(`${HOST}/graphql-scalars`, scalarTestGraphQLHandler);
      this.post(DEFAULT_URL, testGraphQLHandler);
    },
  });

  server.logging = false;

  return server;
}
