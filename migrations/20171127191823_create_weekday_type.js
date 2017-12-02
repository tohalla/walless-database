exports.up = knex => knex.raw(`
  CREATE TYPE weekday AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
  )
`);

exports.down = knex => knex.raw(`DROP TYPE weekday`);
