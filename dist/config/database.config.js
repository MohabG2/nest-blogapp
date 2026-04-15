"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const user_entity_1 = require("../users/entities/user.entity");
const blog_entity_1 = require("../blogs/entities/blog.entity");
const databaseConfig = () => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [user_entity_1.User, blog_entity_1.Blog],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
});
exports.databaseConfig = databaseConfig;
//# sourceMappingURL=database.config.js.map