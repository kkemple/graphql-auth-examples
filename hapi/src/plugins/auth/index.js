import JWT from 'hapi-auth-jwt2';
import Basic from 'hapi-auth-basic';

import scopes from './scopes';

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed!') {
    super(message);
    this.message = message;
    this.name = 'AuthenticationError';
  }
}

// validate function for basic auth plugin
async function basic(request, email, password, next) {
  const { User } = request.server.plugins.orm;

  try {
    const user = await User.authenticate(email, password);
    if (!user) {
      next(null, false, { authType: 'basic' });
      return;
    }

    next(null, true, {
      user,
      scope: scopes[user.get('role')],
      authType: 'basic',
    });
  } catch (error) {
    next(error);
  }
}

// validate function for JWT plugin
async function jwt(decoded, request, next) {
  const { Token, User } = request.server.plugins.orm;

  try {
    const token = await Token.findOne({
      where: { uuid: decoded.uuid },
      include: [User],
    });

    if (!token || token.isExpired()) {
      next(null, false, { authType: 'jwt' });
      return;
    }

    next(null, true, {
      user: token.user,
      scope: scopes[token.user.get('role')],
      authType: 'jwt',
    });
  } catch (error) {
    next(error);
  }
}

const register = (server, options, next) => {
  server.register([{ register: Basic }, { register: JWT }], error => {
    if (error) {
      console.log(error);
      return;
    }

    // set up our Hapi auth strategies
    server.auth.strategy('basic', 'basic', { validateFunc: basic });
    server.auth.strategy('jwt', 'jwt', {
      key: process.env.SECRET || 'SECRET',
      validateFunc: jwt,
      verifyOptions: { algorithms: ['HS256'] },
    });

    // set them as default for all routes
    // this will check all routes for BOTH forms of authentication
    // try mode allows request to continue even if user is not valid
    server.auth.default({ strategies: ['basic', 'jwt'], mode: 'try' });

    server.route({
      method: 'POST',
      path: '/authenticate',
      config: {
        // disable auth so clients can authenticate
        auth: false,
        async handler(request, reply) {
          const { name, password } = request.payload;
          const { User, Token } = request.server.plugins.orm;

          try {
            const user = await User.authenticate(name, password);
            const token = await Token.tokenize(user);

            reply({ ...user.toJSON(), token });
          } catch (error) {
            reply(error);
          }
        },
      },
    });

    next();
  });
};

register.attributes = {
  name: 'auth',
  version: '1.0.0',
};

export default register;
