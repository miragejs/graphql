jest.mock("@lib/orm/records");

import { filterRecords, getRecords } from "@lib/orm/records";
import resolveList from "@lib/resolvers/list";

describe("Unit | resolvers | list", function () {
  describe("without a parent record", function () {
    const obj = undefined;
    const args = {};
    const type = {};
    const context = { mirageSchema: {} };

    it("finds records for the given type and args", function () {
      resolveList(obj, args, context, undefined, type);

      expect(getRecords).toHaveBeenCalledWith(type, args, context.mirageSchema);
    });
  });

  describe("parent records", function () {
    it("returns edges of parent, if type is a Relay edge", function () {
      const obj = { edges: [] };
      const type = {
        name: "TestEdge",
        getFields: () => ({ node: undefined }),
      };
      const edges = resolveList(obj, undefined, undefined, undefined, type);

      expect(edges).toEqual(obj.edges);
    });

    it("can filter records included with the parent record", function () {
      const obj = { bars: [] };
      const args = {};
      const info = { fieldName: "bars" };
      const type = { name: "Foo" };

      resolveList(obj, args, undefined, info, type);

      expect(filterRecords).toHaveBeenCalledWith(obj.bars, args);
    });

    it("can filter records related to a Mirage record", function () {
      const obj = { bars: { models: [] } };
      const args = {};
      const info = { fieldName: "bars" };
      const type = { name: "Foo" };

      resolveList(obj, args, undefined, info, type);

      expect(filterRecords).toHaveBeenCalledWith(obj.bars.models, args);
    });
  });
});
