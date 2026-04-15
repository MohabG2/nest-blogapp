import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { User } from '../users/entities/user.entity';
export declare class BlogsController {
    private readonly blogsService;
    constructor(blogsService: BlogsService);
    create(createBlogDto: CreateBlogDto, user: User): Promise<import("./entities/blog.entity").Blog>;
    findAll(published?: string): Promise<import("./entities/blog.entity").Blog[]>;
    findMine(user: User): Promise<import("./entities/blog.entity").Blog[]>;
    findOne(id: string): Promise<import("./entities/blog.entity").Blog>;
    update(id: string, updateBlogDto: UpdateBlogDto, user: User): Promise<import("./entities/blog.entity").Blog>;
    remove(id: string, user: User): Promise<void>;
}
