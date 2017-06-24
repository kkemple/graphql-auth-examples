import Hapi from 'hapi';

import ORM from './plugins/orm';
import Auth from './plugins/auth';
import GraphQL from './plugins/graphql';

const server = new Hapi.Server();
server.connection({ port: process.env.PORT || 8080 });

server.register(
  [{ register: ORM }, { register: Auth }, { register: GraphQL }],
  error => {
    if (error) {
      console.error(error);
      return;
    }

    server.start(error =>
      console.log(error ? error : `server started at ${server.info.uri}!`),
    );
  },
);
