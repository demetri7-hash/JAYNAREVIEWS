#!/bin/bash

# Create placeholder PWA icons for The Pass app
# This script creates simple colored squares as placeholders

ICON_DIR="/workspaces/JAYNAREVIEWS/the-pass/public/icons"
SIZES=(72 96 128 144 152 192 384 512)

# Create a simple SVG template
create_icon() {
    local size=$1
    local filename="$ICON_DIR/icon-${size}x${size}.png"
    
    # Create a simple SVG with The Pass logo placeholder
    cat > "/tmp/icon.svg" << EOF
<svg width="$size" height="$size" xmlns="http://www.w3.org/2000/svg">
  <rect width="$size" height="$size" fill="#2563eb"/>
  <rect x="$(($size/4))" y="$(($size/4))" width="$(($size/2))" height="$(($size/2))" fill="#ffffff" rx="$(($size/16))"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="$(($size/8))" fill="#2563eb" text-anchor="middle" dominant-baseline="middle" font-weight="bold">TP</text>
</svg>
EOF

    # Note: In a real deployment, you would convert SVG to PNG using ImageMagick or similar
    # For now, we'll just copy the SVG as a placeholder
    cp "/tmp/icon.svg" "$filename.svg"
    
    echo "Created placeholder icon: $filename.svg"
}

# Create icons for all sizes
for size in "${SIZES[@]}"; do
    create_icon $size
done

# Create favicon
cat > "$ICON_DIR/../favicon.ico.svg" << 'EOF'
<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#2563eb"/>
  <rect x="8" y="8" width="16" height="16" fill="#ffffff" rx="2"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="10" fill="#2563eb" text-anchor="middle" dominant-baseline="middle" font-weight="bold">TP</text>
</svg>
EOF

echo "Created favicon placeholder"
echo "Note: In production, convert these SVGs to actual PNG/ICO files using ImageMagick or similar tools"
