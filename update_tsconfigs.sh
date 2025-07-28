#!/bin/bash

# Script to add rootDir and include to all remaining tsconfig.json files

packages=(
    "common"
    "comms"
    "composite"
    "dataflow"
    "dgrid"
    "dgrid2"
    "eclwatch"
    "form"
    "graph"
    "html"
    "layout"
    "map"
    "markdown-it-plugins"
    "observablehq-compiler"
    "other"
    "phosphor"
    "react"
    "timeline"
    "tree"
    "util"
)

for package in "${packages[@]}"; do
    tsconfig_file="packages/$package/tsconfig.json"
    
    if [ -f "$tsconfig_file" ]; then
        echo "Processing $tsconfig_file"
        
        # Check if it needs rootDir and include
        if ! grep -q '"rootDir":' "$tsconfig_file" || ! grep -q '"include":' "$tsconfig_file"; then
            # Read current content and modify
            temp_file=$(mktemp)
            
            # Add rootDir if missing and include if missing
            sed -E '
                /^{$/,/^}$/ {
                    s/("extends": "\.\./tsconfig\.json",)/\1/
                    /^ *"compilerOptions": \{$/a\
        "rootDir": "src",
        "declarationDir": "types",
                    /^}$/i\
    },\
    "include": [\
        "./src/index.ts"\
    ]
                }
            ' "$tsconfig_file" > "$temp_file"
            
            mv "$temp_file" "$tsconfig_file"
        fi
    fi
done

echo "Batch update completed"
