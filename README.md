# Mirage JS GraphQL

Use [Mirage JS](https://miragejs.com) with [GraphQL](https://graphql.org).

## Overview

Mirage lets you simulate API responses by writing **route handlers**. A route handler is a function that returns data to fulfill a request. Mirage GraphQL provides the ability to create a GraphQL route handler based on your GraphQL and Mirage schemas.

```javascript
import { Server } from "miragejs"
import { createGraphQLHandler } from "miragejs-graphql"
import graphQLSchema from "app/gql/schema.gql"

new Server({
  routes() {
    const graphQLHandler = createGraphQLHandler(graphQLSchema, this.schema)

    this.post("/graphql", graphQLHandler)
  }
})
```

### Highlights

Mirage GraphQL tries to do a lot for you. Here are the highlights:

* It fulfills GraphQL requests by fetching data from Mirage's database.
* It filters records from Mirage's database by using arguments from your GraphQL queries.
* It handles create, update and delete type mutations automatically based on [some conventions](#automatic-mutation-conventions).
* It allows you to supply your own resolvers (for cases where the automatic query and mutation resolution isn't sufficient).

## Installation

You should install both `miragejs` and `miragejs-graphql`.

```sh
# Using npm
npm install --save-dev miragejs miragejs-graphql

# Using Yarn
yarn add --dev miragejs miragejs-graphql
```

## Guide

This guide assumes most of its readers are already using GraphQL in their apps and want to start using Mirage to mock out their backend. This guide will try to provide enough information to be useful but it's worth reading the [Mirage guides](https://miragejs.com/docs/getting-started/introduction/) to get a full understanding of everything Mirage can do.

### Table of Contents

* [Mirage GraphQL Assumptions](#mirage-graphql-assumptions)
  * [You Don't Need Mirage Models](#you-dont-need-mirage-models)
  * [Arguments from GraphQL Queries Map to Field Names of the Return Type](#arguments-from-graphql-queries-map-to-field-names-of-the-return-type)
* [Example Use Cases](#example-use-cases)
  * [Example Schema](#example-schema)
  * [Example: Find Person by ID](#example-find-person-by-id)
  * [Example: Get All People](#example-get-all-people)
  * [Example: Creating and Updating a Person](#example-creating-and-updating-a-person)
    * [Automatic Mutation Conventions](#automatic-mutation-conventions)
  * [Example: Filtering People](#example-filtering-people)
    * [Part 1: Filtering by Last Name](#part-1-filtering-by-last-name)
    * [Part 2: Sorting](#part-2-sorting)
  * [Example: Deleting a Person](#example-deleting-a-person)

### Mirage GraphQL Assumptions

There are a couple of assumptions Mirage GraphQL makes concerning how it resolves GraphQL queries. It's important to understand these assumptions to avoid confusion based on its behavior.

#### You Don't Need to Define Mirage Models

In many cases, you need to [tell Mirage about the models](https://miragejs.com/docs/main-concepts/models/) that exist in your app but Mirage GraphQL assumes relationships between types from your GraphQL schema and creates models accordingly. You can still define Mirage models, if you'd like, and Mirage GraphQL won't try to create them on its own.

#### Arguments from GraphQL Queries Map to Field Names of the Return Type

Mirage GraphQL uses arguments to filter records from Mirage's database. This isn't very useful for testing, as you only need to seed Mirage's database with the exact records you need for a given test. It's more useful when using Mirage for development where filtering and pagination may be desired for a more realistic user experience.

### Example Use Cases

Notes:

* For further reference, there are many more use cases covered by the integration tests.
* The `graphql-request` library is used in the examples but is not a dependency installed by Mirage GraphQL.

#### Example Schema

For these examples, imagine we have a GraphQL schema that looks like this:

```graphql
# app/gql/schema.gql

input PersonInput {
  firstName: String
  lastName: String
}

type Mutation {
  createPerson(input: PersonInput!): Person
  updatePerson(id: ID!, input: PersonInput!): Person

  # Note: `deletePerson` can't automatically be resolved due to the Boolean
  # return type. We will need to implement a resolver for this.
  deletePerson(id: ID!): Boolean
}

type Person {
  id: ID!
  firstName: String!
  lastName: String!
}

type Query {
  allPeople: [Person]
  person(id: ID!): Person

  # Note: `people` can't automatically be resolved if the `sortBy` argument is
  # supplied to the query. We will need to implement a resolver for this.
  people(firstName: String, lastName: String, sortBy: String): [Person]
}
```

and we create a Mirage server like this:

```javascript
// app/mirage/server.js

import { Server } from "miragejs"
import { createGraphQLHandler } from "miragejs-graphql"
import graphQLSchema from "app/gql/schema.gql"

export function createServer() {
  return new Server({
    routes() {
      const graphQLHandler = createGraphQLHandler(graphQLSchema, this.schema);

      this.post("/graphql", graphQLHandler)
    }
  })
}
```

#### Example: Find Person by ID

In this example, we can get a `Person` record by ID.

```javascript
// app/components/person.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

server.create("person", { firstName: "Mikael", lastName: "Åkerfeldt" })

export default {
  // ...other component stuff

  personQuery: `
    query Person(id: $id) {
      person(id: $id) {
        id
        firstName
        lastName
      }
    }
  `,
  getPerson(id) {
    return request("/graphql", this.personQuery, { variables: { id } })
  }
}
```

A call to `getPerson("1")` will cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "person": {
      "id": "1",
      "firstName": "Mikael",
      "lastName": "Åkerfeldt"
    }
  }
}
```

### Example: Get All People

In this example, we can get all the `Person` records from Mirage's database.

```javascript
// app/components/people.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

server.create("person", { firstName: "Mikael", lastName: "Åkerfeldt" })
server.create("person", { firstName: "Per", lastName: "Nilsson" })
server.create("person", { firstName: "Tomas", lastName: "Haake" })

export default {
  // ...other component stuff

  peopleQuery: `
    query People {
      people {
        id
        firstName
        lastName
      }
    }
  `,
  getPeople() {
    return request("/graphql", this.peopleQuery)
  }
}
```

A call to `getPeople()` will cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "people": [
      {
        "id": "1",
        "firstName": "Mikael",
        "lastName": "Åkerfeldt"
      },
      {
        "id": "2",
        "firstName": "Per",
        "lastName": "Nilsson"
      },
      {
        "id": "3",
        "firstName": "Tomas",
        "lastName": "Haake"
      }
    ]
  }
}
```

### Example: Creating and Updating a Person

In this example, we can create or update a `Person` record in Mirage's database.

```javascript
// app/components/people.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

export default {
  // ...other component stuff

  createPersonMutation: `
    mutation CreatePerson(input: PersonInput!) {
      createPerson(input: $input) {
        id
        firstName
        lastName
      }
    }
  `,
  updatePersonMutation: `
    mutation UpdatePerson(id: ID!, input: PersonInput!) {
      updatePerson(id: $id, input: $input) {
        id
        firstName
        lastName
      }
    }
  `,
  createPerson(input) {
    return request("/graphql", this.createPersonMutation, {
      variables: { input }
    })
  },
  updatePerson(id, input) {
    return request("/graphql", this.updatePersonMutation, {
      variables: { id, input }
    })
  }
}
```

A call to `createPerson({ firstName: "Ola", lastName: "Englund" })` will cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "createPerson": {
      "id": "1",
      "firstName": "Ola",
      "lastName": "Englund"
    }
  }
}
```

If you then wanted to update that person, you could call `updatePerson(id: "1", { lastName: "Strandberg" })` which would result in:

```json
{
  "data": {
    "updatePerson": {
      "id": "1",
      "firstName": "Ola",
      "lastName": "Strandberg"
    }
  }
}
```

#### Automatic Mutation Conventions

Mirage GraphQL will automatically resolve these mutations per these conventions:

* A mutation that returns an object type and has one argument, an input type, will create a record with the given input type attributes.
* A mutation that returns an object type and has two arguments, an ID type and an input type, will update a record having that ID with the given input type attributes.
* A mutation that returns an object type and has one argument, an ID type, will delete a record having that ID.

Any other combination of arguments for a mutation requires a resolver. This can be seen in a later example.

### Example: Filtering People

In this example, we can get filter `Person` records from Mirage's database. There will be two parts. In part 1, we'll filter by `lastName` which is an argument for the query and an attribute of `Person` records. In part 2, we'll add a `sortBy` argument which will require us to implement a resolver.

#### Part 1: Filtering by Last Name

In the following case, Mirage GraphQL can automatically filter the records from Mirage's database because the `lastName` argument for the query matches an attribute of the records.

```javascript
// app/components/people.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

server.create("person", { firstName: "Mikael", lastName: "Åkerfeldt" })
server.create("person", { firstName: "Per", lastName: "Nilsson" })
server.create("person", { firstName: "Tomas", lastName: "Haake" })

export default {
  // ...other component stuff

  peopleQuery: `
    query People($firstName: String, $lastName: String, $sortBy: String) {
      people(firstName: $firstName, lastName: $lastName, sortBy: $sortBy) {
        id
        firstName
        lastName
      }
    }
  `,
  getPeopleByLastName(lastName) {
    return request("/graphql", this.peopleQuery, { variables: { lastName } })
  }
}
```

A call to `getPeopleByLastName("Haake")` will cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "people": [
      {
        "id": "3",
        "firstName": "Tomas",
        "lastName": "Haake"
      }
    ]
  }
}
```

#### Part 2: Sorting

In the following case, Mirage GraphQL can't automatically resolve the query because the `sortBy` argument for the query doesn't match any attribute of the records. To do this, we need to add pass a resolver in when creating our GraphQL handler.

In the Mirage server setup:

```javascript
// app/mirage/server.js

import { Server } from "miragejs"
import graphQLSchema from "app/gql/schema.gql"
import {
  createGraphQLHandler,
  mirageGraphQLFieldResolver
} from "miragejs-graphql"

export function createServer() {
  return new Server({
    routes() {
      const graphQLHandler = createGraphQLHandler(graphQLSchema, this.schema, {
        resolvers: {
          Query: {
            people(obj, args, context, info) {
              const { sortBy } = args
              
              delete args.sortBy
              
              const records =
                mirageGraphQLFieldResolver(obj, args, context, info)

              return records.sort((a, b) => a[sortBy].localeCompare(b[sortBy]))
            }
          }
        }
      })

      this.post("/graphql", graphQLHandler)
    }
  })
}
```

Note: We can pass as many resolvers into `createGraphQLHandler` as we want. Additionally, we can compose resolvers by leaning on the default field resolver from Mirage GraphQL, as shown above. In this case, the default field resolver does most of the work to get the records and our custom resolver only has to sort them.

Having added a resolver to handle the `sortBy` argument, the following component example will now work:

```javascript
// app/components/people.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

server.create("person", { firstName: "Mikael", lastName: "Åkerfeldt" })
server.create("person", { firstName: "Per", lastName: "Nilsson" })
server.create("person", { firstName: "Tomas", lastName: "Haake" })

export default {
  // ...other component stuff

  peopleQuery: `
    query People($firstName: String, $lastName: String, $sortBy: String) {
      people(firstName: $firstName, lastName: $lastName, sortBy: $sortBy) {
        id
        firstName
        lastName
      }
    }
  `,
  getSortedPeopleBy(sortBy) {
    return request("/graphql", this.peopleQuery, { variables: { sortBy } })
  }
}
```

A call to `getSortedPeopleBy("lastName")` will cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "people": [
      {
        "id": "1",
        "firstName": "Mikael",
        "lastName": "Åkerfeldt"
      },
      {
        "id": "3",
        "firstName": "Tomas",
        "lastName": "Haake"
      },
      {
        "id": "2",
        "firstName": "Per",
        "lastName": "Nilsson"
      }
    ]
  }
}
```

### Example: Deleting a Person

If you read the section on automatically resolving mutations, you'll know that Mirage GraphQL can automatically handle conventional mutations that delete records. However, in our example schema, the `deletePerson` mutation is unconventional. It returns `Boolean` instead of a `Person`.

In this case, we need to implement a resolver but just like in the example of sorting people, we can leverage Mirage GraphQL's default behavior.

In the Mirage server setup:

```javascript
// app/mirage/server.js

import { Server } from "miragejs"
import graphQLSchema from "app/gql/schema.gql"
import {
  createGraphQLHandler,
  mirageGraphQLFieldResolver
} from "miragejs-graphql"

export function createServer() {
  return new Server({
    routes() {
      const graphQLHandler = createGraphQLHandler(graphQLSchema, this.schema, {
        resolvers: {
          Mutation: {
            // Coerce the record returned from the default resolver to a Boolean
            deletePerson: (obj, args, context, info) =>
              !!mirageGraphQLFieldResolver(...arguments)
          }
        }
      })

      this.post("/graphql", graphQLHandler)
    }
  })
}
```

Having added a resolver to handle the mutation, the following component example will now work:

```javascript
// app/components/people.js

import { createServer } from "app/mirage/server";
import { request } from "graphql-request"

const server = createServer();

export default {
  // ...other component stuff

  deletePersonMutation: `
    mutation DeletePerson(id: ID!) {
      createPerson(id: $id)
    }
  `,
  deletePerson(id) {
    return request("/graphql", this.deletePersonMutation, { variables: { id } })
  }
}
```

A call to `deletePerson("1")` will remove the record from Mirage's database and cause Mirage GraphQL to respond with:

```json
{
  "data": {
    "deletePerson": true
  }
}
```

## Getting Help and Contributing

Discussions are welcome anywhere including the Mirage Discord server's `#graphql` channel. Please feel free to reach out for help or to collaborate.

Any contributions are welcome. The most helpful contributions come from new use cases and most often arrive in the form of GitHub issues. One great way to contribute a new use case is by adding a failing test.

## History

As Mirage itself evolved from an Ember add-on ([ember-cli-mirage](https://ember-cli-mirage.com)) so too did Mirage GraphQL ([ember-cli-mirage-graphql](https://github.com/kloeckner-i/ember-cli-mirage-graphql)).

### Differences from `ember-cli-mirage-graphql`

The `ember-cli-mirage-graphql` add-on doesn't leverage very many features of [GraphQL JS](https://github.com/graphql/graphql-js) and does quite a lot of custom work to resolve queries.

There are several disadvantages to its approach, namely:

* It doesn't use resolvers but rather uses the mocking feature from [GraphQL Tools](https://github.com/ardatan/graphql-tools). This can lead to some strange results, if every field isn't mocked properly.
* It doesn't use much of GraphQL's API and re-implements a lot of existing functionality in a less robust way.
* It doesn't use Mirage's ORM API which introduces many limitations on its ability to automatically resolve records.
* The add-on's API includes custom field and variable mapping which can be avoided entirely by providing the ability to supply your own resolvers.

### Upgrading

If you want to upgrade to Mirage GraphQL from `ember-cli-mirage-graphql`, you may need to make some significant changes in how you create the GraphQL handler. Firstly, you will need to pass in your Mirage schema as shown at the top of this README.

If you used any of the options, `fieldsMap`, `varsMap` and `mutations`, you will need to re-implement them with resolvers; though, hopefully some mutations can be automatically resolved for you now.

## Special Thanks

Special thanks for helping this library evolve go out to [Sam Selikoff](https://github.com/samselikoff), [Chad Carbert](https://github.com/chadian), [Jamie White](https://github.com/jgwhite), [Blake Gentry](https://github.com/bgentry), [Ruben Manrique](https://github.com/miwialex), [Louis-Michel Couture](https://github.com/louim), [David Mazza](https://github.com/dmzza), [Cameron Nicklaus](https://github.com/camnicklaus) and [Bert De Block](https://github.com/bertdeblock).
