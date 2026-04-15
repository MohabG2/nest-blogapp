import { Blog } from '../../blogs/entities/blog.entity';
export declare class User {
    id: string;
    email: string;
    username: string;
    password: string;
    blogs: Blog[];
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
}
