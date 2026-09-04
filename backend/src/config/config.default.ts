import { MidwayConfig } from '@midwayjs/core';

export default {
  keys: '1234567890',
  koa: {
    port: 7001,
  },
  orm: {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'my_database',
    synchronize: false,
    logging: true,
    entities: ['src/entity/**/*.ts'],
    migrations: ['src/migration/**/*.ts'],
    subscribers: ['src/subscriber/**/*.ts'],
  },
  swagger: {
    title: 'Backend API',
    description: 'Midway.js + TypeORM Backend API',
    version: '1.0.0',
  },
} as MidwayConfig;
