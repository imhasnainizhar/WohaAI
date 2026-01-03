import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@app/(.*)$': '<rootDir>/src/app/$1',
        '^@config/(.*)$': '<rootDir>/src/config/$1',
        '^@clients/(.*)$': '<rootDir>/src/clients/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@schemas/(.*)$': '<rootDir>/src/schemas/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@handlers/(.*)$': '<rootDir>/src/handlers/$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@internals/(.*)$': '<rootDir>/src/internals/$1',
        '^@errors/(.*)$': '<rootDir>/src/errors/$1',
        '^@packages/(.*)$': '<rootDir>../../../packages/$1',
    },
    testMatch: ['**/tests/**/*.ts', '**/?(*.)+(spec|test).ts'],
    verbose: true,
};

export default config;
