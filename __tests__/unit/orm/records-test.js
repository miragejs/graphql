import { adaptRecord, adaptRecords, getRecords } from "@lib/orm/records";

describe("Unit | ORM | records", function () {
  describe("adapt records", function () {
    it("can adapt a db record for use with GraphQL", function () {
      const record = {
        associations: { bars: "HasMany" },
        attrs: { name: "foo" },
        bars: [{ name: "bar" }],
      };

      expect(adaptRecord(record, "Foo")).toEqual({
        bars: record.bars,
        name: "foo",
        __typename: "Foo",
      });
    });

    it("can adapt a list of records for use with GraphQL", function () {
      const records = [
        {
          associations: { bars: "HasMany" },
          attrs: { name: "foo" },
          bars: [{ name: "bar" }],
        },
        {
          associations: { baz: "belongsTo" },
          attrs: { name: "bar" },
          baz: { name: "baz" },
        },
      ];

      expect(adaptRecords(records, "Foo")).toEqual([
        {
          bars: records[0].bars,
          name: "foo",
          __typename: "Foo",
        },
        {
          baz: records[1].baz,
          name: "bar",
          __typename: "Foo",
        },
      ]);
    });
  });

  describe("get records", function () {
    const models = [{ attrs: { name: "Foo1" } }, { attrs: { name: "Foo2" } }];
    const mirageSchema = {
      foos: {
        where: jest.fn(({ name }) => ({
          models: name ? models.slice(0, 1) : models,
        })),
      },
      toCollectionName: jest.fn(() => "foos"),
    };
    const type = {
      name: "Foo",
      getFields: () => ({ name: {} }),
    };

    it("can get and adapt records", function () {
      const records = getRecords(type, {}, mirageSchema);

      expect(mirageSchema.toCollectionName).toHaveBeenCalledWith("Foo");
      expect(records).toEqual([
        {
          name: "Foo1",
          __typename: "Foo",
        },
        {
          name: "Foo2",
          __typename: "Foo",
        },
      ]);
    });

    it("can get, filter and adapt records", function () {
      const records = getRecords(type, { name: "Foo1" }, mirageSchema);

      expect(mirageSchema.toCollectionName).toHaveBeenCalledWith("Foo");
      expect(mirageSchema.foos.where).toHaveBeenCalledWith({ name: "Foo1" });
      expect(records).toEqual([
        {
          name: "Foo1",
          __typename: "Foo",
        },
      ]);
    });
  });
});
