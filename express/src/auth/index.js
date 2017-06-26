import basicAuth from 'basic-auth';
import jwt from 'jsonwebtoken';

import scopes from './scopes';

const SECRET = 'super secret key';

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed!') {
    super(message);
    this.message = message;
    this.name = 'AuthenticationError';
  }
}

export default async function auth(request, response, next) {
  const { User, Token } = request.orm;
  const authorization = request.get('authorization');

  if (!authorization) {
    request.auth = { isAuthenticated: false, scope: null };
    return next();
  }

  if (authorization.startsWith('Basic')) {
    const { name, pass } = basicAuth(request);

    try {
      const user = await User.authenticate(name, pass);

      if (!user) {
        request.auth = { isAuthenticated: false, scope: null, user: null };
        return next();
      }

      request.auth = {
        user,
        isAuthenticated: true,
        scope: scopes[user.get('role')],
      };
      return next();
    } catch (error) {
      next(error);
    }
  } else if (authorization.startsWith('Bearer')) {
    const decoded = jwt.verify(authorization.replace(/Bearer\s+/, ''), SECRET);

    const token = await Token.findOne({
      where: { uuid: decoded.uuid },
      include: [User],
    });

    if (!token || token.isExpired()) {
      request.auth = { isAuthenticated: false, scope: null, user: null };
      return next();
    }

    request.auth = {
      user: token.user,
      isAuthenticated: true,
      scope: scopes[token.user.get('role')],
    };
    return next();
  } else {
    request.auth = { isAuthenticated: false, scope: null, user: null };
    return next();
  }
}
