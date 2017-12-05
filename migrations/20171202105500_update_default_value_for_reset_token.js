exports.up = knex =>
  knex.raw(`ALTER TABLE auth.reset_token ALTER COLUMN token SET DEFAULT gen_random_uuid()`);

exports.down = knex =>
  knex.raw(`ALTER TABLE auth.reset_token ALTER COLUMN token DROP DEFAULT`);
