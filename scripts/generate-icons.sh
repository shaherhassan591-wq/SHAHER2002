#!/usr/bin/env bash
set -euo pipefail

# generate-icons.sh
# Usage: ./scripts/generate-icons.sh [background_hex]
# Requires: ImageMagick (convert)
# Input: resources/icon-source.png
# Output: places generated icons under android/, ios/, public/icons/ and ./icons-out/

INPUT="resources/icon-source.png"
BG_COLOR="${1:-#0b2540}"
OUT_DIR="icons-out"

if ! command -v convert >/dev/null 2>&1; then
  echo "ImageMagick 'convert' not found. Install it and re-run."
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "Source image $INPUT not found. Please place your original PNG at $INPUT"
  exit 1
fi

mkdir -p "$OUT_DIR"

# Helper: produce a squared canvas with background (no alpha)
render() {
  local size=$1
  local dest=$2
  convert "$INPUT" -resize ${size}x${size}^ -gravity center -extent ${size}x${size} -background "$BG_COLOR" +repage "$dest"
}

echo "Generating Play Store icon (512x512)..."
render 512 "$OUT_DIR/playstore-512.png"
cp "$OUT_DIR/playstore-512.png" ./playstore-icon.png

# Android mipmap sizes
declare -a AND_SIZES=(48 72 96 144 192)
declare -a AND_DENS=(mdpi hdpi xhdpi xxhdpi xxxhdpi)
for i in "${!AND_SIZES[@]}"; do
  size=${AND_SIZES[$i]}
  dens=${AND_DENS[$i]}
  dest_dir="android/app/src/main/res/mipmap-${dens}"
  mkdir -p "$dest_dir"
  dest="$dest_dir/ic_launcher.png"
  echo "Generating Android $dens ($size x $size) -> $dest"
  render $size "$dest"
done

# Adaptive icon (foreground + background) - we'll put the generated image as foreground
mkdir -p android/app/src/main/res/mipmap-anydpi-v26
render 432 "$OUT_DIR/adaptive_foreground.png"
convert -size 432x432 xc:"$BG_COLOR" -gravity center -extent 432x432 "$OUT_DIR/adaptive_background.png"
cp "$OUT_DIR/adaptive_foreground.png" android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_foreground.png
cp "$OUT_DIR/adaptive_background.png" android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_background.png

# iOS AppIcon sizes (creates AppIcon.appiconset)
IOS_APPICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$IOS_APPICON_DIR"

# List of {size,idiom,scale,filename}
# We'll generate the commonly required sizes for App Store and app icons
# Format: sizePx filename (we compute from pt * scale)

echo "Generating iOS AppIcon images..."

# Create mapping: each line is "pt scale" -> px size = pt*scale
# We'll enumerate common sizes (pt values): 20,29,40,60,76,83.5,1024 (App Store)
# For simplicity generate explicit px sizes used by Xcode:
IOS_PX_SIZES=(20 29 40 60 76 83.5) # pt values
IOS_SCALES=(1 2 3)

# produce explicit list used by many apps (pixels)
# We'll produce these concrete px sizes: (20@1x=20),(20@2x=40),(20@3x=60)... etc

generate_ios_image() {
  local px=$1
  local name=$2
  render $px "$IOS_APPICON_DIR/$name"
}

# Manual list of required icon filenames & px sizes (common set)
# (filename, px)
cat > "$IOS_APPICON_DIR/filenames.txt" <<EOF
Icon-App-20x20@1x.png 20
Icon-App-20x20@2x.png 40
Icon-App-20x20@3x.png 60
Icon-App-29x29@1x.png 29
Icon-App-29x29@2x.png 58
Icon-App-29x29@3x.png 87
Icon-App-40x40@1x.png 40
Icon-App-40x40@2x.png 80
Icon-App-40x40@3x.png 120
Icon-App-60x60@2x.png 120
Icon-App-60x60@3x.png 180
Icon-App-76x76@1x.png 76
Icon-App-76x76@2x.png 152
Icon-App-83.5x83.5@2x.png 167
Icon-App-1024x1024@1x.png 1024
EOF

while read -r fname px; do
  echo "Generating iOS $fname (${px}x${px})"
  render $px "$IOS_APPICON_DIR/$fname"
done < "$IOS_APPICON_DIR/filenames.txt"

# Create Contents.json for Xcode (basic, includes the icons we generated)
cat > "$IOS_APPICON_DIR/Contents.json" <<'JSON'
{
  "images" : [
    { "idiom" : "iphone", "size" : "20x20", "scale" : "2x", "filename" : "Icon-App-20x20@2x.png" },
    { "idiom" : "iphone", "size" : "20x20", "scale" : "3x", "filename" : "Icon-App-20x20@3x.png" },

    { "idiom" : "iphone", "size" : "29x29", "scale" : "2x", "filename" : "Icon-App-29x29@2x.png" },
    { "idiom" : "iphone", "size" : "29x29", "scale" : "3x", "filename" : "Icon-App-29x29@3x.png" },

    { "idiom" : "iphone", "size" : "40x40", "scale" : "2x", "filename" : "Icon-App-40x40@2x.png" },
    { "idiom" : "iphone", "size" : "40x40", "scale" : "3x", "filename" : "Icon-App-40x40@3x.png" },

    { "idiom" : "iphone", "size" : "60x60", "scale" : "2x", "filename" : "Icon-App-60x60@2x.png" },
    { "idiom" : "iphone", "size" : "60x60", "scale" : "3x", "filename" : "Icon-App-60x60@3x.png" },

    { "idiom" : "ipad", "size" : "76x76", "scale" : "1x", "filename" : "Icon-App-76x76@1x.png" },
    { "idiom" : "ipad", "size" : "76x76", "scale" : "2x", "filename" : "Icon-App-76x76@2x.png" },
    { "idiom" : "ipad", "size" : "83.5x83.5", "scale" : "2x", "filename" : "Icon-App-83.5x83.5@2x.png" },

    { "idiom" : "ios-marketing", "size" : "1024x1024", "scale" : "1x", "filename" : "Icon-App-1024x1024@1x.png" }
  ],
  "info" : {
    "version" : 1,
    "author" : "xcode"
  }
}
JSON

# Web icons
mkdir -p public/icons
render 16 public/icons/favicon-16.png
render 32 public/icons/favicon-32.png
render 180 public/icons/apple-touch-icon.png
render 192 public/icons/icon-192.png
render 512 public/icons/icon-512.png

# Copy some outputs to icons-out for review
cp public/icons/* "$OUT_DIR/" || true

echo "Done. Generated icons in $OUT_DIR/ and project folders."

echo "Notes:
- Verify paths for ios App target: ios/App/App/ may vary in your project; adjust IOS_APPICON_DIR variable if needed.
- Xcode expects non-transparent App Store icon (1024x1024) — this script composites a background color to eliminate alpha.
- For Android adaptive icons you may want to customize foreground/background XML in AndroidManifest or res/mipmap-anydpi-v26/ic_launcher.xml.
"
