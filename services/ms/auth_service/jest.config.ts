import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
        '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@internals/(.*)$': '<rootDir>/src/internals/$1',
        '^@errors/(.*)$': '<rootDir>/src/errors/$1',
    },
    testMatch: ['**/tests/**/*.ts', '**/?(*.)+(spec|test).ts'],
    verbose: true,
};

export default config;
