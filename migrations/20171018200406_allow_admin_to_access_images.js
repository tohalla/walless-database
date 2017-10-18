const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`
  CREATE POLICY admin_access_role_rights ON ${defaultSchema}.image
    FOR SELECT TO moderator
  USING (true)
`)
.then(() => knex.raw(`
  CREATE POLICY admin_insert_role_rights ON ${defaultSchema}.image
    FOR INSERT TO admin
  WITH CHECK (true)
`));

exports.down = knex => knex.raw(`
  DROP POLICY admin_access_role_rights ON ${defaultSchema}.image
`)
.then(() => knex.raw(`
  DROP POLICY admin_insert_role_rights ON ${defaultSchema}.image
`));

