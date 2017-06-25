class ContextError extends Error {
  constructor(message = '`auth` property not found on context!') {
    super(message);
    this.message = message;
    this.name = 'ContextError';
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Permission Denied!') {
    super(message);
    this.message = message;
    this.name = 'AuthorizationError';
  }
}

const validateScope = (required, provided) => {
  let hasScope = false;

  required.map(scope => {
    if (provided.includes(scope)) hasScope = true;
  });

  return hasScope;
};

export default (scope, callback) => {
  const next = callback ? callback : scope;
  let requiredScope = callback ? scope : null;

  return function(_, __, context) {
    if (!context.auth) return new ContextError();
    if (!context.auth.isAuthenticated)
      return new AuthorizationError('Not Authenticated!');

    if (requiredScope && typeof requiredScope === 'function')
      requiredScope = requiredScope(_, __, context);

    if (
      (requiredScope.length && !context.auth.scope) ||
      (requiredScope.length &&
        !validateScope(requiredScope, context.auth.scope))
    ) {
      return new AuthorizationError();
    }

    return next(_, __, context);
  };
};
