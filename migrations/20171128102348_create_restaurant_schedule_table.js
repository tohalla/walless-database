const {defaultSchema} = require('../db');

exports.up = knex => knex.schema.withSchema(defaultSchema).createTable('restaurant_schedule', table => {
  table.integer('restaurant')
    .references('id')
    .inTable(`${defaultSchema}.restaurant`)
    .onDelete('CASCADE')
    .unsigned()
    .notNullable();
  table.integer('schedule')
    .references('id')
    .inTable(`${defaultSchema}.schedule`)
    .onDelete('CASCADE')
    .unsigned()
    .notNullable();
  table.unique(['restaurant', 'schedule']);
})
  .then(() => knex.raw(`GRANT SELECT ON TABLE ${defaultSchema}.restaurant_schedule TO guest`))
  .then(() => knex.raw(`GRANT INSERT, DELETE ON TABLE ${defaultSchema}.restaurant_schedule TO restaurant_employee`))
  .then(() => knex.raw(`ALTER TABLE ${defaultSchema}.restaurant_schedule ENABLE ROW LEVEL SECURITY`))
  .then(() => knex.raw(`
    CREATE POLICY select_restaurant_schedule ON ${defaultSchema}.restaurant_schedule
      FOR SELECT USING (true)
  `))
  .then(() => knex.raw(`
    CREATE POLICY insert_restaurant_schedule ON ${defaultSchema}.restaurant_schedule
      FOR INSERT TO restaurant_employee
    WITH CHECK ((
      SELECT restaurant_role_rights.allow_update_restaurant FROM ${defaultSchema}.restaurant_account
        JOIN ${defaultSchema}.restaurant_role_rights ON restaurant_role_rights.role = restaurant_account.role
        WHERE
          restaurant_account.account = current_setting('jwt.claims.account_id')::INTEGER AND
          restaurant_schedule.restaurant = restaurant_account.restaurant
    ))
  `))
  .then(() => knex.raw(`
    CREATE POLICY delete_restaurant_schedule ON ${defaultSchema}.restaurant_schedule
      FOR DELETE TO restaurant_employee
    USING ((
      SELECT restaurant_role_rights.allow_update_restaurant FROM ${defaultSchema}.restaurant_account
        JOIN ${defaultSchema}.restaurant_role_rights ON restaurant_role_rights.role = restaurant_account.role
        WHERE
          restaurant_account.account = current_setting('jwt.claims.account_id')::INTEGER AND
          restaurant_schedule.restaurant = restaurant_account.restaurant
    ))
  `));

exports.down = knex => knex.schema.withSchema(defaultSchema).dropTable('restaurant_schedule');
