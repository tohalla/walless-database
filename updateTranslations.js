const fs = require('fs');
const path = require('path');
const readline = require('readline');
const traman = require('traman');

const reader = readline.createInterface({
  input: fs.createReadStream(
    path.resolve(__dirname, 'seeds', 'translation', 'language.csv')
  )
});

const languages = [];
const getTranslationsForLanguage = language =>
  new Promise((resolve, reject) => {
    const translationPath = path.resolve(
      __dirname, 'seeds', 'translation', `${language}.csv`
    );

    const getTranslations = () => {
      const reader = readline.createInterface({
        input: fs.createReadStream(translationPath)
      });
      const translations = [];
      reader
        .on('line', line => {
          const [, key, translation] = line.split(';');
          if (key) translations[key] = translation;
        })
        .on('close', () => resolve(translations));
    };

    fs.exists(translationPath, exists => exists ?
      getTranslations() : fs.writeFile(translationPath, getTranslations)
    );
  }
);

reader
  .on('line', line => {
    const [locale, language, code, shortCode] = line.split(';');
    languages.push({locale, language, code, shortCode});
  })
  .on('close', async () => {
    const translations = traman.getMissingTranslations(
      await traman.getTranslations({
        languages: traman.parseLanguagesByKey(languages, 'locale'),
        getTranslationsForLanguage
      }),
      {
        includePresent: true,
        missingValue: ''
      }
    );
    Object.keys(translations).forEach(language =>
      fs.writeFile(
        path.resolve(__dirname, 'seeds', 'translation', `${language}.csv`),
        Object.keys(translations[language])
          .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1)
          .map(key => `${language};${key};${translations[language][key]}`)
          .join('\n'),
        err => err ? console.log(err) : console.log(`${language} translations updated`)
      )
    );
  });
