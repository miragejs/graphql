/**
 * Adapts a record from Mirage's database to return in the GraphQL response. It
 * flattens the attributes and relationships in a copy of the record. It also
 * ensures the `__typename` attribute is added to the copy so GraphQL can
 * resolve records of a polymorphic type.
 *
 * @function adaptRecord
 * @param {Object} record
 * @param {string} typeName
 * @returns {Object} A copy of the record, adapted for the response.
 */
export function adaptRecord(record, typeName) {
  if (record == null) return;

  const { attrs, associations } = record;
  const clone = { ...attrs, __typename: typeName };

  for (let field in associations) {
    clone[field] = record[field];
  }

  return clone;
}

/**
 * Adapts a list of records from Mirage's database to return in the GraphQL
 * response.
 *
 * @function adaptRecords
 * @param {Object[]} records
 * @param {string} typeName
 * @see adaptRecord
 * @returns {Object[]} A list of adapted records.
 */
export function adaptRecords(records, typeName) {
  return records.reduce(function (adaptedRecords, record) {
    return [...adaptedRecords, adaptRecord(record, typeName)];
  }, []);
}

/**
 * Gets records from Mirage's database for the given GraphQL type. It can filter
 * the records by the given GraphQL arguments, if supplied. Filtering assumes
 * each key in `args` corresponds to an attribute of the record.
 *
 * For more advanced filtering needs, or sorting, for example, you will need to
 * implement your own resolver.
 *
 * @function getRecords
 * @param {Object} type The GraphQL type.
 * @param {Object} args The GraphQL args. These may be empty.
 * @param {Object} mirageSchema
 * @see adaptedRecords
 * @see createGraphQLHandler
 * @returns {Object[]} A list of filtered, adapted records.
 */
export function getRecords(type, args, mirageSchema) {
  const collectionName = mirageSchema.toCollectionName(type.name);
  const records = mirageSchema[collectionName].where(args).models;

  return adaptRecords(records, type.name);
}
