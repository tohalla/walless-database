const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`
  CREATE POLICY admin_access_role_rights ON ${defaultSchema}.restaurant_role_rights
    FOR SELECT TO moderator
  USING (true)
`)
.then(() => knex.raw(`
  CREATE POLICY admin_insert_role_rights ON ${defaultSchema}.restaurant_role_rights
    FOR INSERT TO admin
  WITH CHECK (true)
`));

exports.down = knex => knex.raw(`
  DROP POLICY admin_access_role_rights ON walless.restaurant_role_rights
`)
.then(() => knex.raw(`
  DROP POLICY admin_insert_role_rights ON walless.restaurant_role_rights
`));

