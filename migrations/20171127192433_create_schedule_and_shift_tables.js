const {defaultSchema} = require('../db');

exports.up = knex => knex.schema.withSchema(defaultSchema).createTable('schedule', table => {
  table.increments();
  table.specificType('weekday', 'weekday').index();
  table.date('specific_date').index();
  table.boolean('entire_day').notNullable().defaultTo(false);
})
  .then(() => knex.raw(`
    ALTER TABLE ${defaultSchema}.schedule ADD CONSTRAINT no_null_date CHECK (
      schedule.weekday IS NOT NULL OR schedule.specific_date IS NOT NULL
    )
  `))
  .then(() => knex.schema.withSchema(defaultSchema).createTable('shift', table => {
    table.integer('schedule')
      .references('id')
      .inTable(`${defaultSchema}.schedule`)
      .onDelete('CASCADE')
      .unsigned()
      .notNullable();
    table.time('start_time').notNullable();
    table.time('end_time').notNullable();
  }))
  .then(() => knex.raw(`GRANT INSERT, DELETE ON TABLE ${defaultSchema}.schedule TO restaurant_employee`))
  .then(() => knex.raw(`GRANT INSERT, DELETE ON TABLE ${defaultSchema}.shift TO restaurant_employee`))
  .then(() => knex.raw(`GRANT SELECT ON TABLE ${defaultSchema}.schedule TO guest`))
  .then(() => knex.raw(`GRANT SELECT ON TABLE ${defaultSchema}.shift TO guest`));

exports.down = knex => knex.schema.withSchema(defaultSchema).dropTable('shift')
  .then(() => knex.schema.withSchema(defaultSchema).dropTable('schedule'));
