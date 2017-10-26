const {defaultSchema} = require('../db');

exports.up = knex => knex.raw(`DROP TRIGGER insert_order_trigger ON ${defaultSchema}.order`)
  .then(() => knex.raw(`DROP TRIGGER delete_order_trigger ON ${defaultSchema}.order`))
  .then(() => knex.raw(`
    CREATE TRIGGER delete_order_trigger AFTER DELETE ON ${defaultSchema}.order
      FOR EACH ROW EXECUTE PROCEDURE ${defaultSchema}.notify_update()
  `))
  .then(() => knex.raw(`
    CREATE TRIGGER insert_order_trigger AFTER INSERT ON ${defaultSchema}.order
      FOR EACH ROW EXECUTE PROCEDURE ${defaultSchema}.notify_update()
  `));

exports.down = knex => {};
