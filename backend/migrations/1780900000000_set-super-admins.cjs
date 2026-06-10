/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE users
    SET admin_permissions = COALESCE(admin_permissions, '{}'::jsonb) || '{"super_admin": true}'::jsonb
    WHERE role = 'admin';
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE users
    SET admin_permissions = admin_permissions - 'super_admin'
    WHERE role = 'admin';
  `);
};
