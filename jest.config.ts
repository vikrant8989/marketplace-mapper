module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Only run our unit tests that exercise route handlers
  testMatch: ["**/*.route.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  clearMocks: true,
}
