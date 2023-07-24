import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://graph.amctheatres.com/',
    generates: {
        './src/generated-gql/': {
            preset: 'client',
            // plugins: ['typescript', 'typescript-document-nodes', 'typescript-operations'],
            config: {
                addUnderscoreToArgsType: true,
            },
            presetConfig: {
                fragmentMasking: false,
            },
        },
    },
    documents: ['./src/operations/**/*.ts'],
    emitLegacyCommonJSImports: false,
};

export default config;
