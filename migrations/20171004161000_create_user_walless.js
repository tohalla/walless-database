const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`CREATE USER walless password '${process.env.DB_WALLESS_PASSWORD}'`)
  .then(() => knex.raw(`GRANT USAGE ON SCHEMA translation TO walless`))
  .then(() => knex.raw(`GRANT USAGE ON SCHEMA auth TO walless`))
  .then(() => knex.raw(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO walless`))
  .then(() => knex.raw(`GRANT SELECT ON ALL TABLES IN SCHEMA translation TO walless`))
  .then(() => knex.raw(`GRANT admin TO walless`));

exports.down = knex => knex.raw(`REVOKE admin FROM walless`)
  .then(() => knex.raw(`REVOKE USAGE ON SCHEMA translation FROM walless`))
  .then(() => knex.raw(`REVOKE USAGE ON SCHEMA auth FROM walless`))
  .then(() => knex.raw(`REVOKE SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth FROM walless`))
  .then(() => knex.raw(`REVOKE SELECT ON ALL TABLES IN SCHEMA translation FROM walless`))
  .then(() => knex.raw(`DROP USER walless`));
