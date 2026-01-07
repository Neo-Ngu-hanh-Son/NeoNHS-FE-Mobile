module.exports = {
  // Use the ts-jest ESM preset so TypeScript + ESM tests work
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {},
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  // collectCoverageFrom: ['src/**/*.{ts,tsx}'], // Collect coverage from all TypeScript files in src
};
