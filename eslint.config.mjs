import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import jsoncParser from 'jsonc-eslint-parser';
import n8nPlugin from 'eslint-plugin-n8n-nodes-base';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: dirname, recommendedConfig: js.configs.recommended });

const withFiles = (files, configs) => configs.map((c) => ({ ...c, files }));

export default [
	{
		ignores: ['eslint.config.mjs', '.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: { project: ['./tsconfig.json'], sourceType: 'module', extraFileExtensions: ['.json'] },
		},
	},
	...withFiles(['package.json'], compat.extends('plugin:n8n-nodes-base/community')).map((c) => ({ ...c, languageOptions: { parser: jsoncParser } })),
	...withFiles(['./credentials/**/*.ts'], compat.extends('plugin:n8n-nodes-base/credentials')),
	...withFiles(['./nodes/**/*.ts'], compat.extends('plugin:n8n-nodes-base/nodes')),
	{
		files: ['./credentials/**/*.ts', './nodes/**/*.ts', 'package.json'],
		plugins: { 'n8n-nodes-base': n8nPlugin },
		rules: {
			'n8n-nodes-base/community-package-json-name-still-default': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
			'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
			'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
		},
	},
];
