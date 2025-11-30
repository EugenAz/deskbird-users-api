import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './users/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5433,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'deskbird-db-test',
  entities: [User],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.ENVIRONMENT !== 'production',
});
