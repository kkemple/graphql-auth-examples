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

export default sequelize => {
  const User = createUserModel(sequelize, hash);
  const Token = createTokenModel(sequelize, hash);

  // build model associations
  User.hasMany(Token, { as: 'tokens' });
  Token.belongsTo(User);
  sequelize.sync().then(() => {
    User.create({
      name: 'admin',
      email: 'admin@graphql-hapi-test.blah',
      password: 'admin',
      role: 'admin',
    });
    User.create({
      name: 'user',
      email: 'user@graphql-hapi-test.blah',
      password: 'user',
      role: 'user',
    });
    User.create({
      name: 'guest',
      email: 'guest@graphql-hapi-test.blah',
      password: 'guest',
      role: 'guest',
    });
  });

  return function orm(request, response, next) {
    request.orm = { User, Token };
    next();
  };
};
