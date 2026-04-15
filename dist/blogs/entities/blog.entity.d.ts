import { User } from '../../users/entities/user.entity';
export declare class Blog {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    published: boolean;
    author: User;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}
