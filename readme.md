# GraphQL Auth Examples

This is a repo of authentication and authorization examples in GraphQL.

Current Frameworks:

- [Hapi](./hapi)
- [Express](./express)

## Getting Started

Pick the framework you want to run and `cd` into that example. Run:

```shell
yarn install
npm run build
npm run start
```

Both projects expose a GraphQL endpoint at `/graphql`. You can test authentication and authorization by using any of the three users created when the app starts: `guest|user|admin`. You can then verify that authentication and authorization works propery by querying the API with a tool like [`GraphiQL` desktop app](https://github.com/skevy/graphiql-app).
