import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://gateway:4000/graphql',
  documents: ['src/**/*.vue', 'src/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'gql-tag-operations-preset',
      plugins: [],
      config: {
        strictScalars: true,
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Money: 'Money',
          Quantity: 'Quantity',
        },
        useTypeImports: true,
      },
    },
  },
};

export default config;
