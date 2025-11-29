// Script pour générer les icônes PWA à partir du SVG
// Utilisation: node scripts/generate-icons.js

import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

/**
 * Obtient le chemin du fichier actuel.
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Obtient le nom du répertoire du fichier actuel.
 * @type {string}
 */
const __dirname = dirname(__filename);

/**
 * Tableau des tailles d'icônes requises pour la PWA.
 * @type {number[]}
 */
const sizes = [192, 512];

console.log('📱 Génération des icônes PWA...\n');

// Note: Ce script nécessite une bibliothèque de conversion SVG vers PNG
// Vous pouvez utiliser:
// 1. Un outil en ligne: https://convertio.co/svg-png/
// 2. ImageMagick: convert -background none icon.svg -resize 192x192 icon-192.png
// 3. Ou installer sharp: npm install sharp --save-dev

console.log('🎨 Icône source: public/icon.svg');
console.log('\nPour générer les icônes PNG, vous avez plusieurs options:\n');

console.log('Option 1 - ImageMagick (recommandé):');
console.log('  brew install imagemagick  # macOS');
console.log('  apt-get install imagemagick  # Linux');
console.log('  Puis exécutez:');
sizes.forEach(size => {
  console.log(`  convert -background none public/icon.svg -resize ${size}x${size} public/icon-${size}.png`);
});

console.log('\nOption 2 - En ligne:');
console.log('  1. Allez sur https://convertio.co/svg-png/');
console.log('  2. Uploadez public/icon.svg');
console.log('  3. Redimensionnez à 192x192 et 512x512');
console.log('  4. Téléchargez et placez dans public/');

console.log('\nOption 3 - Figma/Adobe Illustrator:');
console.log('  1. Ouvrez public/icon.svg');
console.log('  2. Exportez en PNG aux tailles 192x192 et 512x512');
console.log('  3. Sauvegardez dans public/ avec les noms icon-192.png et icon-512.png');

console.log('\n✅ Une fois les icônes générées, votre PWA sera prête!\n');
