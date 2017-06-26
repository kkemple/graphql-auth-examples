import express from 'express';
import Sequelize from 'sequelize';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'graphql-server-express';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './graphql/type-defs';
import resolvers from './graphql/resolvers';

import orm from './orm';
import auth from './auth';

// build sequelize config object, pass server.log so logging is uniform
const config = {
  dialect: 'sqlite',
  storage: ':memory:',
  logging: console.log.bind(console),
};

// get instance of sequelize and models
const sequelize = new Sequelize('graphql-test', '', '', config);

const executableSchema = makeExecutableSchema({ typeDefs, resolvers });
const PORT = 3000;
const app = express();

app.use(orm(sequelize));
app.use(auth);
app.use(
  '/graphql',
  bodyParser.json(),
  graphqlExpress(request => {
    return {
      schema: executableSchema,
      pretty: true,
      context: {
        models: request.orm,
        user: request.auth.user,
        auth: {
          isAuthenticated: request.auth.isAuthenticated,
          scope: request.auth.scope,
        },
      },
    };
  }),
);

app.listen(PORT);
