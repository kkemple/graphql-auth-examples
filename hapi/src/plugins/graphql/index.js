import { graphqlHapi } from 'graphql-server-hapi';
import { makeExecutableSchema } from 'graphql-tools';

import typeDefs from './type-defs';
import resolvers from './resolvers';

const register = function(server, options, next) {
  const executableSchema = makeExecutableSchema({
    resolvers,
    typeDefs,
  });

  server.register(
    [
      {
        register: graphqlHapi,
        options: {
          path: '/graphql',
          graphqlOptions: request => ({
            pretty: true,
            schema: executableSchema,
            // this is where you add anything you want attached to context in resolvers
            context: {
              // models provided by ORM plugin
              models: server.plugins.orm,
              // user and scope provided by Hapi via Auth plugin
              user: request.auth.credentials.user,
              scope: request.auth.credentials.scope,
            },
          }),
        },
      },
    ],
    error => {
      if (error) return next(error);

      next();
    },
  );
};

register.attributes = {
  name: 'graphql-api',
  version: '1.0.0',
};

export default register;
