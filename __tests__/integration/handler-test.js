import { createGraphQLHandler } from "../../lib/handler";
import { createServer } from "miragejs";
import gql from "graphql-tag";
import { query } from "@tests/integration/setup";

let mirageSchema;
let request;

function startServer({ resolvers }) {
  const graphQLSchema = `
    type Foo { bar: String }
    type Query { foo: Foo }
  `;
  const server = createServer({
    routes() {
      this.post("/graphql", (_schema, _request) => {
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
          foo(_obj, _args, context) {
            expect(context.mirageSchema).toBe(mirageSchema);
            expect(context.request).toBe(request);

            return { bar: "foo" };
          },
        },
      },
    });

    server.logging = false;

    await query(
      gql`
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
