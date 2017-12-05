const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`
  CREATE FUNCTION ${defaultSchema}.check_account_values() RETURNS TRIGGER
  AS $$
    BEGIN
      NEW.first_name := initcap(NEW.first_name);
      NEW.last_name := initcap(NEW.last_name);
      NEW.email := lower(NEW.email);
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql
`)
  .then(() => knex.raw(`
    CREATE TRIGGER check_account BEFORE INSERT OR UPDATE ON ${defaultSchema}.account
      FOR EACH ROW EXECUTE PROCEDURE ${defaultSchema}.check_account_values()
  `));

exports.down = knex =>
  knex.raw(`DROP TRIGGER check_account ON ${defaultSchema}.account`)
  .then(() => knex.raw(`DROP FUNCTION check_account_values()`));
