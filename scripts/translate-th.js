const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const messagesDir = path.join(root, 'src', 'messages');
const sourceFile = path.join(messagesDir, 'en.json');
const targetFile = path.join(messagesDir, 'th.json');

function* walkEntries(obj, pathSegments = []) {
  for (const [key, value] of Object.entries(obj)) {
    const newPath = [...pathSegments, key];
    if (typeof value === 'string') {
      yield { path: newPath, value };
    } else if (value && typeof value === 'object') {
      yield* walkEntries(value, newPath);
    }
  }
}

function getByPath(obj, pathSegments) {
  return pathSegments.reduce((acc, segment) => {
    if (acc && typeof acc === 'object') {
      return acc[segment];
    }
    return undefined;
  }, obj);
}

function setByPath(obj, pathSegments, newValue) {
  let current = obj;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    if (!current[segment] || typeof current[segment] !== 'object') {
      current[segment] = {};
    }
    current = current[segment];
  }
  current[pathSegments[pathSegments.length - 1]] = newValue;
}

function needsTranslation(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const thaiChar = /[\u0E00-\u0E7F]/;
  return !thaiChar.test(trimmed);
}

async function loadTranslator() {
  const translateModule = await import('translate-google');
  const translate = translateModule.default || translateModule;
  if (typeof translate !== 'function') {
    throw new Error('No se pudo obtener la función translate de translate-google');
  }
  return translate;
}

async function translateValue(translate, text) {
  const hasUnderscores = text.includes('_');
  const prepared = hasUnderscores ? text.replace(/_/g, ' ') : text;

  let attempt = 0;
  while (true) {
    attempt += 1;
    try {
      const translated = await translate(prepared, { to: 'th' });
      return hasUnderscores ? translated.replace(/ /g, '_') : translated;
    } catch (error) {
      const waitMs = Math.min(15000, 1000 * attempt);
      console.warn(`Error traduciendo "${text}" (intento ${attempt}): ${error}`);
      console.warn(`Reintentando en ${waitMs}ms...`);
      if (attempt >= 20) {
        console.error(`No se pudo traducir "${text}" tras ${attempt} intentos, se mantiene el texto original.`);
        return text;
      }
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

async function main() {
  const translate = await loadTranslator();
  const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  const target = JSON.parse(fs.readFileSync(targetFile, 'utf8'));

  const entries = Array.from(walkEntries(source));

  for (const entry of entries) {
    const { path: entryPath, value: englishValue } = entry;
    const currentValue = getByPath(target, entryPath);

    if (!needsTranslation(englishValue)) {
      setByPath(target, entryPath, englishValue);
      continue;
    }

    if (!needsTranslation(currentValue)) {
      continue;
    }

    const translated = await translateValue(translate, englishValue);
    if (translated !== englishValue) {
      setByPath(target, entryPath, translated);
      console.log(`[traducción] ${entryPath.join('.')} -> ${translated}`);
    } else {
      setByPath(target, entryPath, englishValue);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  fs.writeFileSync(targetFile, JSON.stringify(target, null, 2), 'utf8');
  console.log(`Archivo actualizado: ${targetFile}`);
}

main().catch((error) => {
  console.error('Fallo la traducción completa a tailandés:', error);
  process.exitCode = 1;
});

