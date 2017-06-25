import withAuth from './with-auth';

class NotFoundError extends Error {
  constructor(message = 'Not Found!') {
    super(message);
    this.message = message;
    this.name = 'NotFoundError';
  }
}

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
    users: withAuth(['user:view:all'], async (_, args, context) => {
      try {
        const { User } = context.models;

        return User.findAll();
      } catch (error) {
        return error;
      }
    }),

    user: withAuth(
      (_, args, context) => {
        return context.user.get('id') !== args.id
          ? ['user:view']
          : ['user:view:self'];
      },
      async (_, args, context) => {
        try {
          const { User } = context.models;

          return User.findById(args.id);
        } catch (error) {
          return error;
        }
      },
    ),

    tokens: withAuth(['token:view:all'], async (_, args, context) => {
      try {
        const { Token } = context.models;

        return Token.findAll();
      } catch (error) {
        return error;
      }
    }),

    token: withAuth(['token:view'], async (_, args, context) => {
      try {
        const { Token } = context.models;

        return Token.findById(args.id);
      } catch (error) {
        return error;
      }
    }),
  },
  Mutation: {
    async logIn(_, args, context) {
      const { input: { name, password } } = args;
      const { User, Token } = context.models;

      try {
        const user = await User.authenticate(name, password);
        const token = await Token.tokenize(user);

        return { user, token };
      } catch (error) {
        return error;
      }
    },

    createUser: withAuth(['user:create'], async (_, args, context) => {
      try {
        const { User } = context.models;
        const user = await User.create(args.input);

        return { user };
      } catch (error) {
        return error;
      }
    }),

    updateUser: withAuth(
      (_, args, context) => {
        return context.user.get('id') !== args.id
          ? ['user:update']
          : ['user:update:self'];
      },
      async (_, args, context) => {
        try {
          const { User } = context.models;

          const user = await User.findById(args.input.id);
          await user.update(args.input.patch);

          return { user };
        } catch (error) {
          return error;
        }
      },
    ),

    deleteUser: withAuth(
      (_, args, context) => {
        return context.user.get('id') !== args.id
          ? ['user:delete']
          : ['user:delete:self'];
      },
      async (_, args, context) => {
        try {
          const { User } = context.models;

          const user = await User.findById(args.input.id);
          await user.destroy();

          return { user };
        } catch (error) {
          return error;
        }
      },
    ),

    deleteToken: withAuth(
      (_, args, context) => {
        return context.user.get('id') !== args.id
          ? ['token:delete']
          : ['token:delete:self'];
      },
      async (_, args, context) => {
        try {
          const { User, Token } = context.models;

          const token = await Token.findById(args.input.id, {
            include: [User],
          });

          if (!token) await token.destroy();

          return { token };
        } catch (error) {
          return error;
        }
      },
    ),
  },
};
