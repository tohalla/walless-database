const {defaultSchema} = require('../db');
exports.up = knex => knex.raw(`DROP POLICY access_own_account ON ${defaultSchema}.account`)
  .then(() => knex.raw(`GRANT INSERT ON ${defaultSchema}.account TO guest`))
  .then(() => knex.raw(`GRANT SELECT ON ${defaultSchema}.account TO authenticated_user`))
  .then(() => knex.raw(`REVOKE SELECT ON ${defaultSchema}.account FROM guest`))
  .then(() => knex.raw(`GRANT SELECT, USAGE ON ${defaultSchema}.account_id_seq TO guest`))
  .then(() => knex.raw(`
      CREATE POLICY update_own_account ON ${defaultSchema}.account
        FOR UPDATE TO authenticated_user
      USING (id = current_setting('jwt.claims.account_id')::INTEGER)
      WITH CHECK (id = current_setting('jwt.claims.account_id')::INTEGER)
  `));

exports.down = knex => knex.raw(`
    CREATE POLICY access_own_account ON ${defaultSchema}.account
      FOR ALL TO authenticated_user
    USING (id = current_setting('jwt.claims.account_id')::INTEGER)
    WITH CHECK (id = current_setting('jwt.claims.account_id')::INTEGER)
`)
  .then(() => knex.raw(`DROP POLICY update_own_account ON ${defaultSchema}.account`))
  .then(() => knex.raw(`REVOKE SELECT, USAGE ON ${defaultSchema}.account_id_seq FROM guest`))
  .then(() => knex.raw(`GRANT SELECT ON ${defaultSchema}.account TO guest`))
  .then(() => knex.raw(`REVOKE SELECT ON ${defaultSchema}.account FROM authenticated_user`))
  .then(() => knex.raw(`REVOKE SELECT, USAGE ON ${defaultSchema}.account_id_seq FROM guest`));
