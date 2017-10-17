const {defaultSchema} = require('../db');
exports.up = knex => knex.withSchema('auth').table('login', table => {
  table.dropColumn('validated');
})
  .then(() => knex.schema.withSchema('auth').renameTable('validation_token', 'email_verification_token'))
  .then(() => knex.schema.withSchema('auth').table('email_verification_token', table => {
    table.dropColumn('account');
    table.string('email', 254)
      .notNullable().unique()
      .references('email').inTable(`${defaultSchema}.account`)
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
  }))
  .then(() => knex.schema.withSchema(defaultSchema).table('account', table => {
    table.boolean('email_verified').notNullable().defaultTo(false);
  }))
  .then(() => knex.raw(`DROP TRIGGER generate_validation_token ON auth.login`))
  .then(() => knex.raw(`DROP FUNCTION auth.generate_validation_token()`))
  .then(() => knex.raw(`DROP FUNCTION auth.validation_token_exists(account_id INTEGER, token TEXT)`))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION auth.generate_email_verification_token() RETURNS TRIGGER
    AS $$
      DECLARE token uuid;
      BEGIN
        IF EXISTS (SELECT account.email FROM ${defaultSchema}.account WHERE account.email=NEW.email AND account.email_verified = TRUE) THEN
          RAISE unique_violation USING MESSAGE = 'account already validated';
        ELSE
          SELECT gen_random_uuid() INTO token;
          INSERT INTO auth.email_verification_token (token, email)
            VALUES (token, NEW.email);
          PERFORM pg_notify('validate', json_build_object(
            'token', token,
            'email', NEW.email
          )::text);
          RETURN NEW;
        END IF;
      END;
    $$ LANGUAGE plpgsql
  `))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION auth.email_verification_token_exists(email TEXT, token TEXT) RETURNS BOOLEAN
    AS $$
      BEGIN
        RETURN EXISTS(
          SELECT FROM auth.email_verification_token WHERE
            email_verification_token.email = email_verification_token_exists.email AND
            email_verification_token.token = email_verification_token_exists.token
        );
      END;
    $$ LANGUAGE plpgsql
  `))
  .then(() => knex.raw(`
    CREATE TRIGGER generate_email_verification_token
      AFTER INSERT ON ${defaultSchema}.account
        FOR EACH ROW EXECUTE PROCEDURE auth.generate_email_verification_token();
  `));

exports.down = knex => knex.withSchema('auth').table('login', table => {
  table.boolean('validated').notNullable().defaultTo(false);
})
  .then(() => knex.schema.withSchema('auth').renameTable('email_verification_token', 'validation_token'))
  .then(() => knex.schema.withSchema('auth').table('validation_token', table => {
    table.dropColumn('email'),
    table.integer('account')
      .references('id').inTable('auth.login')
      .onDelete('CASCADE');
  }))
  .then(() => knex.schema.withSchema(defaultSchema).table('account', table => {
    table.dropColumn('email_verified');
  }))
  .then(() => knex.raw(`DROP TRIGGER generate_email_verification_token ON ${defaultSchema}.account`))
  .then(() => knex.raw(`DROP FUNCTION auth.generate_email_verification_token()`))
  .then(() => knex.raw(`DROP FUNCTION auth.email_verification_token_exists(email TEXT, token TEXT)`))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION auth.generate_validation_token() RETURNS TRIGGER
    AS $$
      DECLARE token uuid;
      BEGIN
        IF EXISTS (SELECT login.id FROM auth.login WHERE login.id=NEW.id AND validated = TRUE) THEN
          RAISE unique_violation USING MESSAGE = 'login already exists and is validated';
        ELSE
          SELECT gen_random_uuid() INTO token;
          INSERT INTO auth.validation_token (token, account)
            VALUES (token, NEW.id);
          PERFORM pg_notify('validate', json_build_object(
            'token', token,
            'account_id', NEW.id
          )::text);
          RETURN NEW;
        END IF;
      END;
    $$ LANGUAGE plpgsql
  `))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION auth.validation_token_exists(account_id INTEGER, token TEXT) RETURNS BOOLEAN
    AS $$
      BEGIN
        RETURN EXISTS(SELECT FROM auth.validation_token WHERE account = account_id AND validation_token.token = validation_token_exists.token);
      END;
    $$ LANGUAGE plpgsql
  `))
  .then(() => knex.raw(`
    CREATE TRIGGER generate_validation_token
      AFTER INSERT ON auth.login
        FOR EACH ROW EXECUTE PROCEDURE auth.generate_validation_token();
  `));
