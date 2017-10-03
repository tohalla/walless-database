const {defaultSchema, cdn} = require('../db');

exports.up = knex => knex.schema.withSchema(defaultSchema).table('image', table => {
  table.dropColumn('uri');
  table.dropColumn('thumbnail');
})
  .then(() => knex.raw(`
    CREATE FUNCTION ${defaultSchema}.image_uri(image ${defaultSchema}.image) RETURNS TEXT AS $$
      SELECT '${cdn}/' || image.key
    $$ LANGUAGE SQL STABLE;
  `));

exports.down = knex => knex.schema.withSchema(defaultSchema).table('image', table => {
  table.text('uri').notNullable().unique();
  table.integer('thumbnail')
    .references('id').inTable(`${defaultSchema}.image`)
    .onDelete('CASCADE')
    .unsigned();
})
  .then(() => knex.raw(`DROP FUNCTION ${defaultSchema}.image_uri(${defaultSchema}.image)`));
