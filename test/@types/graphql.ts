export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};

export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};

export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Mutation = {
  __typename?: "Mutation";
  createTestObject?: Maybe<TestObject>;
  createTestObjectNonNull?: Maybe<TestObject>;
  deleteTestObject?: Maybe<TestObject>;
  deleteTestObjectAlt?: Maybe<Scalars["Boolean"]>;
  optionallyMutateTestObject?: Maybe<TestObject>;
  unimplemented?: Maybe<TestObject>;
  updateTestObject?: Maybe<TestObject>;
  updateTestObjectNonNull?: Maybe<TestObject>;
};

export type MutationCreateTestObjectArgs = {
  input?: InputMaybe<TestObjectInput>;
};

export type MutationCreateTestObjectNonNullArgs = {
  input: TestObjectInput;
};

export type MutationDeleteTestObjectArgs = {
  id: Scalars["ID"];
};

export type MutationDeleteTestObjectAltArgs = {
  id: Scalars["ID"];
};

export type MutationOptionallyMutateTestObjectArgs = {
  id: Scalars["ID"];
  input: TestObjectInput;
};

export type MutationUpdateTestObjectArgs = {
  id: Scalars["ID"];
  input?: InputMaybe<TestObjectInput>;
};

export type MutationUpdateTestObjectNonNullArgs = {
  id: Scalars["ID"];
  input: TestObjectInput;
};

export type PageInfo = {
  __typename?: "PageInfo";
  endCursor?: Maybe<Scalars["String"]>;
  hasNextPage?: Maybe<Scalars["Boolean"]>;
  hasPreviousPage?: Maybe<Scalars["Boolean"]>;
  startCursor?: Maybe<Scalars["String"]>;
};

export type Query = {
  __typename?: "Query";
  testContext?: Maybe<Scalars["String"]>;
  testInterface?: Maybe<TestInterface>;
  testInterfaceNonNull: TestInterface;
  testInterfaceOptional?: Maybe<TestInterface>;
  testNonNullEdgesRelayConnection?: Maybe<TestNonNullEdgesRelayConnection>;
  testNonNullNodesRelayConnection?: Maybe<TestNonNullNodesRelayConnection>;
  testObject?: Maybe<TestObject>;
  testObjectNonNull: TestObject;
  testObjects?: Maybe<Array<Maybe<TestObject>>>;
  testObjectsNestedNonNull: Array<TestObject>;
  testObjectsNonNull: Array<Maybe<TestObject>>;
  testRelayConnection?: Maybe<TestRelayConnection>;
  testScalar?: Maybe<Scalars["String"]>;
  testScalarNonNull: Scalars["String"];
  testScalarOptionalResolve?: Maybe<Scalars["String"]>;
  testSortedObjects?: Maybe<Array<Maybe<TestObject>>>;
  testUnion?: Maybe<Array<Maybe<TestUnion>>>;
  testUnionNestedNonNull: Array<TestUnion>;
  testUnionNonNull: Array<Maybe<TestUnion>>;
  testUnionSingular?: Maybe<TestUnion>;
};

export type QueryTestInterfaceArgs = {
  id?: InputMaybe<Scalars["ID"]>;
  label?: InputMaybe<Scalars["String"]>;
};

export type QueryTestInterfaceNonNullArgs = {
  id?: InputMaybe<Scalars["ID"]>;
  label?: InputMaybe<Scalars["String"]>;
};

export type QueryTestInterfaceOptionalArgs = {
  id: Scalars["ID"];
};

export type QueryTestNonNullEdgesRelayConnectionArgs = {
  after?: InputMaybe<Scalars["String"]>;
  before?: InputMaybe<Scalars["String"]>;
  color?: InputMaybe<Scalars["String"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type QueryTestNonNullNodesRelayConnectionArgs = {
  after?: InputMaybe<Scalars["String"]>;
  before?: InputMaybe<Scalars["String"]>;
  color?: InputMaybe<Scalars["String"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type QueryTestObjectArgs = {
  id: Scalars["ID"];
};

export type QueryTestObjectNonNullArgs = {
  id: Scalars["ID"];
};

export type QueryTestObjectsArgs = {
  size?: InputMaybe<Scalars["String"]>;
};

export type QueryTestObjectsNestedNonNullArgs = {
  size?: InputMaybe<Scalars["String"]>;
};

export type QueryTestObjectsNonNullArgs = {
  size?: InputMaybe<Scalars["String"]>;
};

export type QueryTestRelayConnectionArgs = {
  after?: InputMaybe<Scalars["String"]>;
  before?: InputMaybe<Scalars["String"]>;
  color?: InputMaybe<Scalars["String"]>;
  first?: InputMaybe<Scalars["Int"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type QueryTestUnionArgs = {
  oneName?: InputMaybe<Scalars["String"]>;
  twoName?: InputMaybe<Scalars["String"]>;
};

export type QueryTestUnionNestedNonNullArgs = {
  oneName?: InputMaybe<Scalars["String"]>;
  twoName?: InputMaybe<Scalars["String"]>;
};

export type QueryTestUnionNonNullArgs = {
  oneName?: InputMaybe<Scalars["String"]>;
  twoName?: InputMaybe<Scalars["String"]>;
};

export type QueryTestUnionSingularArgs = {
  oneName?: InputMaybe<Scalars["String"]>;
  twoName?: InputMaybe<Scalars["String"]>;
};

export type TestCategory = {
  __typename?: "TestCategory";
  id: Scalars["ID"];
  name: Scalars["String"];
};

export type TestImplOne = TestInterface & {
  __typename?: "TestImplOne";
  description?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
  label: Scalars["String"];
};

export type TestImplTwo = TestInterface & {
  __typename?: "TestImplTwo";
  id: Scalars["ID"];
  label: Scalars["String"];
};

export type TestInterface = {
  id: Scalars["ID"];
  label: Scalars["String"];
};

export type TestNonNullEdgesRelayConnection = {
  __typename?: "TestNonNullEdgesRelayConnection";
  edges: Array<TestRelayEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"];
};

export type TestNonNullNodesRelayConnection = {
  __typename?: "TestNonNullNodesRelayConnection";
  edges?: Maybe<Array<Maybe<TestNonNullNodesRelayEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"];
};

export type TestNonNullNodesRelayEdge = {
  __typename?: "TestNonNullNodesRelayEdge";
  cursor: Scalars["String"];
  node: TestRelayNode;
};

export type TestObject = {
  __typename?: "TestObject";
  belongsToField?: Maybe<TestCategory>;
  belongsToNonNullField: TestCategory;
  hasManyField?: Maybe<Array<Maybe<TestOption>>>;
  hasManyFilteredField?: Maybe<Array<Maybe<TestOption>>>;
  hasManyNestedNonNullField: Array<TestOption>;
  hasManyNonNullField: Array<Maybe<TestOption>>;
  id: Scalars["ID"];
  interfaceField?: Maybe<TestInterface>;
  interfaceNonNullField: TestInterface;
  relayConnectionField?: Maybe<TestRelayConnection>;
  relayConnectionFilteredField?: Maybe<TestRelayConnection>;
  relayConnectionNonNullField: TestRelayConnection;
  size?: Maybe<Scalars["String"]>;
  sizeNonNull: Scalars["String"];
  unionField?: Maybe<Array<Maybe<TestUnion>>>;
  unionNestedNonNullField: Array<TestUnion>;
  unionNonNullField: Array<Maybe<TestUnion>>;
  unionSingularField?: Maybe<TestUnion>;
};

export type TestObjectHasManyFilteredFieldArgs = {
  name?: InputMaybe<Scalars["String"]>;
};

export type TestObjectRelayConnectionFieldArgs = {
  after?: InputMaybe<Scalars["String"]>;
  first?: InputMaybe<Scalars["Int"]>;
};

export type TestObjectRelayConnectionFilteredFieldArgs = {
  after?: InputMaybe<Scalars["String"]>;
  color?: InputMaybe<Scalars["String"]>;
  first?: InputMaybe<Scalars["Int"]>;
};

export type TestObjectRelayConnectionNonNullFieldArgs = {
  before?: InputMaybe<Scalars["String"]>;
  last?: InputMaybe<Scalars["Int"]>;
};

export type TestObjectUnionNestedNonNullFieldArgs = {
  twoName?: InputMaybe<Scalars["String"]>;
};

export type TestObjectUnionNonNullFieldArgs = {
  oneName?: InputMaybe<Scalars["String"]>;
};

export type TestObjectInput = {
  size?: InputMaybe<Scalars["String"]>;
};

export type TestOption = {
  __typename?: "TestOption";
  id: Scalars["ID"];
  name: Scalars["String"];
};

export type TestRelayConnection = {
  __typename?: "TestRelayConnection";
  edges?: Maybe<Array<Maybe<TestRelayEdge>>>;
  pageInfo: PageInfo;
  totalCount: Scalars["Int"];
};

export type TestRelayEdge = {
  __typename?: "TestRelayEdge";
  cursor: Scalars["String"];
  node?: Maybe<TestRelayNode>;
};

export type TestRelayNode = {
  __typename?: "TestRelayNode";
  color?: Maybe<Scalars["String"]>;
  id: Scalars["ID"];
};

export type TestUnion = TestUnionOne | TestUnionTwo;

export type TestUnionOne = {
  __typename?: "TestUnionOne";
  id: Scalars["ID"];
  oneName?: Maybe<Scalars["String"]>;
};

export type TestUnionTwo = {
  __typename?: "TestUnionTwo";
  id: Scalars["ID"];
  twoName?: Maybe<Scalars["String"]>;
};
