module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['xo', 'plugin:prettier/recommended'],
    overrides: [
        {
            env: {
                node: true,
            },
            extends: ['xo', 'plugin:prettier/recommended'],
            files: ['.eslintrc.{js,cjs}'],
            parserOptions: {
                sourceType: 'script',
            },
        },
        {
            extends: ['xo-typescript', 'plugin:prettier/recommended'],
            files: ['*.ts', '*.tsx'],
            rules: {
                '@typescript-eslint/naming-convention': [
                    'error',
                    {
                        selector: 'variable',
                        modifiers: ['const'],
                        format: ['camelCase', 'UPPER_CASE'],
                    },
                ],
                '@typescript-eslint/consistent-indexed-object-style': ['error', 'index-signature'],
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    ignorePatterns: ['src/generated-gql/**/*', 'dist/**/*', 'codegen.ts'],
    rules: {
        'guard-for-in': 'off',
    },
};
