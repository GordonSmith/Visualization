#!/bin/bash

echo "Checking all tsconfig.json files for required compiler options..."
echo "======================================================"

files_needing_updates=()

while IFS= read -r file; do
    has_rootdir=$(grep -c '"rootDir"' "$file")
    has_declarationdir=$(grep -c '"declarationDir"' "$file")
    
    if [[ $has_rootdir -eq 0 ]] || [[ $has_declarationdir -eq 0 ]]; then
        echo "❌ $file"
        if [[ $has_rootdir -eq 0 ]]; then
            echo "   Missing: rootDir"
        fi
        if [[ $has_declarationdir -eq 0 ]]; then
            echo "   Missing: declarationDir"
        fi
        files_needing_updates+=("$file")
    else
        echo "✅ $file"
    fi
done < <(find . -name "tsconfig.json" -not -path "*/node_modules/*")

echo "======================================================"
echo "Files needing updates: ${#files_needing_updates[@]}"
for file in "${files_needing_updates[@]}"; do
    echo "  $file"
done
