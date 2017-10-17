const {defaultSchema} = require('../db');

const path = require('path');

const seedFile = require('knex-seed-file');

exports.seed = knex => {
  const options = {
    columnSeparator: ';',
    ignoreFirstLine: false,
    handleInsert: (inserts, tableName) =>
      knex.raw(`${knex(tableName).insert(inserts).toString()} ON CONFLICT DO NOTHING`)
  };
  return seedFile(knex, path.resolve('./seeds/currencies.csv'), `${defaultSchema}.currency`, [
      'code',
      'name',
      'symbol',
      'zero_decimal'
    ], options)
    .then(() => seedFile(knex, path.resolve('./seeds/account_role.csv'), `${defaultSchema}.account_role`, [
      'id',
      'name',
      'description',
      'restaurant'
    ], options))
    .then(() => seedFile(knex, path.resolve('./seeds/restaurant_role_rights.csv'), `${defaultSchema}.restaurant_role_rights`, [
      'id',
      'role',
      'restaurant',
      'allow_insert_promotion',
      'allow_update_promotion',
      'allow_delete_promotion',
      'allow_insert_menu',
      'allow_update_menu',
      'allow_delete_menu',
      'allow_insert_menu_item',
      'allow_update_menu_item',
      'allow_delete_menu_item',
      'allow_insert_serving_location',
      'allow_update_serving_location',
      'allow_delete_serving_location',
      'allow_update_restaurant',
      'allow_update_restaurant_roles',
      'allow_map_roles',
      'allow_upload_file',
      'allow_delete_file',
      'allow_view_users',
      'allow_view_user_roles',
      'allow_upload_image',
      'allow_delete_image',
      'allow_update_order',
      'allow_download_qr_codes',
      'allow_messaging_with_customers',
      'is_employee'
    ], options))
    .then(() => seedFile(knex, path.resolve('./seeds/menu_item_type.csv'), `${defaultSchema}.menu_item_type`, [
      'id',
      'name',
      'description'
    ], options))
    .then(() => seedFile(knex, path.resolve('./seeds/menu_item_category.csv'), `${defaultSchema}.menu_item_category`, [
      'id',
      'name',
      'type',
      'description'
    ], options));
  };
