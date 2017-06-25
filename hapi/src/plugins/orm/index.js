import Sequelize from 'sequelize';
import bcrypt from 'bcryptjs';

import createUserModel from './user';
import createTokenModel from './token';

function hash(password) {
  return new Promise((resolve, reject) => {
    // create salt for hash
    bcrypt.genSalt(10, (error, salt) => {
      if (error) {
        reject(error);
        return;
      }

      // create hash
      bcrypt.hash(password, salt, (error, hash) => {
        if (error) {
          reject(error);
          return;
        }

        // return hash
        resolve(hash);
      });
    });
  });
}

const register = async (server, options, next) => {
  try {
    // build sequelize config object, pass server.log so logging is uniform
    const config = {
      dialect: 'sqlite',
      storage: ':memory:',
      logging: server.log.bind(server, ['SQL']),
    };

    // get instance of sequelize and models
    const sequelize = new Sequelize('graphql-test', '', '', config);
    const User = createUserModel(sequelize, hash);
    const Token = createTokenModel(sequelize, hash);

    // build model associations
    User.hasMany(Token, { as: 'tokens' });
    Token.belongsTo(User);

    await sequelize.sync();
    await Promise.all([
      User.create({
        name: 'admin',
        email: 'admin@graphql-hapi-test.blah',
        password: 'admin',
        role: 'admin',
      }),
      User.create({
        name: 'user',
        email: 'user@graphql-hapi-test.blah',
        password: 'user',
        role: 'user',
      }),
      User.create({
        name: 'guest',
        email: 'guest@graphql-hapi-test.blah',
        password: 'guest',
        role: 'guest',
      }),
    ]);

    // make models available to other plugins
    server.expose({ User, Token });

    next();
  } catch (error) {
    next(error);
  }
};

register.attributes = {
  name: 'orm',
  version: '1.0.0',
};

export default register;
