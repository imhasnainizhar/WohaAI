import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/main/app/$1',
    '^@config/(.*)$': '<rootDir>/main/config/$1',
    '^@routes/(.*)$': '<rootDir>/main/routes/$1',
    '^@middleware/(.*)$': '<rootDir>/main/middleware/$1',
    '^@schemas/(.*)$': '<rootDir>/main/schemas/$1',
    '^@services/(.*)$': '<rootDir>/main/services/$1',
    '^@controllers/(.*)$': '<rootDir>/main/controllers/$1',
    '^@utils/(.*)$': '<rootDir>/main/utils/$1',
    '^@custom_types/(.*)$': '<rootDir>/main/custom_types/$1',
    '^@errors/(.*)$': '<rootDir>/main/errors/$1',
  },
  testMatch: ['**/tests/**/*.ts', '**/?(*.)+(spec|test).ts'],
  verbose: true,
};

export default config;
