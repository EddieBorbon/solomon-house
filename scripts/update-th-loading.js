const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const messagesDir = path.join(root, 'src', 'messages');
const sourceFile = path.join(messagesDir, 'en.json');
const targetFile = path.join(messagesDir, 'th.json');

async function main() {
  const translateModule = await import('@vitalets/google-translate-api');
  const translate =
    translateModule.translate || translateModule.default?.translate;
  if (typeof translate !== 'function') {
    throw new Error('No se pudo obtener la función translate del módulo');
  }
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

  const loadingKeys = Object.keys(source.loading);
  for (const key of loadingKeys) {
    const original = source.loading[key];
    if (typeof original !== 'string') {
      target.loading[key] = original;
      continue;
    }

    const textForTranslation = original.replace(/_/g, ' ');
    const translation = await translate(textForTranslation, { to: 'th' });
    const translatedText = original.includes('_')
      ? translation.text.replace(/ /g, '_')
      : translation.text;

    target.loading[key] = translatedText;
    console.log(`Translated ${key}: ${translatedText}`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(target, null, 2), 'utf8');
  console.log(`Updated translations written to ${targetFile}`);
}

main().catch((error) => {
  console.error('Failed to update Thai loading translations:', error);
  process.exitCode = 1;
});

