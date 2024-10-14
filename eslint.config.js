import js from "@eslint/js";
import globals from "globals"

export default [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        ignores: ["node_modules/**"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node
            }
        },
        rules: {
           "no-unused-vars": "warn",
           "no-undef": "warn"
        }
    }
];
