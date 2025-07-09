import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import prettierPlugin from 'eslint-plugin-prettier';

export default defineConfig([
    {
        files: ['**/*.{js,mjs,cjs}'],
        plugins: { js, prettier: prettierPlugin },

        extends: ['js/recommended', 'plugin:prettier/recommended', 'prettier'],
        rules: {
            'prettier/prettier': 'warn',
        },
    },
    {
        files: ['**/*.{js,mjs,cjs}'],
        languageOptions: { globals: globals.browser },
    },
]);
