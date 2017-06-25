export default `
  schema {
    query: Query
    mutation: Mutation
  }

  type Query {
    users: [User]
    user(id: Int!): User
    tokens: [Token]
    token(id: Int!): Token
  }

  type Mutation {
    logIn(input: LogIn!): LogInPayload
    createUser(input: CreateUser!): CreateUserPayload
    updateUser(input: UpdateUser!): UpdateUserPayload
    deleteUser(input: DeleteUser!): DeleteUserPayload
    deleteToken(input: DeleteToken!): DeleteTokenPayload
  }

  type User  {
    id: Int
    name: String
    email: String
    password: String
    role: String
    tokens: [Token]
  }

  type Token {
    id: Int
    uuid: String
    user: User
  }

  type CreateUserPayload {
    user: User
  }

  type UpdateUserPayload {
    user: User
  }

  type DeleteUserPayload {
    user: User
  }

  type DeleteTokenPayload {
    token: Token
  }

  type LogInPayload {
    user: User
    token: String
  }

  input LogIn {
    name: String
    password: String
  }

  input CreateUser  {
    name: String
    email: String
    role: String
    password: String
  }

  input UpdateUser  {
    id: Int!
    patch: CreateUser
  }

  input DeleteUser {
    id: Int!
  }

  input DeleteToken {
    id: Int!
  }
`;
