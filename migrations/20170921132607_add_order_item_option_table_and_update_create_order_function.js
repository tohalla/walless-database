const {defaultSchema} = require('../db');

exports.up = knex => knex.schema.withSchema(defaultSchema).createTable('order_item_option', table => {
    table.integer('order_item')
      .references('id').inTable(`${defaultSchema}.order_item`)
      .onDelete('CASCADE')
      .unsigned()
      .index()
      .notNullable();
    table.integer('option')
      .references('id').inTable(`${defaultSchema}.option`)
      .onDelete('CASCADE')
      .index()
      .unsigned()
      .notNullable();
    table.boolean('value').notNullable();
    table.primary(['order_item', 'option']);
  })
  .then(() => knex.raw(`GRANT INSERT ON ${defaultSchema}.order_item_option TO authenticated_user`))
  .then(() => knex.raw(`ALTER TABLE ${defaultSchema}.order_item_option ENABLE ROW LEVEL SECURITY`))
  .then(() => knex.raw(`
    CREATE POLICY insert_order_item_option ON ${defaultSchema}."order_item_option"
      FOR INSERT TO authenticated_user
    WITH CHECK (EXISTS(
      SELECT FROM ${defaultSchema}.order_item
        JOIN ${defaultSchema}."order" ON "order".id = order_item."order"
      WHERE
        "order".created_by = current_setting('jwt.claims.account_id')::INTEGER AND
        order_item.id = order_item_option.order_item
    ))
  `))
  .then(() => knex.raw(`CREATE TYPE ${defaultSchema}.order_item_with_options AS (
    item INTEGER,
    options ${defaultSchema}.order_item_option[]
  )`))
  .then(() => knex.raw(`DROP FUNCTION ${defaultSchema}.create_order(${defaultSchema}.order, INTEGER[])`))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION ${defaultSchema}.create_order(
      "order" ${defaultSchema}."order",
      items ${defaultSchema}.order_item_with_options[]
    ) RETURNS ${defaultSchema}.order
    AS $$
      DECLARE o RECORD;
      DECLARE i RECORD;
      DECLARE order_item_id INTEGER;
      DECLARE e RECORD;
    BEGIN
      INSERT INTO ${defaultSchema}."order" (created_by, restaurant, serving_location, completed, message, accepted, declined, paid) VALUES
        (
          current_setting('jwt.claims.account_id')::INTEGER,
          "order".restaurant,
          "order".serving_location,
          "order".completed,
          "order".message,
          "order".accepted,
          "order".declined,
          "order".paid
        )
        RETURNING * INTO o;
      FOR i IN SELECT item, options FROM UNNEST(items)
      LOOP
        INSERT INTO ${defaultSchema}.order_item (menu_item, "order") VALUES (i.item, o.id) RETURNING id INTO order_item_id;
        FOR e IN SELECT order_item, option, value FROM UNNEST(i.options)
        LOOP
          IF NOT EXISTS(SELECT FROM ${defaultSchema}.menu_item_option WHERE menu_item_option.option = e.option AND menu_item_option.default_value = e.value) THEN
            INSERT INTO ${defaultSchema}.order_item_option (order_item, option, value) VALUES (order_item_id, e.option, e.value);
          END IF;
        END LOOP;
      END LOOP;
      RETURN o;
    END;
    $$ LANGUAGE plpgsql
  `));

exports.down = knex => knex.raw(`DROP FUNCTION ${defaultSchema}.create_order(${defaultSchema}.order, ${defaultSchema}.order_item_with_options[])`)
  .then(() => knex.raw(`DROP TYPE ${defaultSchema}.order_item_with_options`))
  .then(() => knex.schema.withSchema(defaultSchema).dropTable('order_item_option'))
  .then(() => knex.raw(`
    CREATE OR REPLACE FUNCTION ${defaultSchema}.create_order("order" ${defaultSchema}."order", items INTEGER[]) RETURNS ${defaultSchema}.order
    AS $$
      DECLARE o RECORD;
      DECLARE i RECORD;
    BEGIN
      INSERT INTO ${defaultSchema}."order" (created_by, restaurant, serving_location, completed, message, accepted, declined, paid) VALUES
        (
          current_setting('jwt.claims.account_id')::INTEGER,
          "order".restaurant,
          "order".serving_location,
          "order".completed,
          "order".message,
          "order".accepted,
          "order".declined,
          "order".paid
        )
        RETURNING * INTO o;
      FOR i IN SELECT item FROM UNNEST(items) item
      LOOP
        INSERT INTO ${defaultSchema}.order_item (menu_item, "order") VALUES (i.item, o.id);
      END LOOP;
      RETURN o;
    END;
    $$ LANGUAGE plpgsql
  `));
