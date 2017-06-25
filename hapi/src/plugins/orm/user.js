import omit from 'lodash.omit';
import bcrypt from 'bcryptjs';
import { INTEGER, STRING, ENUM } from 'sequelize/lib/data-types';

function comparePassword(password, user) {
  if (!user) return Promise.resolve(false);

  return new Promise(resolve => {
    bcrypt.compare(password, user.get('password'), (error, same) => {
      if (error || !same) {
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}

const THIRTY_DAYS_AGO = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);

export default function createUserModel(sequelize, hashMethod) {
  const modelConfig = {
    id: {
      primaryKey: true,
      type: INTEGER,
      autoIncrement: true,
    },

    name: {
      type: STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: STRING,
      allowNull: false,
      validate: {
        min: 6,
        max: 128,
      },
    },

    role: {
      type: ENUM,
      allowNull: false,
      defaultValue: 'user',
      values: ['user', 'admin'],
    },
  };

  // add model options
  const options = {
    // add timestamps
    timestamps: true,

    // add model event hooks
    hooks: {
      // hash password before model creation
      async beforeCreate(model) {
        try {
          const password = await hashMethod(model.getDataValue('password'));
          model.setDataValue('password', password);
        } catch (error) {
          return error;
        }
      },

      // hash password (if changed) on model update
      async beforeUpdate(model) {
        try {
          if (!model.changed('password')) return;

          const password = await hashMethod(model.getDataValue('password'));
          model.setDataValue('password', password);
        } catch (error) {
          return error;
        }
      },
    },
  };

  const User = sequelize.define('user', modelConfig, options);

  User.authenticate = async function(name, password) {
    // if no name or password error out
    if (!name || !password) return null;

    // get user by name
    const user = await this.findOne({ where: { name } });
    const isValidPassword = await comparePassword(password, user);

    if (user && isValidPassword) {
      return user;
    } else {
      return null;
    }
  };

  User.prototype.toJSON = function() {
    return omit(this.dataValues, ['password']);
  };

  // get all active tokens associated with user
  User.prototype.activeTokens = function() {
    return this.getTokens({
      where: { updatedAt: { $gt: THIRTY_DAYS_AGO } },
    });
  };

  // get all inactive tokens associated with user
  User.prototype.inactiveTokens = function() {
    return this.getTokens({
      where: { updatedAt: { $lt: THIRTY_DAYS_AGO } },
    });
  };

  return User;
}
