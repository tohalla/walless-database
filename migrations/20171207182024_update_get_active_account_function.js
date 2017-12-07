const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`
  CREATE OR REPLACE FUNCTION ${defaultSchema}.get_active_account()
    RETURNS ${defaultSchema}.account
  AS $$
    DECLARE result ${defaultSchema}.account;
  DECLARE account_id INTEGER;
    BEGIN
      account_id := NULLIF(current_setting('jwt.claims.account_id', true), '');
      IF account_id IS NULL THEN
        RETURN NULL;
      END IF;
      SELECT * FROM ${defaultSchema}.account
        WHERE ${defaultSchema}.account.id = account_id
      INTO result;
      RETURN result;
    END;
  $$ LANGUAGE plpgsql STABLE;
`);

exports.down = knex => knex.raw(`
  CREATE OR REPLACE FUNCTION ${defaultSchema}.get_active_account() RETURNS ${defaultSchema}.account
  AS $$
    SELECT * FROM ${defaultSchema}.account
      WHERE ${defaultSchema}.account.id = NULLIF(current_setting('jwt.claims.account_id', true), '')::INTEGER;
  $$ LANGUAGE sql STABLE
`);

