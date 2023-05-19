import { DEFAULT_URL, query } from "./setup.js";
import { createGraphQLHandler } from "../../lib/handler.js";
import { createServer } from "miragejs";
import { describe, expect, test } from "vitest";
import gql from "graphql-tag";

import type { DocumentNode } from "graphql";
import type MirageSchema from "miragejs/lib/orm/schema.js";
import type { Request } from "miragejs";
import type { QueryArgs, ResolverContext } from "../../lib/@types/index.js";

const parse = gql as unknown as (strings: TemplateStringsArray) => DocumentNode;

let mirageSchema: MirageSchema;
let request: Request;

function startServer({ resolvers = undefined } = {}) {
  const graphQLSchema = `
    type Foo { bar: String }
    type Query { foo: Foo }
  `;

  const server = createServer({
    routes() {
      this.post(DEFAULT_URL, (_schema, _request) => {
        mirageSchema = this.schema;
        request = _request;

        const handler = createGraphQLHandler(graphQLSchema, mirageSchema, {
          resolvers,
        });

        return handler(_schema, _request);
      });
    },
  });

  server.logging = false;

  return server;
}

describe("Integration | handler", function () {
  test("resolver context gets Mirage schema and request", async function () {
    expect.assertions(2);

    const server = startServer({
      resolvers: {
        Query: {
          foo(_source: any, _args: QueryArgs, context: ResolverContext) {
            expect(context.mirageSchema).toBe(mirageSchema);
            expect(context.request).toBe(request);

            return { bar: "foo" };
          },
        },
      },
    });

    server.logging = false;

    await query(
      parse`
        query {
          foo {
            bar
          }
        }
      `
    );

    server.shutdown();
  });
});
