import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  entities: [User, Blog],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
});
