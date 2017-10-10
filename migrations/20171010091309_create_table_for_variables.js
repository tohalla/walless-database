const {defaultSchema, cdn} = require('../db');

exports.up = knex => knex.schema.withSchema(defaultSchema).createTable('variable', table => {
 table.string('key', 48).primary();
 table.text('value');
})
  .then(() => knex.raw(`
    INSERT INTO ${defaultSchema}.variable (key, value) VALUES
      ('cdn', '${cdn}')
  `))
  .then(() => knex.raw(`GRANT UPDATE, DELETE, INSERT ON ${defaultSchema}.variable TO admin`))
  .then(() => knex.raw(`GRANT SELECT ON ${defaultSchema}.variable TO guest`))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION ${defaultSchema}.image_uri(image ${defaultSchema}.image) RETURNS TEXT AS $$
      SELECT variable.value || image.key FROM ${defaultSchema}.variable WHERE key = 'cdn'
    $$ LANGUAGE SQL STABLE;
  `));

exports.down = knex => knex.schema.withSchema(defaultSchema).dropTable('variable')
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION ${defaultSchema}.image_uri(image ${defaultSchema}.image) RETURNS TEXT AS $$
      SELECT '${cdn}/' || image.key
    $$ LANGUAGE SQL STABLE;
  `));
