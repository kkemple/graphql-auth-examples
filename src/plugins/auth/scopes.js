export default {
  admin: [
    'user:create',
    'user:update',
    'user:delete',
    'user:view',
    'user:view:all',
    'token:create',
    'token:delete',
    'token:view',
    'token:view:all',
  ],
  user: [
    'user:view:self',
    'user:update:self',
    'user:delete:self',
    'token:create:self',
    'token:delete:self',
    'token:view:self',
  ],
};
