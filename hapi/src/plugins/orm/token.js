import jwt from 'jsonwebtoken';
import uuid from 'uuid';
import { INTEGER, UUID } from 'sequelize/lib/data-types';

// amount of time an unused token is good for
const THIRTY_DAYS_AGO = new Date(new Date() - 30 * 24 * 60 * 60 * 1000);
const SECRET = 'super secret key';

export default function createTokenModel(sequelize, hashMethod) {
  // define our model schema
  const modelConfig = {
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    uuid: {
      type: UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
  };

  // add model options
  const options = { timestamps: true };

  const Token = sequelize.define('token', modelConfig, options);

  Token.tokenize = async function(user) {
    const v4String = uuid.v4();

    // create a new token, then create JWT from new token and return it
    const tokenModel = await this.create({
      userId: user.get('id'),
      uuid: v4String,
    });

    const token = jwt.sign(
      {
        uuid: tokenModel.get('uuid'),
        id: user.get('id'),
        email: user.get('email'),
        role: user.get('role'),
      },
      SECRET,
    );

    return token;
  };

  Token.prototype.isExpired = function() {
    // check if token was used in last 30 days
    return this.get('updatedAt') < THIRTY_DAYS_AGO;
  };

  return Token;
}
