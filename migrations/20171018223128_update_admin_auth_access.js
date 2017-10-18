exports.up = knex =>
  knex.raw(`GRANT DELETE, INSERT, SELECT ON auth.client TO admin`);

exports.down = knex =>
  knex.raw(`REVOKE DELETE, INSERT, SELECT ON auth.client from admin`);
