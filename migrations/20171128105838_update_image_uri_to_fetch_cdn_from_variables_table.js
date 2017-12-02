const {defaultSchema, cdn} = require('../db');

exports.up = knex => knex.raw(`
  CREATE OR REPLACE FUNCTION ${defaultSchema}.image_uri(image ${defaultSchema}.image) RETURNS TEXT AS $$
    SELECT variable.value || '/' || image.key FROM ${defaultSchema}.variable WHERE key = 'cdn'
  $$ LANGUAGE SQL STABLE;
`);

exports.down = knex => knex.raw(`
  CREATE OR REPLACE FUNCTION ${defaultSchema}.image_uri(image ${defaultSchema}.image) RETURNS TEXT AS $$
    SELECT '${cdn}/' || image.key
  $$ LANGUAGE SQL STABLE;
`);
