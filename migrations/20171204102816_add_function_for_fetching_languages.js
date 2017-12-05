const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`
  CREATE FUNCTION ${defaultSchema}.all_languages() RETURNS SETOF translation.language
  AS $$
    SELECT * FROM translation.language
  $$ LANGUAGE SQL STABLE
`)
  .then(() => knex.raw(`GRANT USAGE ON SCHEMA translation TO GUEST`))
  .then(() => knex.raw(`GRANT SELECT ON translation.language TO GUEST`));

exports.down = knex =>
  knex.raw(`DROP FUNCTION ${defaultSchema}.all_languages()`)
    .then(() => knex.raw(`REVOKE USAGE ON SCHEMA translation FROM GUEST`))
    .then(() => knex.raw(`REVOKE USAGE ON translation.language FROM GUEST`));
