import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';
export declare class BlogsService {
    private readonly blogRepository;
    constructor(blogRepository: Repository<Blog>);
    create(createBlogDto: CreateBlogDto, author: User): Promise<Blog>;
    findAll(published?: boolean): Promise<Blog[]>;
    findByAuthor(authorId: string): Promise<Blog[]>;
    findOne(id: string): Promise<Blog>;
    update(id: string, updateBlogDto: UpdateBlogDto, userId: string): Promise<Blog>;
    remove(id: string, userId: string): Promise<void>;
}
