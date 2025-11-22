# Génération des Icônes PWA

Ce dossier contient `icon.svg`, le fichier source de l'icône de l'application.

## Générer les icônes PNG

Pour que la PWA fonctionne correctement, vous devez générer les icônes PNG aux tailles suivantes:
- `icon-192.png` (192x192px)
- `icon-512.png` (512x512px)

### Option 1: ImageMagick (Recommandé)

```bash
# Installation
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick

# Windows
# Télécharger depuis https://imagemagick.org/

# Génération des icônes
convert -background none icon.svg -resize 192x192 icon-192.png
convert -background none icon.svg -resize 512x512 icon-512.png
```

### Option 2: En ligne

1. Allez sur [Convertio](https://convertio.co/svg-png/)
2. Uploadez `icon.svg`
3. Convertissez et téléchargez
4. Redimensionnez à 192x192 et 512x512
5. Renommez en `icon-192.png` et `icon-512.png`
6. Placez dans ce dossier `public/`

### Option 3: Figma / Adobe Illustrator

1. Ouvrez `icon.svg`
2. Exportez en PNG
3. Tailles: 192x192 et 512x512
4. Noms: `icon-192.png` et `icon-512.png`
5. Sauvegardez dans `public/`

## Personnalisation

Vous pouvez personnaliser `icon.svg` avec votre propre design:
- Modifiez les couleurs du gradient
- Changez l'icône Terminal par votre design
- Gardez les dimensions 512x512 pour le viewBox

Une fois les icônes générées, votre PWA sera prête à être installée!
