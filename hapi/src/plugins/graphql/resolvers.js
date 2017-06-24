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

  if (!hasScope) {
    throw new AuthorizationError();
  }
};

export default {
  User: {
    async tokens(root, _, context) {
      try {
        const { User, Token } = context.models;
        const user = await User.findById(root.id, { include: ['tokens'] });

        return user.tokens;
      } catch (error) {
        return error;
      }
    },
  },
  Token: {
    async user(root, _, context) {
      try {
        const { User, Token } = context.models;
        const token = await Token.findById(root.id, { include: [User] });

        return token.user;
      } catch (error) {
        return error;
      }
    },
  },
  Query: {
    async users(_, args, context) {
      try {
        const { User } = context.models;

        // ensure we have proper scope
        validateScope(['user:view:all'], context.scope);

        return User.findAll();
      } catch (error) {
        return error;
      }
    },

    async user(_, args, context) {
      try {
        const { User } = context.models;

        // if not the current user, ensure proper permissions
        if (context.user.get('id') !== args.id) {
          validateScope(['user:view'], context.scope);
        }

        return User.findById(args.id);
      } catch (error) {
        return error;
      }
    },

    async tokens(_, args, context) {
      try {
        const { Token } = context.models;

        // ensure we have proper scope
        validateScope(['token:view:all'], context.scope);

        return Token.findAll();
      } catch (error) {
        return error;
      }
    },

    async token(_, args, context) {
      try {
        const { Token } = context.models;

        // ensure we have proper scope
        validateScope(['token:view'], context.scope);

        return Token.findById(args.id);
      } catch (error) {
        return error;
      }
    },
  },
  Mutation: {
    async createUser(_, args, context) {
      try {
        const { User } = context.models;

        validateScope(['user:create'], context.scope);

        const user = await User.create(args.input);
        return { user };
      } catch (error) {
        return error;
      }
    },
    async updateUser(_, args, context) {
      try {
        const { User } = context.models;

        // if not the current user, ensure proper permissions
        if (context.user.get('id') !== args.input.id) {
          validateScope(['user:update'], context.scope);
        }

        const user = await User.findById(args.input.id);
        await user.update(args.input.patch);

        return { user };
      } catch (error) {
        return error;
      }
    },
    async deleteUser(_, args, context) {
      try {
        const { User } = context.models;

        // if not the current user, ensure proper permissions
        if (context.user.get('id') !== args.input.id) {
          validateScope(['user:delete'], context.scope);
        }

        const user = await User.findById(args.input.id);
        await user.destroy();

        return { user };
      } catch (error) {
        return error;
      }
    },
    async deleteToken(_, args, context) {
      try {
        const { User, Token } = context.models;

        const token = await Token.findById(args.input.id, { include: [User] });

        // if not the current user, ensure proper permissions
        if (context.user.get('id') !== token.user.get('id')) {
          validateScope(['token:delete'], context.scope);
        }

        await token.destroy();

        return { token };
      } catch (error) {
        return error;
      }
    },
  },
};
