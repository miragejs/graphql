import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "test/gql/schema.gql",
  generates: {
    "test/@types/": {
      preset: "client",
    },
  },
  hooks: {
    beforeDone: [
      "del-cli test/@types/fragment-masking.ts test/@types/gql.ts test/@types/index.ts",
    ],
  },
};

export default config;
