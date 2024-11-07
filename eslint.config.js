import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: [
            "**/*.{js,mjs,cjs,ts,jsx,tsx}"
        ]
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                "dojo": "readonly",
                "dijit": "readonly",
                "dojoConfig": "readonly"
            }
        }
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    {
        settings: {
            react: {
                version: "17"
            }
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "react-hooks/exhaustive-deps": "warn",
            "@typescript-eslint/no-unsafe-declaration-merging": "off"
        }
    }
];