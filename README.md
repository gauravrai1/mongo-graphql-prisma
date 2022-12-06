# Postgres GraphQL Prisma

This project is a Node.js server built with TypeScript, Postgres, GRraphQL and the prima backend framework.

## Getting started
Install npm dependencies:
```
npm install
```

## Create and seed the database

Run the following command to create your database file. This also creates the `User`, `Post` and `Comment` tables that are defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

```
npx prisma migrate dev --name init
```

When `npx prisma migrate dev` is executed against a newly created database, seeding is also triggered.  The seed file in [`prisma/seed.js`](./prisma/seed.js) will be executed and your database will be populated with the sample data.

## Start the GraphQL server

Launch your GraphQL server with this command:

```
npm run dev
```

Navigate to [http://localhost:4000/grapgql](http://localhost:4000/graphql) in your browser to explore the API of your GraphQL server in a [GraphQL Playground](https://github.com/prisma/graphql-playground).
