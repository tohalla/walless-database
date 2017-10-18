const {defaultSchema} = require('../db');

exports.up = knex =>
  knex.raw(`GRANT SELECT, INSERT, DELETE, UPDATE ON ${defaultSchema}.serving_location_account TO admin`)
    .then(() => knex.raw(`
      CREATE POLICY delete_serving_location_account_moderator ON ${defaultSchema}.serving_location_account
        FOR DELETE TO moderator
      USING (true)
    `))
    .then(() => knex.raw(`
      CREATE POLICY insert_serving_location_account ON ${defaultSchema}.serving_location_account
        FOR ALL TO admin
      USING (true) WITH CHECK(true)
    `));

exports.down = knex =>
  knex.raw(`REVOKE SELECT, INSERT, DELETE, UPDATE ON ${defaultSchema}.serving_location_account FROM admin`)
    .then(() => knex.raw(`
      DROP POLICY delete_serving_location_account_moderator ON ${defaultSchema}.serving_location_account
    `))
    .then(() => knex.raw(`
      DROP POLICY insert_serving_location_account ON ${defaultSchema}.serving_location_account
    `));
