declare module "*.gql" {
  import { DocumentNode } from "graphql";
  const Schema: DocumentNode;
  export default Schema;
}
