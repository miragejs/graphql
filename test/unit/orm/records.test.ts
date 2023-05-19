import {
  adaptRecord,
  adaptRecords,
  getRecords,
} from "../../../lib/orm/records.js";

import { describe, expect, test, vi } from "vitest";

import type { GraphQLObjectType } from "graphql";

describe("Unit | ORM | records", function () {
  describe("adapt records", function () {
    test("can adapt a db record for use with GraphQL", function () {
      const record = {
        associations: { bars: "HasMany" },
        attrs: { name: "foo" },
        bars: [{ name: "bar" }],
        modelName: "foo",
      };

      expect(adaptRecord(record)).toEqual({
        bars: record.bars,
        name: "foo",
        __typename: "Foo",
      });
    });

    test("can adapt a list of records for use with GraphQL", function () {
      const records = [
        {
          associations: { bars: "HasMany" },
          attrs: { name: "foo" },
          bars: [{ name: "bar" }],
          modelName: "foo",
        },
        {
          associations: { baz: "belongsTo" },
          attrs: { name: "bar" },
          baz: { name: "baz" },
          modelName: "foo",
        },
      ];

      expect(adaptRecords(records)).toEqual([
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
    const models = [
      { attrs: { name: "Foo1" }, modelName: "foo" },
      { attrs: { name: "Foo2" }, modelName: "foo" },
    ];
    const mirageSchema = {
      foos: {
        where: vi.fn(({ name }) => ({
          models: name ? models.slice(0, 1) : models,
        })),
      },
      toCollectionName: vi.fn(() => "foos"),
    };
    const type = {
      name: "Foo",
      getFields: () => ({ name: {} }),
    } as unknown as GraphQLObjectType;

    test("can get and adapt records", function () {
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

    test("can get, filter and adapt records", function () {
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
