import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/schema.gql",
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        scalars: {
          DateTime: {
            input: "string",
            output: "string",
          },
        },
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
