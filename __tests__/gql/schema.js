import gql from "graphql-tag";
import schema from "./schema.gql";
import { buildASTSchema } from "graphql";

export const graphQLSchemaAST = gql`
  ${schema}
`;
export const graphQLSchema = buildASTSchema(graphQLSchemaAST);
