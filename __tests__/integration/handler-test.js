import contextQuery from "@tests/gql/queries/context.gql";
import { createGraphQLHandler } from "../../lib/handler";
import { createServer } from "miragejs";
import { graphQLSchema } from "@tests/gql/schema";
import { query } from "@tests/integration/setup";

let mirageSchema;
let request;

function startServer({ resolvers }) {
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
  it("resolver context gets the Mirage schema and request", async function () {
    expect.assertions(2);

    const server = startServer({
      resolvers: {
        Query: {
          testContext(_obj, _args, context) {
            expect(context.mirageSchema).toBe(mirageSchema);
            expect(context.request).toBe(request);

            return "foo";
          },
        },
      },
    });

    server.logging = false;

    await query(contextQuery);

    server.shutdown();
  });
});
