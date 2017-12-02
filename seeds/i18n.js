/* eslint-disable import/no-commonjs */
const path = require('path');

const seedFile = require('knex-seed-file');

exports.seed = knex => {
  const options = {
    columnSeparator: ';',
    ignoreFirstLine: false,
    handleInsert: (inserts, tableName) => knex.raw(
      knex(tableName).insert(inserts).toString().replace('?', '\\?') +
      ' ON CONFLICT DO NOTHING'
    )
  };
  return seedFile(knex, path.resolve('./seeds/translation/language.csv'), 'translation.language', [
      'locale',
      'name',
      'language_code',
      'language_short_code'
    ], options)
    .then(() => seedFile(knex, path.resolve('./seeds/translation/en.csv'), 'translation.translation', [
      'language',
      'key',
      'translation'
    ], options))
    .then(() => seedFile(knex, path.resolve('./seeds/translation/fi_fi.csv'), 'translation.translation', [
      'language',
      'key',
      'translation'
    ], options));
};
