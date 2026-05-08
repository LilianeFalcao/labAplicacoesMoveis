module.exports = {
    preset: "jest-expo",
    testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    setupFilesAfterEnv: ["<rootDir>/src/jest.setup.ts"],
};
