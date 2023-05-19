import type { AnyRegistry } from "miragejs/-types";
import type { Instantiate } from "miragejs";
import type { ModelInitializer } from "miragejs/orm/schema";

type CreateAttrs<T extends string> = Partial<
  ModelInitializer<Instantiate<AnyRegistry, T>>
>;

export type TestCategoryAttrs = CreateAttrs<"test-category">;
export type TestImplOneAttrs = CreateAttrs<"test-impl-one">;
export type TestImplTwoAttrs = CreateAttrs<"test-impl-two">;
export type TestObjectAttrs = CreateAttrs<"test-object">;
export type TestOptionAttrs = CreateAttrs<"test-option">;
export type TestRelayNodeAttrs = CreateAttrs<"test-relay-node">;
export type TestUnionOneAttrs = CreateAttrs<"test-union-one">;
export type TestUnionTwoAttrs = CreateAttrs<"test-union-two">;
